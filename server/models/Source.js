import mongoose from 'mongoose';

const sourceSchema = new mongoose.Schema({
    notebook: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notebook',
        required: true,
    },
    type: {
        type: String,
        enum: ['pdf', 'url', 'web_search', 'youtube', 'text'],
        required: true,
    },
    content: {
        // For pdf: cloudinary url. For url/youtube: the link. For text: the plain text.
        type: String,
        required: true,
    },
    title: {
        // Original filename or title of the webpage/youtube video
        type: String,
    },
    vectorized: {
        // Flag to check if it's been processed into Qdrant
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

const Source = mongoose.model('Source', sourceSchema);
export default Source;
