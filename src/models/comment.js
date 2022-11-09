const mongoose = require('mongoose')
const Interaction = require('./interaction')

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
        replies: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'Comment'
            }
        ],
        interactions: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'Interaction'
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

commentSchema.post('save', async function () {
    const comment = this
    try {
        const interactionUP = new Interaction({
            user: '636ab4d105178fe2cf3daf83',
            comment: comment._id,
            type: 'UP'
        })
        await interactionUP.save()

        const interactionDOWN = new Interaction({
            user: '636ab4d105178fe2cf3daf83',
            comment: comment._id,
            type: 'DOWN'
        })
        await interactionDOWN.save()

        await Comment.findByIdAndUpdate(comment._id, {
            $push: {
                interactions: {
                    $each: [interactionUP._id, interactionDOWN._id]
                }
            }
        })
    } catch (e) {
        
    }
})

const Comment = new mongoose.model('Comment', commentSchema)

module.exports = Comment