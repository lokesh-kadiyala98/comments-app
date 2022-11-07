const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
		name: {
            type: String
        },
        blogs: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'Blog'
            }
        ],
        comments: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'Comment'
            }
        ]
	},
	{
        timestamps: true
    }
)

const User = new mongoose.model('User', userSchema)

module.exports = User