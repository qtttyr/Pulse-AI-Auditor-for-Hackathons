import os
import shutil
import tempfile
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.services.fetcher import clone_repository
from app.services.graph_gen import analyze_dependencies
from app.services.openrouter import analyze_with_ai

app = FastAPI(title="Pulse AI API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    repo_url: str

class AnalyzeResponse(BaseModel):
    status: str
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    verdict: Dict[str, Any]

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_repo(request: AnalyzeRequest):
    # 1. Create a temp directory
    temp_dir = tempfile.mkdtemp()
    print(f"🚀 Starting analysis for: {request.repo_url}", flush=True)
    print(f"📂 Temp directory created: {temp_dir}", flush=True)
    
    try:
        # 2. Clone repository
        repo_path = os.path.join(temp_dir, "repo")
        os.makedirs(repo_path, exist_ok=True)
        print("🔗 Step 1: Cloning repository...", flush=True)
        clone_repository(request.repo_url, repo_path)
        print("✅ Cloning complete.", flush=True)
        
        # 3. Analyze dependencies (run dependency-cruiser)
        print("📊 Step 2: Analyzing dependencies (this may take a minute)...", flush=True)
        target_path = os.path.join(repo_path, "src")
        if not os.path.exists(target_path):
            print("   ⚠️  Target path 'src' not found. Using root directory.", flush=True)
            target_path = repo_path
            
        graph_data = analyze_dependencies(repo_path, target_path)
        print(f"✅ Dependency graph generated. Nodes: {len(graph_data['nodes'])}, Edges: {len(graph_data['edges'])}", flush=True)
        
        # 4. AI Analysis via OpenRouter
        print(f"🤖 Step 3: AI Analysis via OpenRouter ({os.getenv('OPENROUTER_MODEL', 'default')})...", flush=True)
        verdict = await analyze_with_ai(graph_data, repo_path)
        print("✅ AI Analysis complete.", flush=True)
        
        return {
            "status": "success",
            "nodes": graph_data["nodes"],
            "edges": graph_data["edges"],
            "verdict": verdict
        }
        
    except Exception as e:
        print(f"❌ Analysis failed: {str(e)}", flush=True)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # 5. Cleanup temp directory
        print("🧹 Cleaning up temp directory...", flush=True)
        shutil.rmtree(temp_dir, ignore_errors=True)
        print("✨ Done.", flush=True)

@app.get("/health")
async def health_check():
    return {"status": "ok"}
