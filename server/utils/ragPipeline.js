import OpenAI from 'openai';
import { searchSimilarChunks } from './qdrant.js';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 1. Query Correction
 */
async function correctQuery(query, chatHistory) {
    // console.log("--- 1. Query Correction ---");
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Faster, cheaper for simple tasks
        messages: [
            {
                role: 'system',
                content: `You are an AI assistant that corrects typos and clarifies intent. 
                Rewrite the user's raw query based on conversation history. 
                Keep it concise and do not answer the query. Return ONLY the rewritten query.`
            },
            ...chatHistory.map(m => ({ role: m.role, content: m.content })).slice(-4), // Context
            { role: 'user', content: `Raw query: ${query}` }
        ],
        temperature: 0.1,
    });
    const correctedQuery = response.choices[0].message.content.trim();
    // console.log("corrected query", correctedQuery);

    return correctedQuery;
}

/**
 * 2. Query Expansion (5 Variations)
 */
async function expandQuery(correctedQuery) {
    // console.log("--- 2. Query Expansion ---");
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: `You are an expert researcher. 
                Given a query, generate 5 distinct search queries or perspectives that would help gather comprehensive information to answer it.
                Return ONLY the 5 queries separated by newlines.`
            },
            { role: 'user', content: correctedQuery }
        ],
        temperature: 0.7,
    });

    const variations = response.choices[0].message.content
        .split('\n')
        .map(q => q.replace(/^\d+\.\s*/, '').trim()) // Remove "1. " list styling if exists
        .filter(q => q.length > 0)
        .slice(0, 5);

    return variations;
}

/**
 * 3. HyDE Generation (Batch)
 */
async function generateHyDE(queries) {
    if (!Array.isArray(queries) || queries.length === 0) return [];

    try {
        const promptContext = queries.map((q, idx) => `Query ${idx}: ${q}`).join('\n');

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `Please write a brief hypothetical document or passage (1-2 paragraphs) that perfectly answers each of the user's queries. 
                    Even if you don't know the exact factual answer, generate a highly plausible, professional-sounding passage containing expected terms and concepts.
                    You MUST return a JSON object with a single key "documents" that contains an array of strings. Each string must be the hypothetical document corresponding to the query index.
                    Example: {"documents": ["doc1 for query 0", "doc2 for query 1"]}`
                },
                {
                    role: 'user',
                    content: `Generate a hypothetical document for each of these queries:\n${promptContext}`
                }
            ],
            temperature: 0.5,
            response_format: { type: "json_object" } // Using json_object format (must wrap the array in an object)
        });

        const rawResponse = response.choices[0].message.content;
        try {
            const parsed = JSON.parse(rawResponse);
            // Expected format: { "documents": [...] }
            const docsList = Array.isArray(parsed.documents) ? parsed.documents :
                (Array.isArray(parsed) ? parsed : Object.values(parsed)[0]);

            if (Array.isArray(docsList)) {
                // Ensure we map back strings 
                return docsList.map(doc => typeof doc === 'string' ? doc : (doc.text || doc.document || JSON.stringify(doc)));
            }
            return queries.map(() => "");
        } catch (e) {
            console.error("Failed to parse HyDE JSON batch:", e);
            return queries.map(() => "");
        }
    } catch (err) {
        console.error("Batch HyDE error:", err);
        return queries.map(() => "");
    }
}

/**
 * 6. & 7. Re-Ranking Model
 */
