require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Raparin Youth Organization API running' });
});

// Activities endpoint
app.get('/api/activities', (req, res) => {
  const activities = [
    {
      id: 1,
      titleEn: 'Youth Leadership Training',
      titleKu: 'پەروەردەی ڕابەرایەتی گەنجان',
      descriptionEn: 'A comprehensive training program empowering young leaders with skills in communication, teamwork, and civic responsibility.',
      descriptionKu: 'پرۆگرامێکی تەواوی پەروەردە کە گەنجانی ڕابەر بەهێز دەکات بە شارەزایی لە پەیوەندی، کارتیمی، و بەرپرسیارێتی مەدەنی.',
      date: '2024-03-15',
      category: 'training',
      image: '/activities/leadership.jpg',
    },
    {
      id: 2,
      titleEn: 'Community Clean-Up Campaign',
      titleKu: 'کەمپەینی پاکیکردنەوەی کۆمەڵگا',
      descriptionEn: 'Volunteers gathered to clean public spaces and raise awareness about environmental responsibility in Raparin.',
      descriptionKu: 'خۆبەخشەکان کۆبوونەوە بۆ پاکیکردنەوەی شوێنە گشتییەکان و هۆشیارکردنەوە لەبارەی بەرپرسیارێتی ژینگەیی لە ڕاپەڕین.',
      date: '2024-04-20',
      category: 'community',
      image: '/activities/cleanup.jpg',
    },
    {
      id: 3,
      titleEn: 'Sports & Recreation Day',
      titleKu: 'ڕۆژی وەرزش و ڕاکردن',
      descriptionEn: 'Annual sports day fostering teamwork, physical health, and community bonding among youth members.',
      descriptionKu: 'ڕۆژی وەرزشی ساڵانە کە کارتیمی، تەندرووستی جەستەیی، و پەیوەندی کۆمەڵگا لەنێوان ئەندامانی گەنجان زیاد دەکات.',
      date: '2024-05-10',
      category: 'sports',
      image: '/activities/sports.jpg',
    },
    {
      id: 4,
      titleEn: 'Cultural Heritage Festival',
      titleKu: 'فێستیڤاڵی میراتی کەلتووری',
      descriptionEn: 'Celebrating Kurdish culture, music, and traditional arts to preserve our rich heritage for future generations.',
      descriptionKu: 'پیرۆزکردنی کەلتووری کوردی، موزیک، و هونەری نەریتی بۆ پاراستنی میراتی بەنرخمان بۆ نەوەی داهاتوو.',
      date: '2024-06-01',
      category: 'culture',
      image: '/activities/culture.jpg',
    },
    {
      id: 5,
      titleEn: 'Digital Skills Workshop',
      titleKu: 'وۆرکشۆپی شارەزایی دیجیتاڵ',
      descriptionEn: 'Hands-on workshops teaching coding, social media management, and digital marketing to youth entrepreneurs.',
      descriptionKu: 'وۆرکشۆپی ئامۆژگاری کۆدنووسین، بەڕێوەبردنی میدیای کۆمەڵایەتی، و بازاڕکردنی دیجیتاڵ بۆ کارڕێکخستاری گەنج.',
      date: '2024-07-15',
      category: 'education',
      image: '/activities/digital.jpg',
    },
    {
      id: 6,
      titleEn: 'Mental Health Awareness Campaign',
      titleKu: 'کەمپەینی هۆشیارکردنەوەی تەندرووستی دروستی',
      descriptionEn: 'Breaking stigma and promoting mental wellbeing through community dialogue, workshops, and support networks.',
      descriptionKu: 'شکاندنی شەرم و پێشبرینی بەخێربوونی دروستی بە ڕێگەی گفتوگۆی کۆمەڵگا، وۆرکشۆپ، و تۆڕی پشتگیری.',
      date: '2024-08-05',
      category: 'health',
      image: '/activities/mental-health.jpg',
    },
  ];
  res.json({ success: true, data: activities });
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, message, subject } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address' });
  }

  try {
    // Configure transporter (uses env variables for production)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"${name}" <${email}>`,
        to: process.env.EMAIL_TO || process.env.EMAIL_USER,
        subject: subject || `New Contact Form Message from ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      });
    }

    // Log the message (works even without email config)
    console.log('Contact form submission:', { name, email, subject, message });

    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Raparin Youth Org API running on http://localhost:${PORT}`);
});
