import { motion } from "framer-motion"

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="relative mx-auto mb-4 h-16 w-16">
            <div className="absolute inset-0 animate-spin rounded-full border-b-2 border-sky-500" />
            <div className="absolute inset-2 animate-spin rounded-full border-t-2 border-violet-500 direction-[reverse]" />
        </div>
        <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-slate-100 mb-1">Synchronizing Matrix</p>
        <p className="text-[0.5rem] font-bold uppercase tracking-widest text-slate-500">Decrypting Architecture Pattern</p>
      </motion.div>
    </div>
  )
}
