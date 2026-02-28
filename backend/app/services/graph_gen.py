import subprocess
import json
import os
import shutil
import sys
from typing import Dict, List, Any
import re

def analyze_dependencies(repo_path: str, target_path: str) -> Dict[str, Any]:
    """
    Runs dependency-cruiser on the target path and formats the result for React Flow.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    depcruise_js = os.path.join(base_dir, "node_modules", "dependency-cruiser", "bin", "dependency-cruise.mjs")
    node_exe = shutil.which("node") or "node"
    
    if not os.path.exists(depcruise_js):
        print(f"   ⚠️  Local dependency-cruiser script not found at {depcruise_js}. Falling back to npx.", flush=True)
        cmd_base = ["npx", "dependency-cruiser"]
        use_shell = True
    else:
        cmd_base = [node_exe, depcruise_js]
        use_shell = False

    try:
        print("   🔍 Running static analysis on files...", flush=True)
        exclude_pattern = "(node_modules|dist|build|\\.git|\\.next|\\.cache|all-contributorsrc|\\.github)"
        rel_target = os.path.relpath(target_path, repo_path).replace("\\", "/")
        args = cmd_base + [target_path, "--no-config"]
        if rel_target == "src":
            args += ["--include-only", "^src"]
        args += [
            "--exclude", exclude_pattern,
            "--max-depth", "4",
            "--do-not-follow", "^(node_modules|npm:)",
            "--output-type", "json",
        ]
        
        result = subprocess.run(args, capture_output=True, text=True, cwd=repo_path, shell=use_shell, timeout=90)
        
        if result.returncode != 0:
            print("   ⚠️  Primary analysis failed. Retrying on root path (greedy)...", flush=True)
            target_idx = len(cmd_base)
            args[target_idx] = repo_path
            try:
                inc_idx = args.index("--include-only")
                args.pop(inc_idx)
                args.pop(inc_idx)
            except ValueError:
                pass
            try:
                md_idx = args.index("--max-depth")
                args[md_idx + 1] = "2"
            except ValueError:
                pass
            result = subprocess.run(args, capture_output=True, text=True, cwd=repo_path, shell=use_shell, timeout=90)
            
        if result.returncode != 0:
            error_msg = result.stderr or result.stdout
            print(f"   ❌ Analysis tool error: {error_msg}", flush=True)
            raise Exception(f"dependency-cruiser failed: {error_msg}")
        
        try:
            data = json.loads(result.stdout)
        except Exception as je:
            print(f"   ⚠️  JSON parse failed: {str(je)}", flush=True)
            data = {"modules": []}
        
        modules = data.get("modules", [])
        if not modules:
            print("   ℹ️  No modules detected by dependency-cruiser. Falling back to folder tree view.", flush=True)
            return build_tree_graph(target_path)
        
        print("   ✅ Static analysis complete.", flush=True)
        return transform_to_react_flow(data)
        
    except Exception as e:
        print(f"   ❌ Analysis internal error: {str(e)}", flush=True)
        print("   ↪️  Falling back to folder tree view...", flush=True)
        try:
            return build_tree_graph(target_path)
        except Exception as fe:
            raise Exception(f"Dependency analysis failed and fallback also failed: {str(fe)}")

def transform_to_react_flow(dc_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transforms dependency-cruiser JSON output into hierarchical React Flow nodes and edges.
    """
    nodes = []
    edges = []
    modules = dc_data.get("modules", [])
    
    folder_nodes_map = {}
    
    def get_or_create_folder(path: str):
        path = path.replace('\\', '/')
        if not path or path == "." or path == "":
            return None
        
        if path in folder_nodes_map:
            return path
            
        parts = path.split("/")
        parent_path = "/".join(parts[:-1]) if len(parts) > 1 else None
        grandparent_id = get_or_create_folder(parent_path) if parent_path else None
        
        folder_id = path
        folder_name = parts[-1]
        
        # Calculate staggering for nested folders to avoid "sandwich" effect
        # If we have a grandparent, we offset from it
        depth = path.count('/')
        folder_nodes_map[folder_id] = {
            "id": folder_id,
            "data": { "label": folder_name },
            "position": { "x": 50, "y": 50 }, # Default relative to parent
            "parentNode": grandparent_id,
            "type": "group",
            "style": { 
                "backgroundColor": "rgba(56, 189, 248, 0.05)", 
                "border": "2px solid rgba(56, 189, 248, 0.4)",
                "borderRadius": "24px",
                "padding": "60px 20px 20px 20px",
                "width": 600,
                "height": 500
            }
        }
        return folder_id

    # 1. Register folders
    for module in modules:
        source_id = module["source"].replace('\\', '/')
        parts = source_id.split("/")
        if len(parts) > 1:
            get_or_create_folder("/".join(parts[:-1]))

    # 2. Layout top-level folders in grid
    top_level_folders = [fid for fid, node in folder_nodes_map.items() if node["parentNode"] is None]
    top_level_folders.sort()
    for i, fid in enumerate(top_level_folders):
        folder_nodes_map[fid]["position"] = { "x": (i % 2) * 800, "y": (i // 2) * 700 }

    # 3. Add files and handle nesting
    files_by_parent = {}
    folder_child_counts: Dict[str, int] = {}
    file_parent: Dict[str, str] = {}
    for i, module in enumerate(modules):
        source_id = module["source"].replace('\\', '/')
        parts = source_id.split("/")
        file_name = parts[-1]
        parent_id = "/".join(parts[:-1]) if len(parts) > 1 else None
        
        if parent_id not in files_by_parent:
            files_by_parent[parent_id] = 0
        file_idx = files_by_parent[parent_id]
        files_by_parent[parent_id] += 1
        if parent_id:
            folder_child_counts[parent_id] = folder_child_counts.get(parent_id, 0) + 1
        file_parent[source_id] = parent_id
        
        nodes.append({
            "id": source_id,
            "data": { "label": file_name },
            "position": { 
                "x": 40 + (file_idx % 3) * 180, 
                "y": 100 + (file_idx // 3) * 100 
            },
            "parentNode": parent_id,
            "zIndex": 10, # Always on top
            "style": { 
                "width": 150, 
                "height": 45,
                "background": "#0f172a",
                "color": "#f8fafc",
                "border": "1px solid rgba(56, 189, 248, 0.6)",
                "borderRadius": "12px",
                "display": "flex",
                "alignItems": "center",
                "justifyContent": "center",
                "fontSize": "11px",
                "fontWeight": "bold"
            }
        })
        
        # Add edges
        for dep in module.get("dependencies", []):
            target_id = dep['resolved'].replace('\\', '/')
            edges.append({
                "id": f"e-{source_id}-{target_id}",
                "source": source_id,
                "target": target_id,
                "animated": True,
                "style": { "stroke": "rgba(56, 189, 248, 0.5)", "strokeWidth": 2 }
            })
    
    agg: Dict[str, int] = {}
    for e in list(edges):
        sp = file_parent.get(e["source"])
        tp = file_parent.get(e["target"])
        if sp and tp and sp != tp:
            k = f"{sp}::{tp}"
            agg[k] = agg.get(k, 0) + 1
    for key, count in agg.items():
        sp, tp = key.split("::", 1)
        width = 1 + min(4, int(count ** 0.5))
        edges.append({
            "id": f"agg-{sp}-{tp}",
            "source": sp,
            "target": tp,
            "animated": True,
            "style": { "stroke": "rgba(56, 189, 248, 0.35)", "strokeWidth": width, "strokeDasharray": "6 4" }
        })
    
    for fid, node in folder_nodes_map.items():
        cnt = folder_child_counts.get(fid, 0)
        if cnt <= 0:
            continue
        cols = 1
        if cnt > 4:
            cols = 2
        if cnt > 12:
            cols = 3
        rows = (cnt + cols - 1) // cols
        node["style"]["width"] = 260 + 180 * cols
        node["style"]["height"] = 160 + 100 * max(1, rows)
    
    return { "nodes": list(folder_nodes_map.values()) + nodes, "edges": edges }

def build_tree_graph(target_path: str) -> Dict[str, Any]:
    print("   🗂️  Building folder tree graph...", flush=True)
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    folder_nodes_map: Dict[str, Dict[str, Any]] = {}
    files_by_parent: Dict[str, int] = {}
    top_level_folders: List[str] = []
    ignore_dirs = {".git", "node_modules", "dist", "build", "__pycache__", ".next", ".cache", ".venv", "venv", ".idea", ".vscode"}
    
    def normalize(p: str) -> str:
        return p.replace("\\", "/")
    
    def get_or_create_folder(path: str):
        path = normalize(path)
        if not path or path == ".":
            return None
        if path in folder_nodes_map:
            return path
        parts = path.split("/")
        parent_path = "/".join(parts[:-1]) if len(parts) > 1 else None
        grandparent_id = get_or_create_folder(parent_path) if parent_path else None
        folder_id = path
        folder_name = parts[-1]
        folder_nodes_map[folder_id] = {
            "id": folder_id,
            "data": { "label": folder_name },
            "position": { "x": 50, "y": 50 },
            "parentNode": grandparent_id,
            "type": "group",
            "style": { 
                "backgroundColor": "rgba(56, 189, 248, 0.08)", 
                "border": "2px solid rgba(56, 189, 248, 0.4)",
                "borderRadius": "24px",
                "padding": "60px 20px 20px 20px",
                "width": 600,
                "height": 500
            }
        }
        if grandparent_id is None:
            top_level_folders.append(folder_id)
        return folder_id
    
    root = normalize(os.path.abspath(target_path))
    file_abs_map: Dict[str, str] = {}
    file_parent: Dict[str, str] = {}
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in ignore_dirs and not d.startswith(".")]
        rel_dir = normalize(os.path.relpath(dirpath, root))
        rel_dir = "" if rel_dir == "." else rel_dir
        if rel_dir:
            get_or_create_folder(rel_dir)
        for fname in filenames:
            if fname.startswith("."):
                continue
            parent_id = rel_dir if rel_dir else None
            key = parent_id or "__root__"
            files_by_parent[key] = files_by_parent.get(key, 0) + 1
            file_idx = files_by_parent[key] - 1
            file_id = f"{rel_dir + '/' if rel_dir else ''}{fname}"
            abs_path = os.path.join(dirpath, fname)
            file_abs_map[file_id] = abs_path
            if parent_id:
                file_parent[file_id] = parent_id
            nodes.append({
                "id": file_id,
                "data": { "label": fname },
                "position": { 
                    "x": 40 + (file_idx % 3) * 180, 
                    "y": 100 + (file_idx // 3) * 100 
                },
                "parentNode": parent_id,
                "zIndex": 10,
                "style": { 
                    "width": 150, 
                    "height": 45,
                    "background": "#0f172a",
                    "color": "#f8fafc",
                    "border": "1px solid rgba(56, 189, 248, 0.6)",
                    "borderRadius": "12px",
                    "display": "flex",
                    "alignItems": "center",
                    "justifyContent": "center",
                    "fontSize": "11px",
                    "fontWeight": "bold"
                }
            })
    for i, fid in enumerate(sorted([f for f in top_level_folders])):
        folder_nodes_map[fid]["position"] = { "x": (i % 2) * 800, "y": (i // 2) * 700 }
    
    folder_child_counts: Dict[str, int] = {}
    for _, cnt in files_by_parent.items():
        pass
    for fid in list(file_parent.values()):
        folder_child_counts[fid] = folder_child_counts.get(fid, 0) + 1
    for fid, node in folder_nodes_map.items():
        cnt = folder_child_counts.get(fid, 0)
        if cnt <= 0:
            continue
        cols = 1
        if cnt > 4:
            cols = 2
        if cnt > 12:
            cols = 3
        rows = (cnt + cols - 1) // cols
        node["style"]["width"] = 260 + 180 * cols
        node["style"]["height"] = 160 + 100 * max(1, rows)
    
    link_re = re.compile(r'^\s*(?:import|export)\s+.*?from\s*[\'"]([^\'"]+)[\'"]|^\s*require\(\s*[\'"]([^\'"]+)[\'"]\s*\)', re.M)
    exts = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"]
    abs_to_id = {os.path.abspath(v): k for k, v in file_abs_map.items()}
    for fid, abs_path in list(file_abs_map.items()):
        lower = abs_path.lower()
        if not (lower.endswith(".ts") or lower.endswith(".tsx") or lower.endswith(".js") or lower.endswith(".jsx") or lower.endswith(".mjs") or lower.endswith(".cjs")):
            continue
        try:
            with open(abs_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
        except Exception:
            continue
        for m in link_re.finditer(content):
            raw = m.group(1) or m.group(2)
            if not raw or not raw.startswith((".", "..")):
                continue
            target_abs = os.path.abspath(os.path.normpath(os.path.join(os.path.dirname(abs_path), raw)))
            candidates = []
            if os.path.isfile(target_abs):
                candidates.append(target_abs)
            for e in exts:
                candidates.append(target_abs + e)
            for e in exts:
                candidates.append(os.path.join(target_abs, "index" + e))
            found_id = None
            for c in candidates:
                cid = abs_to_id.get(c)
                if cid:
                    found_id = cid
                    break
            if found_id:
                edges.append({
                    "id": f"e-{fid}-{found_id}",
                    "source": fid,
                    "target": found_id,
                    "animated": True,
                    "style": { "stroke": "rgba(56, 189, 248, 0.45)", "strokeWidth": 1.8 }
                })
    
    agg: Dict[str, int] = {}
    for e in list(edges):
        sp = file_parent.get(e.get("source"))
        tp = file_parent.get(e.get("target"))
        if sp and tp and sp != tp:
            k = f"{sp}::{tp}"
            agg[k] = agg.get(k, 0) + 1
    for key, count in agg.items():
        sp, tp = key.split("::", 1)
        width = 1 + min(4, int(count ** 0.5))
        edges.append({
            "id": f"agg-{sp}-{tp}",
            "source": sp,
            "target": tp,
            "animated": True,
            "style": { "stroke": "rgba(56, 189, 248, 0.35)", "strokeWidth": width, "strokeDasharray": "6 4" }
        })
    
    print("   ✅ Folder tree graph built.", flush=True)
    return { "nodes": list(folder_nodes_map.values()) + nodes, "edges": edges }
