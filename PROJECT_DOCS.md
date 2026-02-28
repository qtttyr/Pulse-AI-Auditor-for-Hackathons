# 📋 Project Documentation: PULSE Engine

## 1. Project Overview

**PULSE** is an advanced repository visualization and architectural auditing tool. It bridges the gap between raw source code and high-level architectural understanding. By parsing dependencies and using AI-driven structural analysis, it gives developers a bird's-eye view of project "health" and construction.

## 2. Technical Architecture

### A. The "X-Ray" Graph (XYFlow + Dagre)

Pulse uses a custom-built hierarchical layout engine.

- **Dagre Integration**: Calculates optimal coordinates for a Top-Down (TB) hierarchy, ensuring dependencies flow logically.
- **Progressive Disclosure**: To handle massive projects, we implemented a "Folder-First" strategy. Only requested sections of the architecture are rendered, preventing browser memory exhaustion.
- **Custom Nodes**: SVG-based React components with dynamic stroke-glow and extension-aware color schemes for instant visual parsing.

### B. Backend Analysis Pipeline

1. **Source Recovery**: Temporary cloning and shallow parsing of the target GitHub repository.
2. **Dependency Mapping**: Recursive walk through the filesystem to identify import-export relations and group files into functional modules (clusters).
3. **AI Distillation**: Projects are sent to a high-context LLM (Qwen 2.5 Coder) which analyzes folder patterns to determine Tech Debt and Innovation scores based on industry-standard design patterns (SOLID, DRY, etc.).

## 3. Tech Stack Deep Dive

- **FastAPI**: Chosen for its asynchronous capabilities and high-speed JSON serialization, critical for large graph transfers.
- **React Flow (@xyflow/react)**: The leading library for node-based UIs, customized here with a cyberpunk theme and glassmorphism.
- **Zustand**: A lightweight state management solution that ensures the graph and sidebar stay synchronized in real-time.
- **Tailwind CSS v4**: Utilizing the latest in utility-first CSS for a performant, modern UI without bloating the bundle.

## 4. Competitive Advantage (The "Winner" Factor)

While many tools list files, **Pulse visualizes connections**. In a hackathon setting, Pulse stands out because:

1. **Interactive UI**: The graph is alive, not static.
2. **Intelligence**: It doesn't just show the files; it _judges_ the quality through AI architecture scoring.
3. **Scalability**: The "Folder-First" approach proves the team thought about production-level performance.

## 5. Deployment Guide (Production-Ready)

### Frontend (Vercel)

- **Build Step**: `npm run build`
- **Output**: `dist/`
- **Recommended Node Version**: 20.x

### Backend (Railway/Render)

- **Runtime**: Python 3.12
- **Scalability**: Stateless architecture—can be scaled horizontally across multiple instances.
- **Dependencies**: Uses `Git` system dependency for cloning.

---

_Pulse: Seeing the code, understanding the architecture._
