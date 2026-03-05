import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import dotenv from 'dotenv';
dotenv.config();

const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
    openAIApiKey: process.env.OPENAI_API_KEY,
});
let vectorStoreInstance = null;

const getVectorStore = async () => {
    if (!vectorStoreInstance) {
        vectorStoreInstance = await QdrantVectorStore.fromExistingCollection(
            embeddings, {
            url: process.env.QDRANT_URL,
            apiKey: process.env.QDRANT_API_KEY,
            collectionName: 'rag-collection',
        }
        );
    }
    return vectorStoreInstance;
};


export const indexDocumentToQdrant = async (data, metadata) => {
    try {
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        let docs;
        if (Array.isArray(data)) {
            // It's an array of LangChain Document objects (e.g. from PDFLoader)
            docs = await textSplitter.splitDocuments(
                data.map(doc => {
                    // Merge original metadata (like loc.pageNumber) with our custom metadata
                    doc.metadata = { ...doc.metadata, ...metadata };
                    return doc;
                })
            );
        } else {
            // It's a plain string
            docs = await textSplitter.createDocuments([data], [metadata]);
        }

        await QdrantVectorStore.fromDocuments(docs, embeddings, {
            url: process.env.QDRANT_URL,
            apiKey: process.env.QDRANT_API_KEY,
            collectionName: 'rag-collection',
        });

        return true;
    } catch (err) {
        console.error('Error indexing to Qdrant:', err);
        throw err;
    }
};

export const searchSimilarChunks = async (query, notebookId, limit = 4, selectedSources = []) => {
    try {
        const vectorStore = await getVectorStore();

        const filter = {
            must: [
                {
                    key: "metadata.notebookId",
                    match: { value: notebookId }
                }
            ]
        };

        if (selectedSources && selectedSources.length > 0) {
            filter.must.push({
                key: "metadata.sourceId",
                match: { any: selectedSources }
            });
        }

        const results = await vectorStore.similaritySearchWithScore(query, limit, filter);

        // Filter out low relevance results (Cosine similarity score)
        // Adjust this threshold between 0.0 and 1.0 depending on your needs
        const minRelevanceScore = 0.0;
        const filteredResults = results
            .filter(([doc, score]) => {
                console.log('QDRANT SCORE:', doc, score);
                return score >= minRelevanceScore
            })
            .map(([doc, score]) => doc);

        console.log('QDRANT RESULTS:', filteredResults);

        return filteredResults;
    } catch (err) {
        console.error('Error searching in Qdrant:', err);
        throw err;
    }
};