async function rerankDocuments(originalQuery, candidateDocs) {
    if (candidateDocs.length === 0) return [];

    try {
        const promptContext = candidateDocs.map((doc, idx) => {
            return `Doc${idx}:\nTitle: ${doc.metadata?.title || 'Unknown'}\nContent: ${doc.pageContent.substring(0, 800)}`;
        }).join('\n\n');

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are a relevance scoring engine.
                    Rate the relevance of these documents to the user's query on a scale of 0 to 10.
                    0 means completely irrelevant. 10 means it directly and comprehensively answers the query.
                    Return ONLY a JSON array of objects with keys 'docIndex' and 'score'.
                    Example: [{"docIndex": 0, "score": 8}, {"docIndex": 1, "score": 4}]`
                },
                {
                    role: 'user',
                    content: `Query: ${originalQuery}\n\nDocuments:\n${promptContext}`
                }
            ],
            temperature: 0,
            response_format: { type: "json_object" } // While strict JSON is best, this ensures array-wrapped-in-object format if using JSON mode, but standard string array is fine. Let's ask for an object wrapper.
        });

        // Parse JSON safely
        let scoresMap = new Map();
        try {
            // The prompt requests an array, typically JSON mode requires an object. So we adjust system prompt slightly or just parse.
            const parsed = JSON.parse(response.choices[0].message.content);
            const scoreArray = Array.isArray(parsed) ? parsed : (parsed.scores || parsed.results || Object.values(parsed)[0]);

            if (Array.isArray(scoreArray)) {
                scoreArray.forEach(item => {
                    scoresMap.set(item.docIndex ?? item.doc, item.score ?? 0);
                });
            }
        } catch (parseError) {
            console.error("Failed to parse rerank JSON", parseError, response.choices[0].message.content);
        }

        const scoredDocs = candidateDocs.map((doc, idx) => ({
            ...doc,
            rerankScore: scoresMap.get(idx) ?? 0
        }));

        scoredDocs.sort((a, b) => {
            if (b.rerankScore !== a.rerankScore) {
                return b.rerankScore - a.rerankScore;
            }
            return b._frequencyScore - a._frequencyScore;
        });

        return scoredDocs;
    } catch (e) {
        console.error("Scoring error:", e);
        return candidateDocs.map(doc => ({ ...doc, rerankScore: 0 }));
    }
}

/**
 * MAIN: Advanced RAG Pipeline Execution
 */
export async function runAdvancedRAGPipeline(rawQuery, notebookId, selectedSources, chatHistory) {
    // console.log(`\n============ Starting RAG Pipeline ============`);
    // console.time("TotalRAGTime");

    // 1. Query Correction
    // console.time("Step-1-Correction");
    const correctedQuery = await correctQuery(rawQuery, chatHistory);

    // Always include original corrected query
    // console.timeEnd("Step-1-Correction");

    // 2. Query Expansion (Generate 5 searches based on corrected query)
    // console.time("Step-2-Expansion");
    // We add the original corrected query into the mix explicitly, ensuring 6 queries total.
    const expandedQueries = await expandQuery(correctedQuery);
    const allQueries = [correctedQuery, ...expandedQueries];
    // console.log("All Search Queries:", allQueries);
    // console.timeEnd("Step-2-Expansion");

    // 3. HyDE Generation (Batch)
    // console.time("Step-3-HyDE");
    const hydeDocs = await generateHyDE(allQueries);
    // console.log("HyDE Docs:", hydeDocs);
    // console.timeEnd("Step-3-HyDE");


    // Mix the queries for retrieval: the HyDE doc corresponding to each query + the queries themselves (6+6=12 queries)
    const searchQueries = [...allQueries, ...hydeDocs.filter(d => typeof d === 'string' && d.length > 0)];
    // console.log('searchQueries', searchQueries);

    // 4. Vector Search (Top 8 for each)
    // console.time("Step-4-Retrieval");
    const vectorSearchPromises = searchQueries.map(async (q) => {
        const chunks = await searchSimilarChunks(q, notebookId, 5, selectedSources);
        return chunks;
    });
    const rawChunksNested = await Promise.all(vectorSearchPromises);

    // console.timeEnd("Step-4-Retrieval");

    // 5. Deduplication + Frequency Count
    // console.time("Step-5-Dedup");
    const chunkMap = new Map();

    const allChunks = rawChunksNested.flat();

    for (const chunk of allChunks) {
        const meta = chunk.metadata;

        let hashableKey = "";
        if (meta && meta.sourceId) {
            hashableKey = `${meta.sourceId}`;
            if (meta.loc?.pageNumber) hashableKey += `-${meta.loc.pageNumber}`;
            if (meta.loc?.lines?.from) hashableKey += `-${meta.loc.lines.from}`;
        }

        if (chunkMap.has(hashableKey)) {
            const existing = chunkMap.get(hashableKey);
            existing._frequencyScore += 1;
            // Retain the highest Qdrant score found for this chunk across all query variations
            if (chunk.qdrantScore > existing.qdrantScore) {
                existing.qdrantScore = chunk.qdrantScore;
            }
        } else {
            chunkMap.set(hashableKey, {
                ...chunk,
                _frequencyScore: 1
            });
        }
    }

    const pooledDocs = Array.from(chunkMap.values())
        .map(doc => {
            // Frequency adds a modest 0.05 score boost per extra search axis that discovered the chunk
            doc._hybridScore = (doc.qdrantScore || 0) + ((doc._frequencyScore - 1) * 0.05);
            return doc;
        })
        .sort((a, b) => b._hybridScore - a._hybridScore);

    // console.log(`Document Pool Size after deduplication: ${pooledDocs.length}`);

    // console.timeEnd("Step-5-Dedup");

    // 6. & 7. Ranking & Re-Ranking Model
    // console.time("Step-6&7-Re-ranking");
    // To save time & cost, only rerank the top 20 most frequent & relevant chunks
    const docsToRerank = pooledDocs.slice(0, 20);

    const rerankedDocs = await rerankDocuments(correctedQuery, docsToRerank);
    // console.timeEnd("Step-6&7-Re-ranking");

    // 8. Top 8 Documents
    const FINAL_TOP_K = 8;
    const top8Docs = rerankedDocs.slice(0, FINAL_TOP_K);

    // console.log("Corrected Query:", correctedQuery);
    // console.log("Retrieved Chunks (Total):", allChunks.length);
    // console.log("Final Top Docs:", top8Docs.length);


    // console.timeEnd("TotalRAGTime");
    // console.log(`============ RAG Pipeline Complete ============\n`);

    return top8Docs;
}
