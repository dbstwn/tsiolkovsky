import React, { useState, useEffect, useCallback, useRef } from 'react';

interface ProTipsProps {
  onComplete: () => void;
}

interface Step {
  target: string;
  title: string;
  content: string;
  type: 'desc' | 'func';
}

const TIPS_STEPS: Step[] = [
  {
    target: '#sim-canvas-area',
    title: 'Simulation Result',
    content: 'This viewport renders the real-time fluid dynamics. It visualizes the jet flow using the selected method (e.g., Schlieren, Density) and renders shock diamonds as they form.',
    type: 'desc',
  },
  {
    target: '#sim-legend',
    title: 'Legend Scale Bar',
    content: 'Indicates the quantitative range of the current visualization. The colors correspond to the min and max values of the physical field being rendered.',
    type: 'desc',
  },
  {
    target: '#sim-hud-annotations',
    title: 'Annotations',
    content: 'Toggle this checkbox to overlay the reference grid, nozzle geometry, and flow direction arrows for better spatial context.',
    type: 'func',
  },
  {
    target: '#metric-cards-bar',
    title: 'Live Metrics',
    content: 'Monitor key physical properties like Terminal Velocity and Pressure. Click the (?) icon on any card to open a detailed scientific explanation.',
    type: 'desc',
  },
  {
    target: '#ctrl-main-actions',
    title: 'Simulation Control',
    content: 'Start, Stop, or Reset the solver. Use Reset if the simulation becomes unstable or to restart the flow development.',
    type: 'func',
  },
  {
    target: '#ctrl-speed',
    title: 'Simulation Speed',
    content: 'Control the time-stepping multiplier. Higher speeds (e.g., 4x) calculate more physics steps per frame but may tax your processor.',
    type: 'func',
  },
  {
    target: '#ctrl-vis-mode',
    title: 'Visualization Mode',
    content: 'Switch between different rendering modes. "Schlieren" mimics experimental photography, while others show raw scalar fields like Pressure or Mach.',
    type: 'func',
  },
  {
    target: '#ctrl-tabs',
    title: 'Control Deck Tabs',
    content: 'Navigate between "Preset" (quick setups), "Settings" (fine-grained physical parameters), and "CFL" (numerical stability controls).',
    type: 'func',
  },
  {
    target: '#ctrl-tab-content',
    title: 'Flow Presets',
    content: 'Quickly load standard flow configurations. Try "Shock Diamonds" to see the classic underexpanded jet phenomenon immediately.',
    type: 'func',
  }
];

