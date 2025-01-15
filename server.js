const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Używaj zmiennej środowiskowej PORT (jeśli jest ustawiona), jeśli nie, użyj 5000
const port = process.env.PORT || 5000;

// Ustawienia CORS i body-parser
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Konfiguracja uploadu pliku
const upload = multer({ dest: 'uploads/' });

// Konfiguracja Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'dachypieta@gmail.com', // Przechowuj dane logowania w zmiennych środowiskowych
    pass: process.env.EMAIL_PASS || 'mqth aquc ccvs skod', // Zmienna środowiskowa z hasłem
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Endpoint do wysyłania maila
app.post('/send', upload.single('file'), async (req, res) => {
  const { name, email, message } = req.body;
  const file = req.file;

  if (!name || !email || !message) {
    return res.status(400).send('All fields are required');
  }

  const mailOptions = {
    from: process.env.EMAIL_USER || 'kontakt@gmail.com', // Użyj zmiennej środowiskowej dla adresu nadawcy
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
  };

  try {
    // Wysyłanie wiadomości e-mail
    await transporter.sendMail(mailOptions);

    // Usuwanie pliku, jeśli istnieje
    if (file) {
      fs.unlinkSync(file.path);
    }

    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email');
  }
});

// Uruchomienie serwera na odpowiednim porcie
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
