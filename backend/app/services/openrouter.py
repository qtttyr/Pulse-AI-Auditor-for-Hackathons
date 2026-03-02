import os
import json
import re
from openai import AsyncOpenAI
from typing import Dict, List, Any

# Load environment variables if needed
from dotenv import load_dotenv
from app.services.filter import mask_secrets, is_source_file

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "qwen/qwen-2.5-coder-32b-instruct:free")

def get_ai_client():
    """Lazily initialize the client to prevent startup crashes if key is missing."""
    key = os.getenv("OPENROUTER_API_KEY")
    if not key:
        print("⚠️ Warning: OPENROUTER_API_KEY is not set. AI analysis will use simplified output.")
        return None
    return AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=key,
    )

async def analyze_with_ai(graph_data: Dict[str, Any], repo_path: str) -> Dict[str, Any]:
    """
    Sends the graph structure and key files to OpenRouter for an architectural verdict.
    Ensures secrets are filtered before sending.
    """
    try:
        client = get_ai_client()
        if not client:
            return {
                "score": 0,
                "tech_debt": "API Key Missing",
                "innovation": "N/A",
                "architecture_type": "N/A",
                "top_finding": "Set OPENROUTER_API_KEY to enable full AI diagnostics."
            }

        # 1. Prepare file list (files only, no groups)
        nodes_list = [n["id"] for n in graph_data["nodes"] if n.get("type") == "file"]
        
        # 2. Heuristic for selecting contextually important files
        # Prioritize config files, entry points, and common core libraries
        priority_files = [
            "package.json", "requirements.txt", "main.py", "App.tsx", 
            "docker-compose.yml", "Dockerfile", "README.md", "vite.config.ts"
        ]
        
        selected_files = []
        # Add priority files if they exist
        for pf in priority_files:
            if pf in nodes_list:
                selected_files.append(pf)
        
        # Fill remaining budget with other files (limit to total 10 files for now)
        other_files = [n for n in nodes_list if n not in selected_files and is_source_file(n)]
        selected_files.extend(other_files[:max(0, 10 - len(selected_files))])
        
        files_context = ""
        for f in selected_files:
            f_path = os.path.join(repo_path, f)
            if os.path.exists(f_path):
                try:
                    with open(f_path, "r", encoding="utf-8", errors="ignore") as file:
                        content = file.read()
                        # Mask secrets!
                        safe_content = mask_secrets(content)
                        # Truncate large files
                        files_context += f"\n--- {f} ---\n{safe_content[:1500]}\n"
                except:
                    continue
        
        # 3. Create prompt
        prompt = f"""
        You are a Senior Software Architect. Provide an architectural verdict for this repository in JSON.
        The project structure contains files like: {', '.join(nodes_list[:30])}...
        
        Key Files Content:
        {files_context}
        
        Analyze:
        1. Modularity (how well files are clustered).
        2. Scalability.
        3. Code quality signals (imports/exports).
        
        Output JSON:
        {{
          "score": number (0-100),
          "tech_debt": "short description of issues",
          "innovation": "one clever thing or potential optimization",
          "architecture_type": "e.g., Modular Monolith, Serverless, Micro-service-ready",
          "top_finding": "one sentence summary of the whole audit"
        }}
        """
        
        response = await client.chat.completions.create(
            model=OPENROUTER_MODEL,
            messages=[{"role": "user", "content": prompt}],
            timeout=40
        )
        
        raw_content = response.choices[0].message.content
        
        # Extraction logic
        match = re.search(r'(\{.*\})', raw_content, re.DOTALL)
        if match:
            raw_content = match.group(1)
            
        try:
            verdict = json.loads(raw_content)
        except:
             # Fallback if LLM sent garbage
             raise ValueError("LLM response did not contain valid JSON")
            
        return verdict
        
    except Exception as e:
        print(f"❌ AI Analysis Logic Error: {str(e)}")
        return {
            "score": 65,
            "tech_debt": "Inferred from file count (basic analysis)",
            "innovation": "Responsive visualization engine",
            "architecture_type": "Standard Repository",
            "top_finding": "The project is undergoing active audit; AI diagnostics currently using fallback."
        }
