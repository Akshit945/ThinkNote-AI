import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Source from '../models/Source.js';
import Notebook from '../models/Notebook.js';
import { auth } from '../middleware/auth.js';
import { uploadPdfToCloudinary } from '../utils/cloudinary.js';
import { indexDocumentToQdrant } from '../utils/qdrant.js';
import {
    extractTextFromPdf,
    extractTextFromUrl,
    extractTextFromYoutube
} from '../utils/extractors.js';
import { extractTextFromWebSearch } from '../utils/webSearch.js';

const router = express.Router();

// Setup Multer to save files temporarily
const upload = multer({ dest: '/tmp' });
// Add a new source to a notebook
router.post('/:notebookId', auth, upload.single('file'), async (req, res) => {
    try {
        const { notebookId } = req.params;
        const { type, content, title } = req.body;


        // Verify notebook ownership
        const notebook = await Notebook.findOne({ _id: notebookId, owner: req.user });
        if (!notebook) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Notebook not found' });
        }

        let sourceContent = content; // Can be a URL, Text, or Cloudinary URL
        let extractedText = '';

        // Handle File Upload vs Other Types
        if (type === 'pdf') {
            if (!req.file) {
                return res.status(400).json({ message: 'No PDF file uploaded' });
            }
            // 1. Extract text
            extractedText = await extractTextFromPdf(req.file.path);
            // 2. Upload to Cloudinary
            sourceContent = await uploadPdfToCloudinary(req.file.path);
            // Cleanup temp file
            fs.unlinkSync(req.file.path);
        } else if (type === 'url') {
            extractedText = await extractTextFromUrl(content);
        } else if (type === 'youtube') {
            extractedText = await extractTextFromYoutube(content);
        } else if (type === 'text') {
            extractedText = content;
        } else if (type === 'web_search') {
            extractedText = await extractTextFromWebSearch(content);
        } else {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Invalid source type' });
        }

        // Index into Qdrant
        // Use NotebookId and SourceId (which we define early) as metadata
        const tempSourceId = new mongoose.Types.ObjectId();

        await indexDocumentToQdrant(extractedText, {
            notebookId: notebookId,
            sourceId: tempSourceId.toString(),
            sourceType: type,
            title: title || 'Untitled Source',
        });

        // Save to DB
        const newSource = new Source({
            _id: tempSourceId,
            notebook: notebookId,
            type,
            content: sourceContent,
            title: title || 'Untitled Source',
            vectorized: true,
        });

        const savedSource = await newSource.save();

        // Push source ref to Notebook
        notebook.sources.push(savedSource._id);
        await notebook.save();

        res.status(201).json(savedSource);
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error("SOURCE UPLOAD ERROR FULL STACK:", err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

// Delete a source
router.delete('/:notebookId/:sourceId', auth, async (req, res) => {
    try {
        const { notebookId, sourceId } = req.params;

        // Verify notebook ownership
        const notebook = await Notebook.findOne({ _id: notebookId, owner: req.user });
        if (!notebook) {
            return res.status(404).json({ message: 'Notebook not found' });
        }

        // Check if source exists and is linked to the notebook
        const sourceIndex = notebook.sources.indexOf(sourceId);
        if (sourceIndex === -1) {
            return res.status(404).json({ message: 'Source not found in this notebook' });
        }

        // Delete from DB
        await Source.findByIdAndDelete(sourceId);

        // Remove from notebook's sources array
        notebook.sources.splice(sourceIndex, 1);
        await notebook.save();

        res.json({ message: 'Source deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
