const mongoose = require('mongoose')
const chalk = require('chalk')

mongoose
	.connect(process.env.DB_URL, {
		useUnifiedTopology: true,
		useNewUrlParser: true,
	})
	.then(() => console.log(chalk.blue('Database Connected Succesfully')))
	.catch((err) => console.log(chalk.red(err)))