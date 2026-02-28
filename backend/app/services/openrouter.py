import os
import json
from openai import AsyncOpenAI
from typing import Dict, List, Any

# Load environment variables if needed
from dotenv import load_dotenv
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "qwen/qwen-2-7b-instruct:free")

client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

async def analyze_with_ai(graph_data: Dict[str, Any], repo_path: str) -> Dict[str, Any]:
    """
    Sends the graph structure and key files to OpenRouter for a architectural verdict.
    """
    try:
        # 1. Prepare context: list of files and dependencies
        nodes_list = [n["id"] for n in graph_data["nodes"] if n.get("type") != "group"]
        
        # 2. Get content of main files (package.json, src/main.ts, etc.)
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
        You are a Senior Software Architect evaluating a project for a high-stakes competition.
        Analyze this repository structure and provided file content to provide a deep architectural "Pulse Scan".
        
        Repo structure (partial):
        {", ".join(nodes_list[:100])}
        
        Key implementation details:
        {files_context}
        
        Task: Provide a critical and constructive assessment.
        1. score: (int 1-100) A realistic score reflecting code quality, modern stack usage, and architectural clarity.
        2. tech_debt: (string) Identify specific bottlenecks (e.g., "Heavy prop drilling", "Lack of state management abstraction").
        3. innovation: (string) The "Gold Nugget" - find one specific design choice, library usage, or logic block that stands out as clever.
        4. architecture_type: (string) Detailed type (e.g., "Feature-Sliced Design", "Classic MVC", "Vite/React Micro-monolith").
        5. top_finding: (string) A "punchy" one-sentence verdict for a judge to understand the project's health.
        
        Format your response EXCLUSIVELY as a JSON object. No preamble, no post-markdown.
        {{
          "score": number,
          "tech_debt": "string",
          "innovation": "string",
          "architecture_type": "string",
          "top_finding": "string"
        }}
        """
        
        response = await client.chat.completions.create(
            model=OPENROUTER_MODEL,
            messages=[{"role": "user", "content": prompt}]
        )
        
        raw_content = response.choices[0].message.content
        print(f"DEBUG: Raw AI Response: {raw_content[:200]}")
        
        # Strip markdown if present
        if "```json" in raw_content:
            raw_content = raw_content.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_content:
            raw_content = raw_content.split("```")[1].split("```")[0].strip()
            
        verdict = json.loads(raw_content)
        return verdict
        
    except Exception as e:
        print(f"❌ AI Analysis Logic Error: {str(e)}")
        # Fallback verdict if AI fails
        return {
            "score": 42,
            "tech_debt": "Medium",
            "innovation": "Interactive dependency visualization",
            "architecture_type": "Modular Web App",
            "top_finding": f"AI analysis encounterd a technical glitch, but the project structure is valid."
        }
