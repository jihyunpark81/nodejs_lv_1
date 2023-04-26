const mongoose = require('mongoose');

const userinfoSchema = new mongoose.Schema({
    nickname: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});

userinfoSchema.virtual('userId').get(function () {
    return this._id.toHexString();
});

userinfoSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('userinfo', userinfoSchema);
