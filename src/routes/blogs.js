const express = require('express')
const router = express.Router()
const chalk = require('chalk')
const mongoose = require('mongoose')

const Comment = require('../models/comment')
const Blog = require('../models/blog')
const auth = require('../middleware/auth')
const Interaction = require('../models/interaction')

router.get('/:blogId/comments', [auth], async (req, res) => {
    const {
        params: {
            blogId 
        },
        query: {
            sortKey,
            limit,
            skip
        },
        user
    } = req

    var sortObj = {}
    if (sortKey === 'newest') {
        sortObj = {
            createdAt: -1
        }
    } else if (sortKey === 'oldest') {
        sortObj = {
            createdAt: 1
        }
    }

    try {
        const comments = await Comment
            .aggregate([
                {
                    $match: {
                        blog: new mongoose.Types.ObjectId(blogId),
                        type: 'COMMENT'
                    }
                }, {
                    $sort: sortObj
                }, {
                    $skip: parseInt(skip)
                }, {
                    $limit: parseInt(limit)
                }, {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                }, {
                    $lookup: {
                        from: 'interactions',
                        localField: 'interactions',
                        foreignField: '_id',
                        as: 'interactions'
                    }
                }, {
                    $unwind: '$user'
                }, {
                    $unwind: '$interactions'
                }, {
                    $group: {
                        _id: {
                            interactionType: '$interactions.type',
                            _id: '$_id'
                        },
                        id: { $first: '$_id' },
                        user: { $first: '$user' },
                        blog: { $first: '$blog' },
                        content: { $first: '$content' },
                        replies: { $first: '$replies' },
                        createdAt: { $first: '$createdAt' },
                        count: { $sum: 1 }
                    }
                }, {
                    $project: {
                        _id: '$id',
                        user: '$user',
                        blog: '$blog',
                        content: '$content',
                        replies: '$replies',
                        createdAt: '$createdAt',
                        interaction: {
                            count: '$count',
                            type: '$_id.interactionType'
                        }
                    }
                }, {
                    $group: {
                        _id: '$_id',
                        user: { $first: '$user' },
                        blog: { $first: '$blog' },
                        content: { $first: '$content' },
                        replies: { $first: '$replies' },
                        createdAt: { $first: '$createdAt' },
                        interaction1: { $first: '$interaction' },
                        interaction2: { $last: '$interaction' }
                    }
                }, {
                    $sort: sortObj
                }
            ])

        comments.forEach(comment => {
            comment.votes = {
                [comment.interaction1.type]: comment.interaction1.count - 1,
                [comment.interaction2.type]: comment.interaction2.count - 1
            }

            delete comment.interaction1
            delete comment.interaction2

            Interaction.aggregate([
                {
                    $match: {
                        comment: comment._id,
                        user: user._id
                    }
                }, {
                    $lookup: {
                        from: 'comments',
                        localField: '_id',
                        foreignField: 'interactions',
                        as: 'interaction'
                    }
                }
            ]).then((interaction) => {
                if (interaction && interaction.length) {
                    comment['currentUserInteraction'] = interaction[0].type
                }
            })
        })

        setTimeout(() => res.send(comments), 40)
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
})

// TODO: After deleting interaction delete in post array too
router.get('/comment/:commentId/replies', [auth], async (req, res) => {
    const {
        params: {
            commentId 
        },
        query: {
            sortKey,
            limit,
            skip
        },
        user
    } = req

    var sortObj = {}
    if (sortKey === 'newest') {
        sortObj = {
            createdAt: -1
        }
    } else if (sortKey === 'oldest') {
        sortObj = {
            createdAt: 1
        }
    }

    try {
        const replies = await Comment
        // .findById(commentId)
        //     .populate({
        //         path: 'replies',
        //         populate: {
        //             path: 'user',
        //             model: 'User'
        //         }
        //     })
            .aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(commentId)
                    }
                }, {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                }, {
                    $unwind: '$user'
                }, {
                    $lookup: {
                        from: 'comments',
                        localField: 'replies',
                        foreignField: '_id',
                        as: 'reply'
                    }
                }, {
                    $unwind: '$reply'
                }, {
                    $unwind: '$reply.interactions'
                }, {
                    $lookup: {
                        from: 'interactions',
                        localField: 'reply.interactions',
                        foreignField: '_id',
                        as: 'interaction'
                    }
                }, {
                    $unwind: '$interaction'
                }, {
                    $group: {
                        _id: {
                            replyId: '$reply._id',
                            interactionType: '$interaction.type',
                        },
                        id: { $first: '$reply._id' },
                        user: { $first: '$reply.user' },
                        content: { $first: '$reply.content' },
                        replies: { $first: '$reply.replies' },
                        createdAt: { $first: '$reply.createdAt' },
                        count: { $sum: 1 }
                    }
                }, {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                }, {
                    $unwind: '$user'
                }, {
                    $project: {
                        _id: '$id',
                        user: '$user',
                        content: '$content',
                        replies: '$replies',
                        createdAt: '$createdAt',
                        interaction: {
                            count: '$count',
                            type: '$_id.interactionType'
                        }
                    }
                }, {
                    $group: {
                        _id: '$_id',
                        user: { $first: '$user' },
                        content: { $first: '$content' },
                        replies: { $first: '$replies' },
                        createdAt: { $first: '$createdAt' },
                        interaction1: { $first: '$interaction' },
                        interaction2: { $last: '$interaction' }
                    }
                }
            ])

        replies.forEach(reply => {
            reply.votes = {
                [reply.interaction1.type]: reply.interaction1.count - 1,
                [reply.interaction2.type]: reply.interaction2.count - 1
            }

            delete reply.interaction1
            delete reply.interaction2

            Interaction.aggregate([
                {
                    $match: {
                        comment: reply._id,
                        user: user._id
                    }
                }, {
                    $lookup: {
                        from: 'comments',
                        localField: '_id',
                        foreignField: 'interactions',
                        as: 'interaction'
                    }
                }
            ]).then((interaction) => {
                if (interaction && interaction.length) {
                    reply['currentUserInteraction'] = interaction[0].type
                }
            })
        })

        if (!replies || !replies.length) {
            res.status(404).send({
                message: `comment with ${commentId} not found`
            })
        }

        setTimeout(() => res.send(replies), 40)
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
})

