const express = require('express')
const router = express.Router()
const chalk = require('chalk')

const Comment = require('../models/comment')
const Blog = require('../models/blog')
const auth = require('../middleware/auth')

router.get('/:blogId/comments', async (req, res) => {
    const { blogId } = req.params

    try {
        const comments = await Comment.find({
            blog: blogId,
            type: 'COMMENT'
        }).populate('user')

        res.send(comments)
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/:commentId/replies', async (req, res) => {
    const { commentId } = req.params

    try {
        const comment = await Comment.findById(commentId)
            .populate({
                path: 'replies',
                populate: {
                    path: 'user',
                    model: 'User'
                }
            })

        if (!comment) {
            res.status(404).send({
                message: `comment with ${commentId} not found`
            })
        }

        res.send(comment.replies)
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
})

router.post('/comment', [auth], async (req, res) => {
    const comment = new Comment({
        user: req.user._id,
        ...req.body
    })

    try {
        const { replyingTo } = req.body

        if (replyingTo) {
            const referenceComment = await Comment.findById(replyingTo)
            if (!referenceComment) {
                return res.status(404).send({
                    message: 'Reference comment not found'
                })
            }
            referenceComment.replies.push(comment._id)
            referenceComment.save()

            comment.type = 'REPLY'
        }

        await comment.save()

        res.status(201).send(comment)
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/', async (req, res) => {
    const blog = new Blog(req.body)

    try {
        await blog.save()

        res.status(201).send(blog)
    } catch (error) {
        res.status(500).send()
    }
})

module.exports = router