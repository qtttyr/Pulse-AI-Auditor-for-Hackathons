import subprocess
import json
import os
import shutil
import re
from typing import Dict, List, Any

def analyze_dependencies(repo_path: str, target_path: str) -> Dict[str, Any]:
    """
    Main entry point for repository analysis. 
    1. Scan the filesystem for a full tree of files/folders.
    2. Try to run dependency-cruiser for deep JS/TS mapping.
    3. Merge dependency data into the file tree.
    """
    print(f"   🔍 Analyzing repository structure at {target_path}...", flush=True)
    
    # 1. Build the base tree (guarantees we see ALL files/folders)
    graph_data = build_file_tree(repo_path, target_path)
    
    # 2. Try to enrich with dependency analysis if it's a JS/TS project
    try:
        graph_data = enrich_with_dependencies(repo_path, target_path, graph_data)
    except Exception as e:
        print(f"   ⚠️  Dependency enrichment failed (non-critical): {str(e)}", flush=True)
    
    # 3. Always refresh stats (folder sizes) before returning
    refresh_folder_stats(graph_data)
    return graph_data

def build_file_tree(repo_path: str, target_path: str) -> Dict[str, Any]:
    """
    Walks the filesystem and builds the initial node list (folders and files).
    """
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    folder_nodes_map: Dict[str, Dict[str, Any]] = {}
    
    ignore_dirs = {
        ".git", "node_modules", "dist", "build", "__pycache__", 
        ".next", ".cache", ".venv", "venv", ".idea", ".vscode",
        "target", "vendor", "pods"
    }
    
    def normalize(p: str) -> str:
        return p.replace("\\", "/")

    root_abs = os.path.abspath(target_path)
    
    for dirpath, dirnames, filenames in os.walk(root_abs):
        # Filter directories in-place
        dirnames[:] = [d for d in dirnames if d not in ignore_dirs and not d.startswith(".")]
        
        rel_dir = normalize(os.path.relpath(dirpath, root_abs))
        rel_dir = "" if rel_dir == "." else rel_dir
        
        # 1. Ensure folder nodes exist
        if rel_dir:
            path_parts = rel_dir.split("/")
            temp_path = ""
            for i, part in enumerate(path_parts):
                parent_path = temp_path
                temp_path = f"{temp_path}/{part}" if temp_path else part
                
                if temp_path not in folder_nodes_map:
                    folder_nodes_map[temp_path] = {
                        "id": temp_path,
                        "type": "folder",
                        "data": {"label": part},
                        "position": {"x": 0, "y": 0},
                        "parentId": parent_path or None,
                        "style": {
                            "backgroundColor": "rgba(56, 189, 248, 0.05)",
                            "border": "2px solid rgba(56, 189, 248, 0.4)",
                            "borderRadius": "24px",
                            "padding": "60px 20px 20px 20px",
                            "width": 300,
                            "height": 200
                        }
                    }

        # 2. Add file nodes
        for fname in filenames:
            if fname.startswith("."): # Skip hidden files like .env, .DS_Store
                continue
            
            parent_id = rel_dir if rel_dir else None
            file_id = f"{rel_dir + '/' if rel_dir else ''}{fname}"
            
            nodes.append({
                "id": file_id,
                "type": "file",
                "data": {"label": fname},
                "position": {"x": 50, "y": 50}, # Default relative to parent
                "parentId": parent_id,
                "style": {
                    "width": 160,
                    "height": 45,
                    "background": "#0f172a",
                    "color": "#f8fafc",
                    "border": "1px solid rgba(56, 189, 248, 0.6)",
                    "borderRadius": "12px",
                    "display": "flex",
                    "alignItems": "center",
                    "justifyContent": "center",
                    "fontSize": "11px",
                    "fontWeight": "bold",
                }
            })

    # Convert folder map to list
    final_nodes = list(folder_nodes_map.values()) + nodes
    
    # Simple heuristic to extract dependencies for any language (import/require/from)
    enrich_simple_regex_edges(root_abs, final_nodes, edges)
    
    return {"nodes": final_nodes, "edges": edges}

