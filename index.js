const express = require('express')
const app = express()
const cors = require('cors')
const chalk = require('chalk')

require('dotenv').config()
require('./src/db/mongoose')

const User = require('./src/models/user')

const blogsRouter = require('./src/routes/blogs')

const PORT = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

app.use('/blogs', blogsRouter)

app.get('/ping', (req, res) => {
    res.send({
        message: 'OK',
        status: 200
    })
})

// app.post('/user', async (req, res) => {
//     const user = new User(req.body)

//     try {
//         await user.save()

//         res.status(201).send(user)
//     } catch (error) {
//         res.status(500).send()
//     }
// })

app.listen(PORT, () => console.log(chalk.blue(`Server started on PORT ${PORT}...`)))