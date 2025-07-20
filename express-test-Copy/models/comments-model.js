import mongoose, { Schema } from 'mongoose';

const commentSchema = new Schema({
    author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
},
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    content: {
        type: String,
        required: true
    },
})

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;