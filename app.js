const express = require("express");
const cors = require("cors");
const nodeMailer = require("nodemailer");
const dotenv = require("dotenv");
const app = express();
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");

const filesPayloadExists = require("./middleware/filesPayloadExists");
const fileSizeLimiter = require("./middleware/fileSizeLimiter");

dotenv.config();

// Set CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://127.0.0.1:5500/",
  "https://www.eleganttek.com/",
  "https://www.eleganttek.com",
  "http://eleganttek.com/",
  "http://www.eleganttek.com/",
  "http://eleganttek.com",
  "http://www.eleganttek.com",
  "http://eleganttek.com.s3-website-us-east-1.amazonaws.com"
];

const corsOpts = {
  origin: '*',

  methods: [
    'GET',
    'POST',
  ],

  allowedHeaders: [
    'Content-Type',
  ],
};

// Enable CORS
app.use(
 cors(corsOpts));

app.use(express.json());
app.use(express.urlencoded({ extended: false })); // to parse the

// routes

app.get("/", (req, res) => {
  res.send("This is root route for server");
});

app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  // create a nodemailer transporter
  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: "tu734583@gmail.com",
      pass: "nliqzduukadzgdet",
    },
  });

  // setup email data
  const mailOptions = {
    from: email,
    to: "contact@eleganttek.com",
    replyTo: email,
    subject: `${name} <${email}> left message through online web platform.`,
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error occurred: " + error.message);
      res.send({ message: "failed" });
    } else {
      console.log("Email sent successfully!");
      console.log("Message ID: " + info.messageId);
      res.send({ message: "success" });
    }
  });
});

app.post(
  "/application",
  fileUpload({ createParentPath: true }),
  filesPayloadExists,
  fileSizeLimiter,
  (req, res) => {
    const files = req.files;

    const { role, name, email, contact } = req.body;

    // create a nodemailer transporter
    const transporter = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      service: "gmail",
      port: 587,
      secure: false,
      auth: {
        user: "tu734583@gmail.com",
        pass: "nliqzduukadzgdet",
      },
    });

    // setup email data
    const mailOptions = {
      from: email,
      to: "contact@eleganttek.com",
      replyTo: email,
      subject: `${name} <${email}> showed interest in ${role} position.`,
      text: "Please find the attached resume.",
      attachments: [
        {
          filename: files.resume[0].name,
          content: files.resume[0].data,
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error occurred: " + error.message);
        res.send({ message: "failed" });
      } else {
        console.log("Email sent successfully!");
        console.log("Message ID: " + info.messageId);
        res.send({ message: "success" });
      }
    });
  }
);

app.get("*", (req, res) => {
  res.send("404");
});

const port = process.env.PORT || 80;
app.listen(port, () => console.log(`Server listening on port ${port}!`));
