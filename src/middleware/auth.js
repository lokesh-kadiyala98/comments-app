const User = require('./../models/user')

const auth = async (req, res, next) => {
	try {
		const token = req.header('Authorization').replace('Bearer ', '')

        let user
		user = await User.findOne({ _id: token })

		if (!user) throw new Error('User Not Found')

		req.user = user

		next()
	} catch (e) {
		console.log(e.message)
		res.status(401).send({ error: 'Please authenticate' })
	}
}

module.exports = auth