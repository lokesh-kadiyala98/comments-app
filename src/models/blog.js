const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
        title: {
            type: String,
            required: [true, 'title - not found in the request']
        },
        headerImage: {
            type: String
        },
        caption: {
            type: String,
        },
        body: {
            type: String,
            required: [true, 'body - not found in the request']
        },
		author: {
            type: mongoose.SchemaTypes.ObjectId
        },
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

const Blog = new mongoose.model('Blog', blogSchema)

module.exports = Blog