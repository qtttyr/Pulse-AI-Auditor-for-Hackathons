import re
from typing import List, Any

def mask_secrets(content: str) -> str:
    """
    Scans content for common secret patterns and masks them.
    Used before sending code snippets to AI services.
    """
    # Patterns for common sensitive data
    patterns = [
        (r'(?i)(?:secret|token|key|password|auth|api_key|apikey)[\s:=]+[\'"]([^\'"]+)[\'"]', "********"),
        (r'(?i)Bearer\s+([a-zA-Z0-9\.\-_]+)', "Bearer ********"),
        (r'(?i)gh[op]_[a-zA-Z0-9]{36}', "ghp_************************************"),
        (r'(?i)AKIA[0-9A-Z]{16}', "AKIA****************"),
        (r'(?i)private_key[\s:=]+[\'"]([^\'"]+)[\'"]', "private_key: ********"),
    ]
    
    masked_content = content
    for pattern, replacement in patterns:
        try:
            masked_content = re.sub(pattern, replacement, masked_content)
        except Exception:
            continue
        
    return masked_content

def is_source_file(filename: str) -> bool:
    """Checks if a file is likely to be a source code file."""
    source_extensions = {
        '.py', '.js', '.ts', '.tsx', '.jsx', '.c', '.cpp', 
        '.h', '.java', '.go', '.rs', '.php', '.rb', '.swift',
        '.json', '.yaml', '.yml', '.toml'
    }
    return any(filename.lower().endswith(ext) for ext in source_extensions)

def extract_functions(content: str) -> List[str]:
    """
    Extracts function and class names/signatures for context.
    Supports Python, JS/TS, etc.
    """
    patterns = [
        r"(?:def|class)\s+([a-zA-Z_][a-zA-Z0-9_]*)", # Python
        r"(?:function|class)\s+([a-zA-Z_][a-zA-Z0-9_]*)", # JS/TS
        r"const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:\(.*\)|async\s*\(.*\))\s*=>", # Arrow functions
        r"(?:public|private|protected|static|export|async)\s+(?:function|class|def)?\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\(", # Generic OO
    ]
    
    found = []
    for p in patterns:
        matches = re.findall(p, content)
        found.extend(matches)
        
    # Unique and cleaned
    return sorted(list(set(found)))
