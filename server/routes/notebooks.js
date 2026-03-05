import express from 'express';
import Notebook from '../models/Notebook.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all notebooks for the logged in user
router.get('/', auth, async (req, res) => {
    try {
        const notebooks = await Notebook.find({ owner: req.user }).sort({ createdAt: -1 });
        res.json(notebooks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new notebook
router.post('/', auth, async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const newNotebook = new Notebook({
            title,
            description,
            owner: req.user
        });

        const savedNotebook = await newNotebook.save();
        res.status(201).json(savedNotebook);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific notebook with its sources
router.get('/:id', auth, async (req, res) => {
    try {
        const notebook = await Notebook.findOne({ _id: req.params.id, owner: req.user }).populate('sources');
        if (!notebook) {
            return res.status(404).json({ message: 'Notebook not found' });
        }
        res.json(notebook);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