export const ProTips: React.FC<ProTipsProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'name' | 'welcome' | 'tour'>('name');
  const [userName, setUserName] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  
  // Terms & Warning States
  const [agreed, setAgreed] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const warningTimeout = useRef<any>(null);

  // --- Logic for Name Input ---
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Regex for alphabet only, max 7 chars
    if (/^[a-zA-Z]*$/.test(val) && val.length <= 7) {
      setUserName(val);
    }
  };

  const submitName = () => {
    if (userName.length > 0) {
      setPhase('welcome');
    }
  };

  // --- Logic for Warning Popup ---
  const handleStartTourClick = () => {
      if (!agreed) {
          setShowWarning(true);
          // Clear existing timeout if any
          if (warningTimeout.current) clearTimeout(warningTimeout.current);
          // Set new timeout to hide
          warningTimeout.current = setTimeout(() => {
              setShowWarning(false);
          }, 5000);
          return;
      }
      setPhase('tour');
  };

  useEffect(() => {
      return () => {
          if (warningTimeout.current) clearTimeout(warningTimeout.current);
      };
  }, []);

  // --- Logic for Tour ---
  const updateRect = useCallback(() => {
    const targetEl = document.querySelector(TIPS_STEPS[currentStep].target);
    if (targetEl) {
      setRect(targetEl.getBoundingClientRect());
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep]);

  useEffect(() => {
    if (phase === 'tour') {
      // Small delay to ensure DOM is ready if transitioning from welcome
      setTimeout(updateRect, 100);
      window.addEventListener('resize', updateRect);
      window.addEventListener('scroll', updateRect);
      return () => {
        window.removeEventListener('resize', updateRect);
        window.removeEventListener('scroll', updateRect);
      };
    }
  }, [phase, updateRect]);

  const handleNext = () => {
    if (currentStep < TIPS_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  // --- RENDER PHASE 1: NAME INPUT ---
  if (phase === 'name') {
    return (
      <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-500">
        <div className="bg-slate-900 border border-white/10 p-10 rounded-3xl shadow-2xl max-w-md w-full text-center relative overflow-hidden group">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
          
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Identify Yourself</h2>
          <p className="text-slate-400 text-sm mb-8">Please enter your callsign to initialize the simulation console.</p>
          
          <div className="relative mb-8 group">
             <input 
                type="text" 
                value={userName}
                onChange={handleNameChange}
                placeholder="PILOT"
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] uppercase text-blue-400 focus:outline-none focus:border-blue-500/50 focus:bg-slate-800 transition-all placeholder:text-slate-700 placeholder:tracking-normal placeholder:font-normal placeholder:text-sm"
                autoFocus
             />
             {/* Character count removed as requested */}
          </div>

          <button 
             onClick={submitName}
             disabled={userName.length === 0}
             className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-500/20"
          >
             Initialize System
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER PHASE 2: WELCOME ---
  if (phase === 'welcome') {
    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 
               Structural Change: Separate the "Visual" card (with clipping) from the "Content" container (without clipping).
               This allows the Warning Popup to float OUTSIDE the card boundaries without being cut off.
            */}
            <div className="relative w-full max-w-3xl">
                
                {/* 1. VISUAL LAYER: Background, Glow, Border (Clipped) */}
                <div className="absolute inset-0 bg-slate-900/80 border border-white/10 rounded-3xl shadow-2xl overflow-hidden pointer-events-none">
                    {/* Decorative Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-blue-600/10 blur-[100px] rounded-full"></div>
                </div>

                {/* 2. CONTENT LAYER: Layout (Not Clipped) */}
                <div className="relative z-10 p-10 flex flex-col items-center text-center">
                    
                    <div className="mb-2">
                        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                            Access Granted
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter">
                        Welcome, <span className="text-blue-400 italic">{userName}</span>
                    </h1>
                    
                    <h2 className="text-xl text-slate-400 font-light mb-8 italic" style={{fontFamily: 'Kanit, sans-serif'}}>
                        to Tsiolkovsky Simulator
                    </h2>

                    <div className="bg-slate-800/40 backdrop-blur border border-white/5 rounded-2xl p-6 mb-6 w-full text-left space-y-4 shadow-inner">
                        <p className="text-slate-300 text-sm leading-relaxed text-justify">
                            This version represents the <strong className="text-white">first-generation release</strong> of the Tsiolkovsky Simulator, this release emphasizes <strong className="text-white">high-fidelity physical modeling</strong> through the implementation of <strong className="text-emerald-400">Roe-Riemann solvers</strong>. This first-generation version is intended exclusively for <strong className="text-white">experimental research purposes</strong> and academic exploration. The Developer explicitly states that this software is not certified for <strong className="text-red-400">validation in actual aerospace or jet engineering cases</strong>, as users may encounter <strong className="text-white">numerical artifacts</strong> or computational inaccuracies during <strong className="text-white">extreme flow conditions</strong>.
                        </p>
                        <div className="w-full h-px bg-white/5"></div>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-slate-400 text-xs">
                                This is an open-source project. Developer welcome your contributions.
                            </p>
                            <a 
                                href="https://github.com/dbstwn/tsiolkovsky" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-black border border-white/10 hover:border-white/30 rounded-lg transition-all group pointer-events-auto"
                            >
                                <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                <span className="text-xs font-bold text-white group-hover:text-blue-200">GitHub</span>
                            </a>
                        </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="mb-8 flex items-center gap-3 cursor-pointer group select-none" onClick={() => setAgreed(!agreed)}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${agreed ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-slate-600 group-hover:border-slate-400'}`}>
                            <svg className={`w-3.5 h-3.5 text-white transition-transform duration-200 ${agreed ? 'scale-100' : 'scale-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className={`text-xs font-medium ${agreed ? 'text-white' : 'text-slate-500 group-hover:text-slate-400'} transition-colors`}>
                            I understand the risks and its concerns
                        </span>
                    </div>

                    {/* Start Button & Warning - Positioned Relatively */}
                    <div className="relative flex flex-col items-center">
                        <button 
                            onClick={handleStartTourClick}
                            className={`group relative px-8 py-3 font-bold text-sm uppercase tracking-widest rounded-full transition-all duration-300 flex items-center gap-2
                                ${agreed 
                                    ? 'bg-white text-black hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] cursor-pointer' 
                                    : 'bg-slate-800 text-slate-500 opacity-70 cursor-pointer'}
                            `}
                        >
                            Start Tour
                            <svg className={`w-4 h-4 transition-transform duration-300 ${agreed ? 'group-hover:translate-x-1' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                        
                        {/* Warning Popup - Now outside of overflow-hidden parent so it can overlap the border */}
                        <div className={`absolute top-full mt-4 z-50 w-max px-4 py-3 bg-red-950/90 border border-red-500/50 backdrop-blur-md rounded-xl flex items-center gap-3 transition-all duration-500 transform shadow-[0_10px_40px_rgba(0,0,0,0.5)] ${showWarning ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                            <div className="p-1.5 bg-red-500/20 rounded-full flex-shrink-0">
                                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <span className="text-xs font-bold text-red-200 tracking-wide whitespace-nowrap">
                                You must agree with T&C by toggle the check box
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // --- RENDER PHASE 3: TOUR ---
  const step = TIPS_STEPS[currentStep];
  const isFunc = step.type === 'func';

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Dark Overlay with smooth-transition cutout */}
      {rect && (
        <>
           {/* Styles to animate the cutout dimensions */}
           <style>{`
             .overlay-panel { transition: all 0.7s cubic-bezier(0.25, 0.1, 0.25, 1); }
             @keyframes breathing-glow {
                0%, 100% { box-shadow: 0 0 15px rgba(255,255,255,0.1), inset 0 0 10px rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); }
                50% { box-shadow: 0 0 25px rgba(59,130,246,0.3), inset 0 0 20px rgba(59,130,246,0.2); border-color: rgba(59,130,246,0.6); }
             }
             .animate-breathing { animation: breathing-glow 3s infinite ease-in-out; }
           `}</style>

           {/* Top */}
           <div className="absolute top-0 left-0 right-0 bg-black/60 backdrop-blur-[2px] overlay-panel" style={{ height: rect.top }} />
           {/* Bottom */}
           <div className="absolute left-0 right-0 bottom-0 bg-black/60 backdrop-blur-[2px] overlay-panel" style={{ top: rect.bottom }} />
           {/* Left */}
           <div className="absolute top-0 left-0 bg-black/60 backdrop-blur-[2px] overlay-panel" style={{ top: rect.top, height: rect.height, width: rect.left }} />
           {/* Right */}
           <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-[2px] overlay-panel" style={{ top: rect.top, height: rect.height, left: rect.right }} />
           
           {/* Spotlight Highlight with breathing effect */}
           <div 
             className={`absolute rounded-lg pointer-events-none border-2 overlay-panel animate-breathing`}
             style={{
               top: rect.top - 4,
               left: rect.left - 4,
               width: rect.width + 8,
               height: rect.height + 8,
             }}
           />
        </>
      )}

      {/* Info Card - Floating and Centered */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center w-full h-full pointer-events-none"
      >
        <div 
            className="pointer-events-auto bg-slate-900/95 border border-white/10 p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative overflow-hidden transition-all duration-500 transform hover:scale-[1.01]"
        >
            {/* Background Gradient */}
            <div className={`absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-br ${isFunc ? 'from-green-500/30 to-transparent' : 'from-blue-500/30 to-transparent'}`}></div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${isFunc ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-blue-500/20 text-blue-400 border-blue-500/50'}`}>
                        {step.type === 'func' ? 'Function' : 'Description'}
                    </span>
                    <span className="text-slate-500 text-xs font-mono">Step {currentStep + 1} / {TIPS_STEPS.length}</span>
                </div>
            </div>

            {/* Content with Keyframe Key for animation reset on step change */}
            <div key={currentStep} className="relative z-10 mb-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{step.content}</p>
            </div>

            {/* Footer Buttons */}
            <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10">
                <button 
                    onClick={onComplete}
                    className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors px-2 py-1 hover:underline decoration-slate-500 underline-offset-4"
                >
                    Skip Tips
                </button>
                <button 
                    onClick={handleNext}
                    className={`px-6 py-2 rounded-lg font-bold text-sm shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 ${isFunc ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                >
                    {currentStep === TIPS_STEPS.length - 1 ? 'Finish' : 'Next'}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};