def enrich_simple_regex_edges(root_abs: str, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]):
    """
    Minimalist regex-based dependency tracing for all languages.
    """
    import_patterns = [
        re.compile(r"^\s*(?:import|from|require)\s+['\"](@?[\w\-\./]+)['\"]", re.M), # JS/Python/TS
        re.compile(r"^\s*using\s+([\w\.]+);", re.M), # C#
        re.compile(r"^\s*include\s+['\"<]([\w\.]+)[>'\"]", re.M), # C++
    ]
    
    file_nodes = {n["id"]: n for n in nodes if n["type"] == "file"}
    
    for file_id, node in file_nodes.items():
        abs_path = os.path.join(root_abs, file_id)
        if not os.path.isfile(abs_path) or os.path.getsize(abs_path) > 100000: # Skip binary/huge
            continue
            
        try:
            with open(abs_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
            for pattern in import_patterns:
                for match in pattern.finditer(content):
                    target_raw = match.group(1)
                    
                    # Try to resolve relative path
                    # This is very simplified but works for many cases
                    potential_targets = []
                    if target_raw.startswith("."):
                        dirname = os.path.dirname(file_id)
                        target_path = os.path.normpath(os.path.join(dirname, target_raw)).replace("\\", "/")
                        potential_targets.append(target_path)
                        # Add common extensions
                        for ext in [".ts", ".tsx", ".js", ".jsx", ".py"]:
                            potential_targets.append(target_path + ext)
                    
                    for pt in potential_targets:
                        if pt in file_nodes:
                            edge_id = f"e-{file_id}-{pt}"
                            if not any(e["id"] == edge_id for e in edges):
                                edges.append({
                                    "id": edge_id,
                                    "source": file_id,
                                    "target": pt,
                                    "animated": True,
                                    "style": {"stroke": "rgba(56, 189, 248, 0.45)", "strokeWidth": 1.5}
                                })
                            break
        except:
            continue

def enrich_with_dependencies(repo_path: str, target_path: str, base_graph: Dict[str, Any]) -> Dict[str, Any]:
    """
    Attempts to use dependency-cruiser for precise JS/TS mapping.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    depcruise_js = os.path.join(base_dir, "node_modules", "dependency-cruiser", "bin", "dependency-cruise.mjs")
    node_exe = shutil.which("node") or "node"
    
    if not os.path.exists(depcruise_js):
        cmd_base = ["npx", "dependency-cruiser"]
        use_shell = True
    else:
        cmd_base = [node_exe, depcruise_js]
        use_shell = False

    exclude_pattern = "(node_modules|dist|build|\\.git|\\.next|\\.cache|venv|__pycache__)"
    args = cmd_base + [target_path, "--no-config", "--exclude", exclude_pattern, "--output-type", "json", "--max-depth", "5"]
    
    try:
        result = subprocess.run(args, capture_output=True, text=True, cwd=repo_path, shell=use_shell, timeout=45)
        if result.returncode != 0:
            return base_graph
            
        data = json.loads(result.stdout)
        modules = data.get("modules", [])
        
        # Merge dependency-cruiser edges into our base graph
        existing_edges = {e["id"] for e in base_graph["edges"]}
        node_ids = {n["id"] for n in base_graph["nodes"]}
        
        for module in modules:
            source = module["source"].replace("\\", "/")
            if source not in node_ids:
                continue
                
            for dep in module.get("dependencies", []):
                target = dep["resolved"].replace("\\", "/")
                if target in node_ids and source != target:
                    edge_id = f"e-{source}-{target}"
                    if edge_id not in existing_edges:
                        base_graph["edges"].append({
                            "id": edge_id,
                            "source": source,
                            "target": target,
                            "animated": True,
                            "style": {"stroke": "rgba(56, 189, 248, 0.6)", "strokeWidth": 2}
                        })
                        existing_edges.add(edge_id)
                        
        # Add folder labels counts
        refresh_folder_stats(base_graph)
        return base_graph
        
    except Exception:
        return base_graph

def refresh_folder_stats(graph: Dict[str, Any]):
    """
    Updates folder sizes and counts for visualization.
    """
    node_map = {n["id"]: n for n in graph["nodes"]}
    child_counts: Dict[str, int] = {}
    
    for n in graph["nodes"]:
        pid = n.get("parentId")
        if pid:
            child_counts[pid] = child_counts.get(pid, 0) + 1
            
    for fid, count in child_counts.items():
        if fid in node_map:
            cols = 1 if count <= 4 else (2 if count <= 12 else 3)
            rows = (count + cols - 1) // cols
            node_map[fid]["style"]["width"] = 280 + 200 * cols
            node_map[fid]["style"]["height"] = 220 + 130 * max(1, rows)
            # Update label to include count
            # node_map[fid]["data"]["label"] += f" ({count})"

