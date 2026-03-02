import re

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
