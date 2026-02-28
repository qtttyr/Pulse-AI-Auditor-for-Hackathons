import os
import subprocess
import sys

def clone_repository(repo_url: str, dest_path: str):
    """
    Clones a GitHub repository to a destination path using the git command line.
    """
    try:
        print(f"   📥 Cloning {repo_url}...", flush=True)
        sys.stdout.flush()
        os.makedirs(dest_path, exist_ok=True)
        
        # Run git clone in the dest_path using "." to target that specific folder
        result = subprocess.run(
            ["git", "clone", "--depth", "1", "--single-branch", repo_url, "."],
            capture_output=True,
            text=True,
            cwd=dest_path,
            shell=True
        )
        
        if result.returncode != 0:
            stderr_out = result.stderr if result.stderr else result.stdout
            print(f"   ❌ Git clone failed: {stderr_out}", flush=True)
            sys.stdout.flush()
            raise Exception(f"Git clone failed: {stderr_out}")
            
        print("   ✅ Clone successful.", flush=True)
        sys.stdout.flush()
        return dest_path
    except Exception as e:
        print(f"   ❌ Clone internal error: {str(e)}", flush=True)
        sys.stdout.flush()
        raise Exception(f"Failed to clone repository: {str(e)}")
