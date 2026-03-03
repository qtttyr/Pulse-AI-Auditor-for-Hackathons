import { useProjectStore } from "@/store/projectStore"
import type { GraphNode } from "@/store/projectStore"
import { Brain, Star, Folder, FileCode, CheckCircle2 } from "lucide-react"
import { useEffect } from "react"
import html2pdf from 'html2pdf.js'

interface TreeNode {
  name: string;
  type: string;
  children: Record<string, TreeNode>;
}

export function ReportExport() {
  const store = useProjectStore()
  const project = store.getActiveProject()
  const verdict = project?.verdict
  
  // Listen for a custom event to trigger PDF generation
  useEffect(() => {
    const handleDownload = () => {
      const element = document.getElementById('pulse-audit-report')
      if (!element) return

      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `pulse-audit-${project?.name || 'repo'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true,
          scrollY: 0
        },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all' as const, 'css' as const, 'legacy' as const] }
      }

      // Temporarily make visible for capture
      element.style.display = 'block'
      element.style.opacity = '1'
      
      html2pdf().set(opt).from(element).save().then(() => {
        element.style.display = 'none'
        element.style.opacity = '0'
      })
    }

    window.addEventListener('trigger-pulse-download', handleDownload)
    return () => window.removeEventListener('trigger-pulse-download', handleDownload)
  }, [project, verdict])

  if (!project || !verdict) return null

  const metrics = [
    { label: "Modularity", value: verdict?.metrics?.modularity ?? 0 },
    { label: "Scalability", value: verdict?.metrics?.scalability ?? 0 },
    { label: "Quality", value: verdict?.metrics?.quality ?? 0 },
    { label: "Readability", value: verdict?.metrics?.readability ?? 0 },
    { label: "Complexity", value: verdict?.metrics?.complexity ?? 0 },
    { label: "Performance", value: verdict?.metrics?.performance ?? 0 },
  ]

  // --- Tree Logic ---
  const buildTree = (nodes: GraphNode[]) => {
    const root: TreeNode = { name: project.name || "repository", type: "folder", children: {} }
    nodes.forEach(node => {
      const parts = node.id.split(/[\\/]/).filter(Boolean)
      let current = root
      parts.forEach((part: string, i: number) => {
        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            type: i === parts.length - 1 ? (node.type || 'file') : "folder",
            children: {}
          }
        }
        current = current.children[part]
      })
    })
    return root
  }

  const renderTree = (node: TreeNode, depth = 0): React.ReactNode => {
    const children = Object.values(node.children)
    return (
      <div key={node.name} style={{ marginLeft: depth > 0 ? '1.5rem' : '0' }}>
        <div className="flex items-center gap-2 py-0.5 border-l border-slate-200 pl-2 -ml-2">
            {node.type === "folder" ? <Folder className="h-3 w-3 text-slate-400" /> : <FileCode className="h-3 w-3 text-slate-300" />}
            <span className={`${node.type === 'folder' ? 'font-bold text-black' : 'text-slate-600'} text-[0.65rem]`}>
                {node.name}
            </span>
        </div>
        {children.length > 0 && (
          <div className="mt-0.5">
            {children.map(child => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const projectTree = buildTree(project.graph?.nodes || [])

  return (
    <div 
      id="pulse-audit-report" 
      className="fixed opacity-0 pointer-events-none print:opacity-100 print:pointer-events-auto print:static print:block bg-white text-black p-12 font-sans min-h-screen z-99999"
    >
      {/* --- Paper Header --- */}
      <div className="flex justify-between items-start border-b-8 border-slate-900 pb-8 mb-12">
        <div>
          <div className="flex items-center gap-4 mb-4">
             <div className="bg-black p-3 rounded-2xl">
                <Brain className="h-10 w-10 text-white" />
             </div>
             <div>
                <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">PULSE AUDIT</h1>
                <p className="text-sm font-bold tracking-[0.4em] text-slate-400 uppercase mt-2">Verification Certificate</p>
             </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[0.6rem] font-black text-slate-400 uppercase mb-1">Target Repository</p>
          <p className="text-xl font-black tracking-tight mb-2 underline">{project.name}</p>
          <div className="bg-slate-50 border border-slate-200 px-3 py-1 font-mono text-[0.6rem] font-bold rounded">
            SCAN_ID: {project.id.slice(0,16).toUpperCase()}
          </div>
        </div>
      </div>

      {/* --- Executive Summary --- */}
      <div className="grid grid-cols-3 gap-12 mb-16">
        <div className="col-span-2 space-y-8">
          <section>
            <h2 className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-sky-600 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Core Findings
            </h2>
            <div className="bg-slate-50 p-6 rounded-2xl border-l-8 border-black">
                <p className="text-2xl font-black leading-tight text-slate-900">{verdict.top_finding}</p>
            </div>
          </section>
          
          <div className="grid grid-cols-2 gap-8">
             <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <h3 className="text-[0.6rem] font-black uppercase text-slate-400 mb-2">Technical Limitations</h3>
                <p className="text-xs leading-relaxed text-slate-600 font-medium">{verdict.tech_debt}</p>
             </div>
             <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-right">
                <h3 className="text-[0.6rem] font-black uppercase text-slate-400 mb-2">Architecture Innovation</h3>
                <p className="text-xs leading-relaxed text-slate-600 font-medium">{verdict.innovation}</p>
             </div>
          </div>
        </div>

        <div className="relative group page-break-inside-avoid">
            <div className="absolute -inset-1 bg-linear-to-r from-slate-200 to-slate-100 rounded-3xl opacity-50" />
            <div className="relative bg-white p-8 rounded-2xl border-2 border-slate-900 flex flex-col justify-center items-center shadow-xl">
                <p className="text-[0.7rem] font-black uppercase text-slate-400 mb-4 tracking-widest">Pulse Performance</p>
                <div className="text-8xl font-black text-slate-900 tracking-tighter">{verdict.score}</div>
                <div className="h-1.5 w-24 bg-sky-500 rounded-full my-6" />
                <div className="text-[0.6rem] font-black uppercase tracking-[0.3em] bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
                    Validated
                </div>
            </div>
        </div>
      </div>

      {/* --- Metric Matrix --- */}
      <div className="grid grid-cols-6 gap-6 mb-20 page-break-inside-avoid">
        {metrics.map(m => (
          <div key={m.label} className="bg-slate-50/30 border-t-4 border-slate-100 p-4 text-center rounded-b-xl">
            <p className="text-[0.55rem] font-black uppercase text-slate-400 mb-2">{m.label}</p>
            <p className="text-2xl font-black text-slate-900">{m.value}%</p>
          </div>
        ))}
      </div>

      {/* --- The Gold Nugget --- */}
      {verdict.gold_nugget && (
        <div className="border-t-4 border-b-4 border-slate-900 py-12 mb-20 page-break-inside-avoid">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
                    <h2 className="text-2xl font-black uppercase tracking-tighter">The Gold Nugget</h2>
                </div>
                <div className="text-[0.6rem] font-mono font-bold text-slate-400 border border-slate-200 px-4 py-1 rounded-full uppercase">
                    Highest Elegance Priority
                </div>
            </div>
            <p className="text-lg font-bold text-slate-800 mb-8 border-l-4 border-amber-500 pl-6 italic">
                "{verdict.gold_nugget.explanation}"
            </p>
            <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl">
                <p className="text-[0.6rem] font-mono font-bold text-sky-400 mb-4 uppercase tracking-widest border-b border-sky-400/20 pb-2">
                    Source: {verdict.gold_nugget.file}
                </p>
                <pre className="text-xs font-mono leading-relaxed text-slate-300 whitespace-pre-wrap">
                    {verdict.gold_nugget.snippet}
                </pre>
            </div>
        </div>
      )}

      {/* --- Detailed Audit Narrative --- */}
      <div className="mb-20">
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-10 border-b-4 border-black pb-4">Architectural Audit Narrative</h2>
        <div className="columns-2 gap-16 prose prose-slate max-w-none text-sm leading-relaxed text-slate-700 font-medium">
            {verdict.detailed_feedback?.split('\n').map((line: string, i: number) => {
                if (!line.trim()) return <div key={i} className="h-4" />
                if (line.startsWith('###')) return <h3 key={i} className="text-sm font-black uppercase mt-10 mb-4 text-slate-900 border-b-2 border-slate-100 pb-1">{line.replace('### ', '')}</h3>
                if (line.startsWith('##')) return <h2 key={i} className="text-xl font-black uppercase mt-12 mb-6 text-black border-l-4 border-black pl-4">{line.replace('## ', '')}</h2>
                if (line.trim().startsWith('-')) return <li key={i} className="ml-6 mb-3 list-disc marker:text-sky-500">{line.trim().substring(2)}</li>
                return <p key={i} className="mb-5">{line}</p>
            })}
        </div>
      </div>

      {/* --- Topology / Tree --- */}
      <div className="page-break-before-always pt-12">
        <div className="flex items-center justify-between mb-10 border-b-4 border-black pb-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter">Project Topology Map</h2>
            <div className="flex gap-4 text-[0.6rem] font-black uppercase text-slate-400">
                <span>Folders: {project.graph?.nodes?.filter(n => n.type === 'folder').length}</span>
                <span>Files: {project.graph?.nodes?.filter(n => n.type === 'file').length}</span>
            </div>
        </div>
        <div className="bg-slate-50 p-12 rounded-3xl border border-slate-100">
            {renderTree(projectTree)}
        </div>
      </div>

      {/* --- Footer Stamp --- */}
      <div className="mt-32 pt-12 border-t border-slate-200 flex justify-between items-center opacity-40">
        <div className="flex items-center gap-4">
            <Brain className="h-6 w-6" />
            <div>
                <p className="text-[0.6rem] font-black uppercase tracking-[0.2em]">Pulse X-Ray Advisor</p>
                <p className="text-[0.5rem] tracking-tighter font-mono italic">GENERATED VIA AGENTIC-AI MODEL SYSTEM V4 • 2026</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-[0.5rem] font-black uppercase mb-1">Authentification Seal</p>
            <div className="h-10 w-10 border-2 border-slate-900 rounded-lg flex items-center justify-center font-black text-xs rotate-12">P</div>
        </div>
      </div>
      
      <style>{`
        @media print {
          html, body { 
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          #pulse-audit-report {
            display: block !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            position: absolute !important;
            left: 0;
            top: 0;
            width: 100%;
            z-index: 999999 !important;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
          .page-break-before-always {
            page-break-before: always;
          }
          @page { 
            size: A4; 
            margin: 1cm; 
          }
        }
      `}</style>
    </div>
  )
}
