import React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="text-center pt-8 pb-4 bg-gradient-to-b from-slate-800/50 to-transparent flex-none">
            <h1 className="text-5xl font-bold text-white tracking-tighter italic mb-2" style={{ fontFamily: 'Kanit, sans-serif' }}>
                Tsiolkovsky
            </h1>
            <div className="flex justify-center items-center gap-3 text-sm font-mono text-blue-300">
                <span className="bg-blue-900/30 px-2 py-0.5 rounded border border-blue-500/30">v1.0.0</span>
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px] uppercase font-bold tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.3)]">Stable Version</span>
            </div>
        </div>

        {/* Content Body - Using Grid for Sizing Control */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start overflow-y-auto custom-scrollbar">
            
            {/* Left Column: Mission & Engineer (Smaller) - Span 4 */}
            <div className="md:col-span-4 flex flex-col gap-6 h-full">
                
                {/* Mission Statement - UPDATED FONT SIZE (Smaller) */}
                <div className="text-left bg-slate-800/20 p-4 rounded-xl border border-white/5 flex-grow">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-white/10 pb-1">Overview</h3>
                    <p 
                        className="text-slate-200 leading-relaxed text-[13px]" 
                        style={{ fontFamily: "'Noto Sans', sans-serif" }}
                    >
                        Named after Russian Engineer, <span className="font-bold italic text-white">Konstantin Tsiolkovsky</span>, is an <span className="font-bold text-white">open-source</span>, <span className="font-bold text-white">real-time</span> computational fluid dynamics software engineering, designed to <span className="font-bold text-white">visualize</span> supersonic compressible flows and the formation of shock diamonds using mathematical approach of <span className="font-bold text-white">Riemann Solvers</span>.
                    </p>
                </div>

                {/* Developer Section - UPDATED FONT SIZES (Bigger) */}
                <div className="bg-slate-950/50 rounded-lg p-4 border border-white/5 flex flex-col items-center justify-center flex-none h-32">
                     <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center mb-2 border border-white/10 text-slate-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                     </div>
                     <div className="text-center">
                        <div className="text-white text-lg font-mono font-bold tracking-tight">dbstwn</div>
                        <div className="text-blue-400 text-[11px] font-serif italic mt-0.5">The Engineer</div>
                     </div>
                </div>
            </div>

            {/* Right Column: System Architecture (Bigger) - Span 8 - COMPACT LAYOUT */}
            <div className="md:col-span-8 bg-slate-800/20 rounded-xl p-4 border border-white/5 h-full flex flex-col">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">System Architecture</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                    <ArchitectureCard 
                        title="Solver Engine" 
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />}
                        items={["Finite-Volume Method", "Roe Flux Splitting", "Explicit Time-Stepping", "Auto-Stability Guard"]} 
                    />
                    <ArchitectureCard 
                        title="Visualization" 
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 5 8.268 7.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />}
                        items={["Real-time WebGL/Canvas", "Schlieren Rendering", "Turbo Colormaps", "120 FPS Rendering Loop"]} 
                    />
                    <ArchitectureCard 
                        title="UI Layer" 
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />}
                        items={["React 19 + TypeScript", "Atomic Design System", "Scientific Math Rendering", "Responsive Layout"]} 
                    />
                    <ArchitectureCard 
                        title="Numerics" 
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />}
                        items={["CFL-based Adaptive Δt", "Positivity Preserving", "Entropy Fix", "Dimensional Splitting"]} 
                    />
                </div>
            </div>
        </div>
        
        {/* Footer Action */}
        <div className="bg-slate-950 p-6 border-t border-white/5 flex-none" onClick={onClose}>
            <div className="max-w-xl mx-auto border border-white/10 rounded-lg p-3 bg-slate-900/50 text-center cursor-pointer hover:bg-slate-900 transition-colors">
                 <p className="text-sm font-serif italic text-slate-400">
                    "Remember to look up at the stars and not down at your feet"
                 </p>
                 <p className="text-[10px] uppercase font-bold text-slate-600 mt-2 tracking-widest">
                    — Stephen W. Hawking
                 </p>
            </div>
        </div>

      </div>
    </div>
  );
};

const ArchitectureCard = ({ title, icon, items }: { title: string, icon: React.ReactNode, items: string[] }) => (
    <div className="bg-slate-800/60 border border-white/5 rounded-lg p-3.5 group hover:bg-slate-800/80 transition-colors h-full flex flex-col justify-start">
        <div className="text-xs font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-wide">
            <span className="text-blue-500 group-hover:text-blue-400 transition-colors p-1 bg-blue-500/10 rounded flex-shrink-0">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   {icon}
               </svg>
            </span>
            <span className="">{title}</span>
        </div>
        <ul className="space-y-1.5">
            {items.map((item, i) => (
                <li key={i} className="text-[11px] text-slate-300 font-mono flex items-start gap-2 leading-relaxed">
                    <span className="opacity-30 mt-[3px]">›</span> <span className="break-words">{item}</span>
                </li>
            ))}
        </ul>
    </div>
);