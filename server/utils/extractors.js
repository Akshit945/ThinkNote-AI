import axios from 'axios';
import * as cheerio from 'cheerio';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { YoutubeTranscript } from 'youtube-transcript';

export const extractTextFromPdf = async (filePath) => {
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    return docs; // Return array of Langchain document objects to keep loc.pageNumber
};

export const extractTextFromUrl = async (url) => {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        // Remove scripts and styles
        $('script, style, noscript, iframe, link').remove();
        // Get text and replace multiple spaces/newlines with single ones
        let text = $('body').text().replace(/\s+/g, ' ').trim();
        return text;
    } catch (err) {
        console.error('Error extracting text from URL:', err);
        throw new Error('Failed to extract text from website');
    }
};

export async function extractTextFromYoutube(url) {
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(url);

        const text = transcript
            .map((item) => item.text)
            .join(" ");

        return text;

    } catch (err) {
        console.error("Error extracting transcript:", err);
        throw new Error("Transcript extraction failed");
    }
}
