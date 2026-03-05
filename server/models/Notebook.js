import mongoose from 'mongoose';

const notebookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sources: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Source'
    }]
}, { timestamps: true });

const Notebook = mongoose.model('Notebook', notebookSchema);
export default Notebook;
