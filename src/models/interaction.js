const mongoose = require('mongoose')

const interactionSchema = new mongoose.Schema({
		comment: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Comment'
        },
        user: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User'
        },
        type: {
            type: String,
            enum: ['UP', 'DOWN']
        }
	},
	{
        timestamps: true
    }
)

interactionSchema.index({ comment: 1, user: 1 }, { unique: true })

const Interaction = new mongoose.model('Interaction', interactionSchema)

module.exports = Interaction