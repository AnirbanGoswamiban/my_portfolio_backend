require('dotenv').config();
const express = require("express");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors")

const app = express();
const port = 3000;
app.use(cors())

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files (for the resume and other assets)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to test server
app.get("/test", (req, res) => {
  res.send("ok");
});

// Endpoint to send email
app.post("/send-mail", async (req, res) => {
  const { name, email, comment } = req.body;

  if (!name || !email || !comment) {
    return res.status(400).send("Name, email, and comment are required.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.user,
      pass: process.env.pass,
    },
  });

  // EJS email template
  const emailTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>New Contact Form Submission</title>
      </head>
      <body>
        <h1>New Message from Your Portfolio</h1>
        <p><strong>Name:</strong> <%= name %></p>
        <p><strong>Email:</strong> <%= email %></p>
        <p><strong>Comment:</strong></p>
        <p><%= comment %></p>
      </body>
    </html>
  `;

  // Render the email template
  const emailContent = ejs.render(emailTemplate, { name, email, comment });

  const mailOptions = {
    from: process.env.mail,
    to: "anirbangoswami323@gmail.com", // Fixed recipient email
    subject: "Mail from Portfolio",
    html: emailContent, // Rendered email content
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    res.send("Email sent successfully.");
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).send("Failed to send email.");
  }
});

// Endpoint to download resume
app.get("/download-resume", (req, res) => {
  const resumePath = path.join(__dirname, "public", "resume.pdf"); // Path to the resume file
  res.download(resumePath, "My_Resume.pdf", (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("Failed to download resume.");
    }
  });
});

// Start the server
app.listen(process.env.port || port, () => {
  console.log(`Server running at http://localhost:${process.env.port || port}`);
});
