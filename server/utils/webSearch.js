import { tavily } from "@tavily/core";
import dotenv from "dotenv";
dotenv.config();

export const extractTextFromWebSearch = async (query) => {
    if (!process.env.TAVILY_API_KEY) {
        throw new Error("TAVILY_API_KEY is not defined in environment variables. Please create an account at tavily.com and add the key to your .env file.");
    }

    try {
        const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

        const response = await tvly.search(query, {
            searchDepth: "basic",
            includeRawContent: true,
            maxResults: 5
        });

        if (!response.results || response.results.length === 0) {
            throw new Error(`No results found for query: ${query}`);
        }

        // Combine the results into a single comprehensive text document
        let combinedText = `### WEB SEARCH RESULTS FOR: "${query}" ###\n\n`;

        response.results.forEach((result, index) => {
            combinedText += `\n--- SOURCE ${index + 1}: ${result.title} ---\n`;
            combinedText += `URL: ${result.url}\n`;

            // If raw content is available (Tavily often provides markdown clean text here), use it
            // Otherwise fallback to the snippet
            if (result.rawContent) {
                combinedText += `\nCONTENT:\n${result.rawContent}\n`;
            } else {
                combinedText += `\nSUMMARY:\n${result.content}\n`;
            }

            combinedText += `\n`;
        });

        return combinedText;
    } catch (error) {
        console.error("Error performing Tavily web search:", error);
        throw new Error(`Web search failed: ${error.message}`);
    }
};
