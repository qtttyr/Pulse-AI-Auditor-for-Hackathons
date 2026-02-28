# ⚡ PULSE: High-Fidelity Code Architecture X-Ray

> **Winner-grade AI-powered code analysis and visualization engine.**  
> Pulse transforms complex, messy repositories into clear, actionable, and beautiful architectural maps. Built for developers who value precision, speed, and deep insights.

---

## 🚀 The Vision

In most hackathons, judges are bored by "another chat with docs." **Pulse is different.**  
It doesn't just talk; it **shows**. By combining static analysis with LLM-powered structural reasoning, Pulse provides an "X-Ray" view of any project, identifying tech debt, innovation hotspots, and dependency clusters in seconds.

## 🛠 Tech Stack (The Professional's Choice)

Pulse is built with a modern, scalable, and high-performance stack:

### Frontend

- **Framework**: React 19 + Vite (Ultra-fast HMR)
- **Visual Engine**: [XYFlow (React Flow)](https://reactflow.dev/) + [Dagre](https://github.com/dagrejs/dagre) (Custom hierarchical layout engine)
- **Styling**: Tailwind CSS + Framer Motion (Cyberpunk aesthetics & glassmorphism)
- **State Management**: Zustand (Minimalist, high-performance state)
- **Icons**: Lucide React

### Backend

- **Core**: FastAPI (Python 3.12+)
- **Intelligence**: Integrated with LLMs (Qwen 2.5 Coder via OpenRouter) for deep architectural auditing.
- **Analysis**: Custom recursive dependency parser and project structure walker.

---

## ✨ Key Features

- **Interactive Radar Explorer**: A "Folder-First" approach to navigation. Drill down into architecture without the noise.
- **AI Verdicts**: Instant structural scoring (Tech Debt, Innovation, Industry Readiness).
- **Dynamic Dagre Layout**: Automatically optimizes code maps for perfect hierarchy—no overlapping nodes.
- **Micro-Animations**: Real-time signal pulsing and glow effects for a "live" system feel.

---

## 🛠 Instructions for Success (Free Deployment)

To win, you need to show the project live. Use these free-tier providers for a professional setup:

### 1. Frontend: Vercel (Free)

1. Push your code to a GitHub repository.
2. Connect the repo to [Vercel](https://vercel.com).
3. Set the build command to `npm run build` and the output directory to `dist`.
4. **Environment Variables**: Point `VITE_API_URL` to your backend URL.

### 2. Backend: Railway or Render (Free Tier)

1. Create a new service on [Railway.app](https://railway.app) or [Render.com](https://render.com).
2. Connect your GitHub repo.
3. Pulse Backend requires Python. Set the start command to:
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variable**: `OPENROUTER_API_KEY` (Your key for AI analysis).

---

## 🏁 Quick Start (Local)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🏆 Presentation Tip for Judges

When presenting, explain how **Pulse reduces onboarding time** for new developers. Click on a top-level folder to reveal the underlying files and say: _"We don't just see code; we see the pulse of the system—how it talks, where it's strong, and where it needs help."_

**Built with ⚡ by the Pulse Team.**
