# Finnook 💰

> AI-powered personal finance tracker that predicts your spending, categorizes expenses automatically, and gives personalized financial advice.

![Finnook Dashboard](https://via.placeholder.com/1200x600/DAE2B6/021526?text=Finnook+Dashboard)

Live Demo ! - [https://finnook.vercel.app/login](https://finnook-x26i.vercel.app/dashboard)

## ✨ Features

- **AI Auto-Categorization** — Type "Paid 550 to Swiggy" and AI fills the form automatically
- **Spending Predictions** — Linear Regression predicts next month's spending by category
- **AI Financial Coach** — ChatGPT-style chatbot analyzes your real expense data
- **Interactive Dashboard** — Live totals, budget progress, pie + bar charts
- **Expense Tracking** — Add, view, delete expenses with category badges
- **Goals Tracker** — Set savings goals with progress bars and monthly savings calculator
- **Analytics Page** — Monthly trends, day-of-week patterns, top merchants
- **Profile Management** — Set salary and monthly budget
- **Glass UI** — Frosted glass aesthetic with custom Finnook color palette

## 🛠 Tech Stack

### Frontend
- React + TypeScript + Vite (SWC)
- Tailwind CSS v4
- Shadcn UI (Radix + Nova preset)
- Recharts (pie, bar, line charts)
- React Router DOM
- Lucide React icons

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- PostgreSQL
- JWT authentication (python-jose)
- bcrypt password hashing

### AI / ML
- OpenRouter API (auto-router for free LLMs)
- scikit-learn Linear Regression (spending predictions)
- pandas + numpy (data processing)

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- Python 3.11+
- PostgreSQL 16+

### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:
```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/finance_ai
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
OPENROUTER_API_KEY=your-openrouter-key
```

```bash
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

## 📁 Project Structure

finnook/
├── backend/
│   ├── app/
│   │   ├── routes/      # API endpoints
│   │   ├── models/      # SQLAlchemy models
│   │   ├── core/        # Auth, DB, security
│   │   └── main.py
│   └── requirements.txt
└── frontend/
├── src/
│   ├── pages/       # Dashboard, Expenses, Goals...
│   ├── components/  # Charts, UI components
│   ├── api/         # Backend API clients
│   └── hooks/       # useAuth
└── package.json

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Off-white | `#DAE2B6` | Background |
| Navy | `#021526` | Text |
| Deep Blue | `#03346E` | Primary/buttons |
| Sky Blue | `#6EACDA` | Accents/borders |

## 📄 License

MIT License — feel free to use and modify.

---

Built with ❤️ by Ashish
