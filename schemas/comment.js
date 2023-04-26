const mongoose = require('mongoose');

const commentsSchema = new mongoose.Schema({
    postId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    nickname: {
        type: String,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
    },
});

commentsSchema.virtual('commentId').get(function () {
    return this._id.toHexString();
});

commentsSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('comment', commentsSchema);
