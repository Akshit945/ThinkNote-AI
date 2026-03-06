import express from 'express';
import Notebook from '../models/Notebook.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { runAdvancedRAGPipeline } from '../utils/ragPipeline.js';
import { searchSimilarChunks } from '../utils/qdrant.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const MAX_DAILY_TOKENS = 100000;

async function checkTokenLimit(userId, tokensToAdd = 0) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const now = new Date();
    const lastReset = user.lastTokenReset || new Date(0);

    if (now.getDate() !== lastReset.getDate() || now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        user.dailyTokenUsage = 0;
        user.lastTokenReset = now;
    }

    if (user.dailyTokenUsage >= MAX_DAILY_TOKENS && tokensToAdd === 0) {
        const err = new Error('Daily token limit reached. Read-only mode active.');
        err.status = 403;
        throw err;
    }

    if (tokensToAdd > 0) {
        user.dailyTokenUsage += tokensToAdd;
    }

    await user.save();
    return user;
}

router.get('/:notebookId', auth, async (req, res) => {
    try {
        const { notebookId } = req.params;
        const notebook = await Notebook.findOne({ _id: notebookId, owner: req.user });
        if (!notebook) return res.status(404).json({ message: 'Notebook not found' });

        const messages = await Message.find({ notebook: notebookId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:notebookId', auth, async (req, res) => {
    try {
        const { notebookId } = req.params;
        const { query, selectedSources } = req.body;

        if (!query) {
            return res.status(400).json({ message: 'Query is required' });
        }

        // Verify ownership
        const notebook = await Notebook.findOne({ _id: notebookId, owner: req.user });
        if (!notebook) {
            return res.status(404).json({ message: 'Notebook not found' });
        }

        // Token Limit Check
        await checkTokenLimit(req.user);

        // Save the user query to db
        const userMsg = new Message({
            notebook: notebookId,
            role: 'user',
            content: query
        });
        await userMsg.save();

        // Fetch past messages for context BEFORE building the query
        const pastMessages = await Message.find({ notebook: notebookId })
            .sort({ createdAt: -1 })
            .limit(10); // last 10 messages for context
        pastMessages.reverse();

        const chatContext = pastMessages.map(m => ({
            role: m.role,
            content: m.content
        }));

        // 1. Run the Advanced 9-Step RAG Pipeline
        const top8Chunks = await runAdvancedRAGPipeline(query, notebookId, selectedSources, chatContext);

        // 2. Format Context
        const contextStr = top8Chunks.map((chunk, index) => {
            let titleStr = chunk.metadata?.title || 'Unknown Source';
            if (chunk.metadata?.loc?.pageNumber) {
                titleStr += ` - Page ${chunk.metadata.loc.pageNumber}`;
            }
            return `--- Document ${index + 1} (${titleStr}) ---\n${chunk.pageContent}`;
        }).join("\n\n");
        // console.log("contextStr", contextStr);

        const SYSTEM_PROMPT = `
            You are an AI assistant helping students inside a notebook.

            Answer the user's question using ONLY the provided context.

            Rules:
            - If the context contains the answer, explain it clearly.
            - If multiple documents contain information, combine them.
            - If the context does NOT contain the answer, say:
            "The provided sources do not contain enough information to answer this question."
            -Dont write something like this [Documents 1, 4, and 7] in the answer .

            Context:
            ${contextStr}
        `;

        // Generate OpenAI completion with history context
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...chatContext,
                { role: 'user', content: query }
            ],
            temperature: 0.3,
        });

        const answer = response.choices[0].message.content;
        const usage = response.usage;
        console.log("usage", usage);
        if (usage && usage.total_tokens) {
            await checkTokenLimit(req.user, usage.total_tokens);
        }

        const aiMsg = new Message({
            notebook: notebookId,
            role: 'assistant',
            content: answer,
            sources: top8Chunks.map(c => c.metadata)
        });
        await aiMsg.save();

        res.json({
            answer,
            sources: aiMsg.sources
        });

    } catch (err) {
        console.error('Chat error:', err);
        const status = err.status || 500;
        res.status(status).json({ error: err.message });
    }
});

// Generate a Quiz from selected sources
router.post('/:notebookId/quiz', auth, async (req, res) => {
    try {
        const { notebookId } = req.params;
        const { selectedSources } = req.body;

        const notebook = await Notebook.findOne({ _id: notebookId, owner: req.user });
        if (!notebook) {
            return res.status(404).json({ message: 'Notebook not found' });
        }

        // Token Limit Check
        await checkTokenLimit(req.user);

        // 1. Broad fetch for quiz context (up to 20 chunks should be plenty for 10 questions)
        const quizQueryStr = "Core factual concepts, summaries, definitions, key events, and important entities suitable for multiple choice questions.";
        const chunks = await searchSimilarChunks(quizQueryStr, notebookId, 20, selectedSources);

        if (!chunks || chunks.length === 0) {
            return res.status(400).json({ message: 'No content found in selected sources to generate a quiz.' });
        }

        const contextStr = chunks.map((chunk, index) => {
            return `--- Extract ${index + 1} ---\n${chunk.pageContent}`;
        }).join("\n\n");

        const SYSTEM_PROMPT = `
            You are an expert educator creating a challenging, accurate multiple-choice quiz.
            Using ONLY the provided context extracts, generate exactly 10 multiple-choice questions.

            Output strictly as a JSON object with this exact schema:
            {
            "quiz": [
                {
                "question": "The question text?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "answer": "The exact string of the correct option",
                "explanation": "Brief reasoning based on the text."
                }
            ]
            }

            Context Extracts:
            ${contextStr}
        `;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'system', content: SYSTEM_PROMPT }],
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const quizData = JSON.parse(response.choices[0].message.content);
        const usage = response.usage;

        if (usage && usage.total_tokens) {
            await checkTokenLimit(req.user, usage.total_tokens);
        }

        res.json(quizData);

    } catch (err) {
        console.error('Quiz generation error:', err);
        const status = err.status || 500;
        res.status(status).json({ error: err.message });
    }
});

export default router;