router.post('/:blogId/comment', [auth], async (req, res) => {
    const {
        params: {
            blogId: blog
        },
        body,
        user
    } = req

    const comment = new Comment({
        user: user._id,
        blog,
        ...body
    })

    try {
        const { replyingTo } = body

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
        const fullComment = await comment.populate('user')

        res.status(201).send({
            ...fullComment._doc,
            currentUserInteraction: '',
            votes: {
                UP: 0,
                DOWN: 0
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
})

router.post('/comment/:commentId/interaction', [auth], async (req, res) => {
    const {
        params: {
            commentId
        },
        body,
        user
    } = req

    try {
        const interactionExists = await Interaction.find({
            user: user._id,
            comment: commentId
        })

        if (interactionExists && interactionExists.length) {
            if (body.action === 'remove') {
                await Interaction.findOneAndDelete({
                    user: user._id,
                    comment: commentId
                })
    
                res.status(200).send()
            } else {
                const updatedInteraction = await Interaction.findOneAndUpdate({
                    user: user._id,
                    comment: commentId
                }, {
                    type: body.type
                }, {
                    new: true
                })
    
                res.status(200).send(updatedInteraction)
            }
        } else if (body.action === 'remove') {
            return res.status(404).send()
        } else {
            const interaction = new Interaction({
                comment: commentId,
                user: user._id,
                ...body
            })

            await interaction.save()

            await Comment.findByIdAndUpdate(commentId, {
                $push: {
                    interactions: interaction._id
                }
            })

            res.status(201).send(interaction)
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).send()
    }
})

router.post('/', async (req, res) => {
    const blog = new Blog(req.body)

    try {
        await blog.save()

        res.status(201).send(blog)
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
})

module.exports = router