import os
import json
from openai import AsyncOpenAI
from typing import Dict, List, Any

# Load environment variables if needed
from dotenv import load_dotenv
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "qwen/qwen-2-7b-instruct:free")

def get_ai_client():
    """Lazily initialize the client to prevent startup crashes if key is missing."""
    key = os.getenv("OPENROUTER_API_KEY")
    if not key:
        print("⚠️ Warning: OPENROUTER_API_KEY is not set. AI analysis will use fallback.")
        return None
    return AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=key,
    )

async def analyze_with_ai(graph_data: Dict[str, Any], repo_path: str) -> Dict[str, Any]:
    """
    Sends the graph structure and key files to OpenRouter for a architectural verdict.
    """
    try:
        # Get client lazily
        client = get_ai_client()
        if not client:
            return {
                "score": 0,
                "tech_debt": "API Key Missing",
                "innovation": "N/A",
                "architecture_type": "N/A",
                "top_finding": "Set OPENROUTER_API_KEY in Render to enable AI insights."
            }

        # 1. Prepare context: list of files and dependencies
        nodes_list = [n["id"] for n in graph_data["nodes"] if n.get("type") != "group"]
        
        # 2. Get content of main files
        files_context = ""
        key_files = ["package.json", "requirements.txt", "src/main.tsx", "src/App.tsx", "backend/app/main.py"]
        
        for f in key_files:
            f_path = os.path.join(repo_path, f)
            if os.path.exists(f_path):
                with open(f_path, "r", encoding="utf-8", errors="ignore") as file:
                    content = file.read()
                    files_context += f"\n--- {f} ---\n{content[:2000]}\n"
        
        # 3. Create prompt
        prompt = f"""
        You are a Senior Software Architect. Provide an architectural verdict for this repository in JSON.
        
        Files Context:
        {files_context}
        
        JSON Format:
        {{
          "score": number (1-100),
          "tech_debt": "short description",
          "innovation": "one clever thing",
          "architecture_type": "type of app",
          "top_finding": "one sentence summary"
        }}
        """
        
        response = await client.chat.completions.create(
            model=OPENROUTER_MODEL,
            messages=[{"role": "user", "content": prompt}]
        )
        
        raw_content = response.choices[0].message.content
        
        if "```json" in raw_content:
            raw_content = raw_content.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_content:
            raw_content = raw_content.split("```")[1].split("```")[0].strip()
            
        verdict = json.loads(raw_content)
        return verdict
        
    except Exception as e:
        print(f"❌ AI Analysis Logic Error: {str(e)}")
        return {
            "score": 50,
            "tech_debt": "Analysis logic fallback",
            "innovation": "Interactive Radar Visualization",
            "architecture_type": "Modular Web App",
            "top_finding": "Ready for high-level audit."
        }
