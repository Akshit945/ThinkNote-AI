import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import dotenv from "dotenv";

dotenv.config();

/* ---------------- EMBEDDINGS ---------------- */

const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: process.env.OPENAI_API_KEY,
});

/* ---------------- VECTOR STORE INSTANCE ---------------- */

let vectorStoreInstance = null;

const getVectorStore = async () => {
    try {
        if (!vectorStoreInstance) {
            vectorStoreInstance = await QdrantVectorStore.fromExistingCollection(
                embeddings,
                {
                    url: process.env.QDRANT_URL,
                    apiKey: process.env.QDRANT_API_KEY,
                    collectionName: "rag-collection",
                }
            );
        }

        return vectorStoreInstance;
    } catch (error) {
        console.error("Error creating Qdrant vector store:", error);
        throw error;
    }
};

/* ---------------- DOCUMENT INDEXING ---------------- */

export const indexDocumentToQdrant = async (data, metadata) => {
    try {
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        let docs = [];

        if (Array.isArray(data)) {
            docs = await textSplitter.splitDocuments(
                data.map((doc) => {
                    doc.metadata = { ...doc.metadata, ...metadata };
                    return doc;
                })
            );
        } else {
            docs = await textSplitter.createDocuments([data], [metadata]);
        }

        const vectorStore = await getVectorStore();

        /* -------- BATCH INSERT (avoids 32MB payload error) -------- */

        const BATCH_SIZE = 50;

        for (let i = 0; i < docs.length; i += BATCH_SIZE) {
            const batch = docs.slice(i, i + BATCH_SIZE);

            await vectorStore.addDocuments(batch);
        }

        // console.log(`Indexed ${docs.length} chunks to Qdrant`);

        return true;
    } catch (err) {
        console.error("Error indexing to Qdrant:", err);
        throw err;
    }
};

/* ---------------- VECTOR SEARCH ---------------- */

export const searchSimilarChunks = async (
    query,
    notebookId,
    limit = 8,
    selectedSources = []
) => {
    try {
        const vectorStore = await getVectorStore();

        const filter = {
            must: [
                {
                    key: "metadata.notebookId",
                    match: { value: notebookId },
                },
            ],
        };

        if (selectedSources.length > 0) {
            filter.must.push({
                key: "metadata.sourceId",
                match: { any: selectedSources },
            });
        }

        const results = await vectorStore.similaritySearchWithScore(
            query,
            limit,
            filter
        );

        /* -------- FILTER LOW RELEVANCE -------- */

        const MIN_SCORE = 0.20;

        const filteredResults = results
            .filter(([doc, score]) => {
                console.log(doc, score);
                return score >= MIN_SCORE
            })
            .map(([doc]) => doc);

        // console.log("Qdrant results:", filteredResults);

        return filteredResults;
    } catch (err) {
        console.error("Error searching Qdrant:", err);
        throw err;
    }
};