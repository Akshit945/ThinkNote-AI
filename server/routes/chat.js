import express from 'express';
import Notebook from '../models/Notebook.js';
import Message from '../models/Message.js';
import { auth } from '../middleware/auth.js';
import { runAdvancedRAGPipeline } from '../utils/ragPipeline.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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
            model: 'gpt-4o', // or 'gpt-4'/'gpt-3.5-turbo' based on availability
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...chatContext,
                { role: 'user', content: query }
            ],
            temperature: 0.3,
        });

        const answer = response.choices[0].message.content;

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
        res.status(500).json({ error: err.message });
    }
});

export default router;
