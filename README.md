# Raparin Youth Organization Website
### ڕێکخراوی گەنجانی ڕاپەڕین

A bilingual (English / Kurdish) website for the **Raparin Youth Organization** built with Next.js (frontend) and Express.js (backend).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm

### 1. Install Dependencies

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install
```

### 2. Run Development Servers

**Backend (Express.js)** — runs on `http://localhost:5000`
```bash
cd backend
node index.js
```

**Frontend (Next.js)** — runs on `http://localhost:3000`
```bash
cd frontend
npm run dev
```

---

## 📁 Project Structure

```
Raparin-youth/
├── frontend/            # Next.js app
│   ├── app/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── HeroSection.js
│   │   │   ├── AboutSection.js
│   │   │   ├── ActivitiesSection.js
│   │   │   ├── ContactSection.js
│   │   │   └── Footer.js
│   │   ├── LanguageContext.js
│   │   ├── translations.js
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js
│   └── public/
│       └── logo.png
└── backend/             # Express.js API
    ├── index.js
    └── .env.example
```

## 🌐 Features

- ✅ **Bilingual** – English & Kurdish (Sorani) with RTL support
- ✅ **Responsive** – Mobile, Tablet, Desktop
- ✅ **Smooth Animations** – Intersection Observer + CSS keyframes
- ✅ **Activities Section** – Fetched from Express API with category filters
- ✅ **Contact Form** – Sends to backend, supports email via Nodemailer
- ✅ **Language Switcher** – Persistent via localStorage

## 🎨 Colors (from Logo)

| Color | Hex |
|-------|-----|
| Sky Blue | `#33AAFF` |
| Indigo | `#6B5BE5` |
| Gold | `#FFD700` |
| Dark BG | `#0A1628` |

## ⚙️ Environment Variables (Backend)

Copy `.env.example` to `.env`:
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=info@raparin-youth.org
```
