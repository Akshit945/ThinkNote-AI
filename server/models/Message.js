import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    notebook: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notebook',
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    sources: [{
        type: mongoose.Schema.Types.Mixed
    }]
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
export default Message;
