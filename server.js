const express = require('express')
const nodemailer = require('nodemailer')
const bodyParser = require('body-parser')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const upload = multer({ dest: 'uploads/' })

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'dachypieta@gmail.com',
		pass: 'mqth aquc ccvs skod',
	},
	tls: {
		rejectUnauthorized: false,
	},
})

app.post('/send', upload.single('file'), async (req, res) => {
	const { name, email, message } = req.body
	const file = req.file

	if (!name || !email || !message) {
		return res.status(400).send('All fields are required')
	}

	const mailOptions = {
		from: 'kontakt@gmail.com',
		to: 'dachypieta@gmail.com',
		subject: `Nowa wiadomość od ${name}`,
		text: `Otrzymałeś nową wiadomość od użytkownika ${name} (${email}):\n\n${message}`,
		attachments: file
			? [
					{
						filename: file.originalname,
						path: file.path,
					},
			  ]
			: [],
	}

	try {
		await transporter.sendMail(mailOptions)

		if (file) {
			fs.unlinkSync(file.path)
		}

		res.status(200).send('Email sent successfully')
	} catch (error) {
		console.error('Error sending email:', error)
		res.status(500).send('Error sending email')
	}
})

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`)
})
