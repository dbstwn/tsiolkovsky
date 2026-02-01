import React, { useState } from 'react';
import { ControlSidebar } from './ControlSidebar';
import { SimulationCanvas } from './SimulationCanvas';
import { MetricCard } from './MetricCard';
import { AboutModal } from './AboutModal';
import { InfoModal } from './InfoModal';
import { ProTips } from './ProTips';
import { useFluidSolver } from '../hooks/useFluidSolver';
import { DEFAULT_PARAMS, VisualizationMode } from '../types';

export const Simulator: React.FC = () => {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [visMode, setVisMode] = useState<VisualizationMode>(VisualizationMode.SCHLIEREN);
  const [isRunning, setIsRunning] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [infoModalType, setInfoModalType] = useState<string | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [showTips, setShowTips] = useState(true);

  // Hook handles solver logic
  const { canvasRef, resetSolver, solverTime, fps, minVal, maxVal } = useFluidSolver(params, visMode, isRunning);

  const handleReset = () => {
    setIsRunning(false);
    resetSolver();
  };

  // Derived Physical Values for Metrics
  const vExit = (params.mach * Math.sqrt(1.4*287*(params.tempTotal / (1+0.2*params.mach**2)))).toFixed(0);
  const pStatic = (params.pressureTotal / Math.pow(1+0.2*params.mach**2, 3.5)).toFixed(0);
  const tStatic = (params.tempTotal / (1+0.2*params.mach**2)).toFixed(0);
  const state = params.mach < 0.8 ? "Subsonic" : params.mach > 1.2 ? "Supersonic" : "Transonic";

  return (
    <div className="w-full h-screen bg-slate-950 flex overflow-hidden text-slate-200 font-sans selection:bg-blue-500/30 animate-in fade-in duration-1000">
      
      {/* Pro Tips Overlay */}
      {showTips && <ProTips onComplete={() => setShowTips(false)} />}

      {/* Main Content Area (Full Screen) */}
      <div className="flex-1 relative h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        
        {/* Background Grid Decoration */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        {/* Canvas Container */}
        <div 
            className={`absolute inset-0 transition-all duration-300 ease-in-out z-10 p-4 lg:p-6 flex flex-col`}
            style={{ right: isSidebarOpen ? '22rem' : '0' }}
        >
            {/* Viewport */}
            <div className="flex-1 relative shadow-2xl rounded-2xl overflow-hidden border border-white/10 ring-1 ring-black/50">
                <SimulationCanvas 
                    canvasRef={canvasRef}
                    visMode={visMode}
                    fps={fps}
                    minVal={minVal}
                    maxVal={maxVal}
                />
            </div>
            
            {/* Metric Cards Bar */}
            <div id="metric-cards-bar" className="h-20 mt-4 grid grid-cols-2 lg:grid-cols-5 gap-4 flex-none">
                 <MetricCard 
                    label="Terminal Velocity" value={vExit} unit="m/s" 
                    icon={<span className="material-symbols-outlined">speed</span>}
                    color="text-blue-400"
                    onHelp={() => setInfoModalType('velocity')}
                 />
                 <MetricCard 
                    label="Static Pressure" value={pStatic} unit="Pa" 
                    icon={
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 14h16M4 10h16M12 4v6m0 10v-6" />
                    } 
                    color="text-orange-400"
                    onHelp={() => setInfoModalType('pressure')}
                 />
                 <MetricCard 
                    label="Static Temp" value={tStatic} unit="K" 
                    icon={
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 4.5a3.5 3.5 0 0 0-7 0v9.25a5.5 5.5 0 1 0 7 0V4.5ZM10.5 2v2.5M10.5 6v2" />
                    } 
                    color="text-red-400"
                    onHelp={() => setInfoModalType('temp')}
                 />
                 <MetricCard 
                    label="State" value={state} unit="" 
                    icon={<span className="material-symbols-outlined">air</span>} 
                    color="text-emerald-400"
                    onHelp={() => setInfoModalType('state')}
                 />
                 <MetricCard 
                    label="Simulation Time" value={solverTime.toFixed(2)} unit="s" 
                    icon={<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />} color="text-purple-400"
                    onHelp={() => setInfoModalType('time')}
                 />
            </div>

            {/* Sidebar Toggle (Floating if closed) */}
            {!isSidebarOpen && (
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-slate-800 text-white rounded-lg shadow-lg hover:bg-slate-700 transition-all z-50 border border-white/10"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                </button>
            )}
        </div>

        {/* Floating Controls Sidebar */}
        <div id="control-sidebar"
            className={`absolute top-0 bottom-0 right-0 w-[22rem] bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-20 transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            {/* Header with Icon-Only Collapse */}
            <div className="flex-none p-4 flex justify-between items-center border-b border-white/5">
                <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Control Deck</h2>
                <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                </button>
            </div>
            
            <ControlSidebar 
                params={params} 
                setParams={setParams} 
                visMode={visMode}
                setVisMode={setVisMode}
                solverTime={solverTime}
                isRunning={isRunning}
                setIsRunning={setIsRunning}
                handleReset={handleReset}
                onOpenAbout={() => setIsAboutOpen(true)}
            />
        </div>

        {/* Info Modal (Deep Dive) */}
        <InfoModal type={infoModalType} onClose={() => setInfoModalType(null)} />

        {/* About Modal */}
        <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      </div>
    </div>
  );
}