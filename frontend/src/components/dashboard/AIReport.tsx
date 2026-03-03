import { motion } from "framer-motion"
import { Brain, Code2, Star, Globe2, Sparkles, Maximize2, Minimize2, Activity, Zap, Shield, Download, Gauge } from "lucide-react"
import { useProjectStore } from "@/store/projectStore"
import { useState } from "react"
import { createPortal } from "react-dom"

function AIReport() {
  const store = useProjectStore()
  const project = store.getActiveProject()
  const verdict = project?.verdict
  const status = project?.status ?? "idle"
  const [isExpanded, setIsExpanded] = useState(false)

  const isLoading = status === "loading"

  if (!verdict && !isLoading) return null

  const metrics = [
    { label: "Modularity", value: verdict?.metrics?.modularity ?? 0, color: "from-sky-500 to-sky-400", icon: Globe2 },
    { label: "Scalability", value: verdict?.metrics?.scalability ?? 0, color: "from-violet-500 to-violet-400", icon: Zap },
    { label: "Code Quality", value: verdict?.metrics?.quality ?? 0, color: "from-emerald-500 to-emerald-400", icon: Shield },
    { label: "Readability", value: verdict?.metrics?.readability ?? 0, color: "from-amber-500 to-amber-400", icon: Activity },
    { label: "Complexity", value: verdict?.metrics?.complexity ?? 0, color: "from-rose-500 to-rose-400", icon: Gauge },
    { label: "Performance", value: verdict?.metrics?.performance ?? 0, color: "from-blue-500 to-blue-400", icon: Activity },
  ]

  const handlePrint = () => {
    // Dispatch a custom event to trigger html2pdf download
    window.dispatchEvent(new CustomEvent('trigger-pulse-download'))
  }

  const content = (
    <div className={`space-y-6 ${isExpanded ? "fixed inset-0 z-50 bg-slate-950/98 p-8 overflow-y-auto backdrop-blur-3xl print:hidden" : "relative"} transition-all duration-300`}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-2 print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 shadow-[0_0_20px_rgba(56,189,248,0.1)]">
            <Brain className="h-5 w-5 text-sky-400" />
          </div>
          <div>
            <h3 className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-sky-400/80 leading-none mb-1">
              Pulse Engine
            </h3>
            <span className="text-xs font-bold text-slate-100">Deep Architectural Audit</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="flex h-9 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-4 text-[0.6rem] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              Export PDF
            </button>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
        </div>
      </div>

      <div className={`grid gap-6 ${isExpanded ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"}`}>
        
        {/* ── Left Column: Scores ── */}
        <div className={isExpanded ? "lg:col-span-4 space-y-6" : "space-y-6"}>
          <div className="grid grid-cols-2 gap-4">
              {/* Pulse Score */}
              <motion.div layout className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-linear-to-br from-sky-500/10 via-slate-900/60 to-slate-900/40 p-4 backdrop-blur-xl">
                <p className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-sky-400/60 mb-2">Pulse Score</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{verdict?.score ?? 0}</span>
                    <span className="text-[0.6rem] font-bold text-slate-500">/100</span>
                </div>
              </motion.div>

              {/* Impact Score */}
              <motion.div layout className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-linear-to-br from-rose-500/10 via-slate-900/60 to-slate-900/40 p-4 backdrop-blur-xl">
                <p className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-rose-400/60 mb-2">Impact Score</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{verdict?.impact_score ?? 0}</span>
                    <span className="text-[0.6rem] font-bold text-slate-500">/100</span>
                </div>
                <div className="absolute top-2 right-2">
                    <Zap className="h-3 w-3 text-rose-500 animate-pulse" />
                </div>
              </motion.div>
          </div>

          {/* Visual Metrics Chart */}
          <motion.div layout className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-6 backdrop-blur-xl">
            <h4 className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
              <Activity className="h-3 w-3" /> System Calibration
            </h4>
            <div className="space-y-5">
              {metrics.map((m) => (
                <div key={m.label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <m.icon className="h-3 w-3 text-slate-400" />
                      <span className="text-[0.6rem] font-bold text-slate-300">{m.label}</span>
                    </div>
                    <span className="text-[0.6rem] font-black tabular-nums text-white">{m.value}%</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${isLoading ? 0 : m.value}%` }}
                      className={`h-full bg-linear-to-r ${m.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Right Column: Insights ── */}
        <div className={isExpanded ? "lg:col-span-8 space-y-6" : "space-y-6"}>
          
          {/* Gold Nugget - The "Diamond" in code */}
          {verdict?.gold_nugget && !isLoading && (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-linear-to-br from-amber-500/10 via-slate-950 to-slate-950 p-6 shadow-2xl"
            >
                <div className="absolute top-0 right-0 p-4">
                    <Star className="h-6 w-6 text-amber-500 fill-amber-500 blur-[2px] opacity-20" />
                    <Star className="absolute top-4 right-4 h-6 w-6 text-amber-500" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                    <Code2 className="h-4 w-4 text-amber-400" />
                    <h4 className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-amber-400">The Gold Nugget</h4>
                </div>
                <p className="text-xs text-slate-400 mb-4 font-medium italic">
                    "{verdict.gold_nugget.explanation}"
                </p>
                <div className="rounded-xl border border-slate-800 bg-black/50 p-4">
                    <div className="flex items-center justify-between mb-2 text-[0.6rem] text-slate-500 border-b border-slate-800 pb-2">
                        <span>{verdict.gold_nugget.file}</span>
                        <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> High Elegance</span>
                    </div>
                    <pre className="text-[0.7rem] leading-relaxed text-amber-100 font-mono whitespace-pre-wrap">
                        {verdict.gold_nugget.snippet}
                    </pre>
                </div>
            </motion.div>
          )}

          {/* Detailed Feed Report */}
          <motion.div layout className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-4 w-4 text-sky-400" />
              <h3 className="text-[0.65rem] font-black uppercase tracking-[0.25em] text-slate-100">Audit Narrative</h3>
            </div>
            
            {isLoading ? (
                <div className="space-y-4">
                  <div className="h-3 w-full rounded bg-slate-800/40 animate-pulse" />
                  <div className="h-3 w-[90%] rounded bg-slate-800/40 animate-pulse" />
                  <div className="h-3 w-[95%] rounded bg-slate-800/40 animate-pulse" />
                </div>
            ) : (
                <div className="text-[0.85rem] leading-relaxed text-slate-300 font-sans selection:bg-sky-500/30">
                  {verdict?.detailed_feedback ? (
                    (() => {
                      const renderLine = (text: string) => {
                        const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
                        return parts.map((part, i) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i} className="text-white font-black">{part.slice(2, -2)}</strong>
                          }
                          if (part.startsWith('`') && part.endsWith('`')) {
                            return <code key={i} className="rounded bg-slate-800/50 px-1 py-0.5 font-mono text-sky-300 text-[0.7rem]">{part.slice(1, -1)}</code>
                          }
                          return part
                        })
                      }

                      return verdict.detailed_feedback.split('\n').map((line, idx) => {
                        const trimmedLine = line.trim()
                        if (!trimmedLine && idx !== 0) return <div key={idx} className="h-4" />

                        // H3 Headers
                        if (line.startsWith('### ')) {
                          return <h3 key={idx} className="text-sky-400 font-black tracking-wider uppercase text-[0.75rem] mt-8 mb-3 flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-sky-500" />
                            {line.replace('### ', '')}
                          </h3>
                        }
                        // H2 Headers
                        if (line.startsWith('## ')) {
                          return <h2 key={idx} className="text-white font-black tracking-[0.2em] uppercase text-sm mt-12 mb-4 border-b border-slate-800/50 pb-2">{line.replace('## ', '')}</h2>
                        }
                        // List items
                        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                          return (
                            <div key={idx} className="flex gap-3 ml-2 mb-2 group">
                              <span className="text-sky-500/60 mt-1.5 h-1.5 w-1.5 rounded-full bg-sky-500/20 border border-sky-500/40" />
                              <div className="flex-1">{renderLine(trimmedLine.substring(2))}</div>
                            </div>
                          )
                        }
                        
                        return (
                          <div key={idx} className="mb-3">
                            {renderLine(line)}
                          </div>
                        )
                      })
                    })()
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500 italic">
                      <Activity className="h-3 w-3 animate-spin" />
                      Synthesizing architecture...
                    </div>
                  )}
                </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Print Template (Hidden unless printing) ── */}
      <div className="hidden print:block fixed inset-0 bg-white p-12 text-black font-sans z-50">
          <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-10">
              <div>
                  <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">Pulse Audit</h1>
                  <p className="text-sm font-bold tracking-widest text-slate-500 uppercase">Official Architectural Verdict</p>
              </div>
              <div className="text-right">
                  <p className="text-xs font-black uppercase text-slate-400">Scan ID</p>
                  <p className="text-lg font-mono font-bold tracking-tighter">#{project?.id.slice(0,8).toUpperCase()}</p>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12">
              <div className="border-l-8 border-black pl-6">
                  <p className="text-[0.6rem] font-black uppercase text-slate-400 mb-1">Pulse Health Score</p>
                  <p className="text-7xl font-black">{verdict?.score ?? 0}<span className="text-2xl text-slate-300">/100</span></p>
              </div>
              <div className="border-l-8 border-rose-600 pl-6">
                  <p className="text-[0.6rem] font-black uppercase text-slate-400 mb-1">Architecture Impact</p>
                  <p className="text-7xl font-black">{verdict?.impact_score ?? 0}<span className="text-2xl text-slate-300">/100</span></p>
              </div>
          </div>

          <div className="space-y-8">
              <section>
                  <h4 className="text-xs font-black uppercase tracking-widest bg-black text-white px-3 py-1 inline-block mb-4">Core Verdict</h4>
                  <p className="text-2xl font-bold leading-tight">{verdict?.top_finding}</p>
              </section>

              <div className="grid grid-cols-2 gap-12">
                  <section>
                      <h4 className="text-[0.6rem] font-black uppercase text-slate-400 mb-2 border-b-2 border-slate-100 pb-1">Technical Assessment</h4>
                      <p className="text-sm mb-4 leading-relaxed">{verdict?.tech_debt}</p>
                      <h4 className="text-[0.6rem] font-black uppercase text-slate-400 mb-2 border-b-2 border-slate-100 pb-1">Innovation Index</h4>
                      <p className="text-sm leading-relaxed">{verdict?.innovation}</p>
                  </section>

                  <section>
                      <h4 className="text-[0.6rem] font-black uppercase text-slate-400 mb-2 border-b-2 border-slate-100 pb-1">Project Topology</h4>
                      <div className="text-[0.55rem] font-mono leading-tight max-h-[250px] overflow-hidden">
                          {project?.graph?.nodes?.slice(0, 40).map((node, i) => (
                              <div key={i} className="flex items-center gap-2 mb-1">
                                  <span className="text-slate-300">[{node.type === 'folder' ? 'DIR' : 'FIL'}]</span>
                                  <span className={node.type === 'folder' ? 'font-black' : ''}>{node.label}</span>
                              </div>
                          ))}
                          {(project?.graph?.nodes?.length ?? 0) > 40 && (
                            <div className="text-slate-300 italic">
                                ...and {(project?.graph?.nodes?.length ?? 0) - 40} more nodes
                            </div>
                          )}
                      </div>
                  </section>
              </div>
          </div>

          <div className="mt-16 pt-8 border-t-4 border-black flex justify-between items-end">
              <div className="flex gap-6">
                  {metrics.map(m => (
                      <div key={m.label}>
                          <p className="text-[0.5rem] font-black uppercase text-slate-400">{m.label}</p>
                          <p className="text-lg font-black">{m.value}%</p>
                      </div>
                  ))}
              </div>
              <div className="text-right">
                <p className="text-[0.5rem] text-slate-400 font-bold uppercase tracking-widest">Pulse X-Ray Advisor</p>
                <p className="text-[0.6rem] font-black italic">AUTHENTIFIED ARCHITECTURAL AUDIT</p>
              </div>
          </div>
      </div>

    </div>
  )

  // Use Portal to prevent inheritance of parent transforms when expanded
  return isExpanded ? createPortal(content, document.body) : content
}

export default AIReport
