import mongoose, { Schema } from 'mongoose'; // Import Schema here

const PostSchema = new Schema({ // Use Schema directly
    author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment' // Reference to Comment model
    }]
},
{
    timestamps: true // Automatically add createdAt and updatedAt fields
});

const Post = mongoose.model('Post', PostSchema);
export default Post;