const express = require('express');
const multer = require('multer');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// File upload configuration
const upload = multer({ dest: 'uploads/' });

// POST endpoint to handle file upload and validate emails
app.post('/api/upload', upload.single('file'), (req, res) => {
    const filePath = path.join(__dirname, req.file.path);
    const fileData = fs.readFileSync(filePath, 'utf8');
    const rows = fileData.split(/\r?\n|\n/).map(e => e.split(','));
    const validEmails = [];
    const invalidEmails = [];

    const validEmailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    rows.forEach(row => {
        const email = String(row).trim();
        if (validEmailRegex.test(email)) {
            validEmails.push(email);
        } else {
            invalidEmails.push(email);
        }
    });

    

    res.json({ validEmails, invalidEmails });
});

// POST endpoint to send emails to valid recipients
app.post('/api/send-emails', async (req, res) => {
    const { from, subject, message, emails } = req.body;
    if (!from || !subject || !message || !emails || !Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ error: 'Invalid input data' });
    }


        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'maneeshbugaliya@gmail.com', 
                pass:  'Maneesh@123' 
            }
        });
       for (let email of emails) {
            await transporter.sendMail({
                from: from,
                to: email,
                subject: subject,
                text: message,
            },(error,info)=>{
                if(error){
                    console.error('Error sending emails:', error);
                    return res.status(500).json({ error: 'Failed to send emails.' }); 
                }
                else{
                    console.log('Email sent:', info.response);
                }
            });
        }

        // Send success response
        return res.status(200).json({ message: 'Emails sent successfully finally!' });
    
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
