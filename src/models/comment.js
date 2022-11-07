const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
		user: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User'
        },
        blog: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Blog',
            required: [true, 'blog id - found in the request']
        },
        content: {
            type: String,
            required: [true, 'content - not found in the request']
        },
        votes: {
            up: {
                type: Number,
                default: 0
            },
            down: {
                type: Number,
                default: 0
            }
        },
        replies: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'Comment'
            }
        ],
        type: {
            type: String,
            enum: ['COMMENT', 'REPLY'],
            default: 'COMMENT'
        }
	},
	{
        timestamps: true
    }
)

const Comment = new mongoose.model('Comment', commentSchema)

module.exports = Comment