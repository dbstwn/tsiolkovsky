import React, { useState } from 'react';
import { SimulationParams, VisualizationMode } from '../types';

interface ControlSidebarProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  visMode: VisualizationMode;
  setVisMode: (m: VisualizationMode) => void;
  solverTime: number;
  isRunning: boolean;
  setIsRunning: (v: boolean) => void;
  handleReset: () => void;
  onOpenAbout: () => void;
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  unit: string;
  colorClass?: string;
  disabled?: boolean;
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, step, onChange, unit, colorClass = "bg-blue-500", disabled = false }) => (
  <div className={`mb-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2">
      <span className="uppercase tracking-wide">{label}</span>
      <span className="text-slate-200 font-mono">{value} <span className="text-slate-500">{unit}</span></span>
    </div>
    <div className="relative w-full h-1.5 bg-slate-800 rounded-full group cursor-pointer">
        <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="absolute w-full h-full opacity-0 z-10 cursor-pointer"
        disabled={disabled}
        />
        <div 
            className={`absolute h-full rounded-full transition-all duration-150 ${colorClass} group-hover:brightness-110`} 
            style={{ width: `${Math.min(100, ((value - min) / (max - min)) * 100)}%` }}
        />
        <div 
            className="absolute h-3 w-3 bg-white rounded-full shadow-md top-1/2 -translate-y-1/2 -ml-1.5 pointer-events-none transition-transform group-hover:scale-125"
            style={{ left: `${Math.min(100, ((value - min) / (max - min)) * 100)}%` }}
        />
    </div>
  </div>
);

export const ControlSidebar: React.FC<ControlSidebarProps> = ({ 
    params, setParams, visMode, setVisMode, solverTime, isRunning, setIsRunning, handleReset, onOpenAbout
}) => {
  
  const [activeTab, setActiveTab] = useState<'preset' | 'settings' | 'view'>('preset');
  const [activePreset, setActivePreset] = useState<string>('diamond'); // Default state
  const npr = params.pressureTotal / params.pressureAmbient;

  const applyPreset = (type: 'diamond' | 'laminar' | 'turbulent') => {
      setActivePreset(type);
      setParams(prev => {
          let newParams = { ...prev };
          if (type === 'diamond') {
              newParams.pressureTotal = 350000;
              newParams.pressureAmbient = 101325;
              newParams.mach = 2.0;
              newParams.cfl = 0.5;
          } else if (type === 'laminar') {
              newParams.pressureTotal = 120000;
              newParams.pressureAmbient = 101325;
              newParams.mach = 0.8;
              newParams.cfl = 0.8;
          } else if (type === 'turbulent') {
              newParams.pressureTotal = 500000;
              newParams.pressureAmbient = 101325;
              newParams.mach = 1.5;
              newParams.cfl = 0.9;
          }
          return newParams;
      });
  };
  
  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      
      {/* 1. SIMULATION CONTROL GROUP (FIXED TOP) */}
      <div className="flex-none p-5 pb-2 border-b border-white/5 bg-slate-900/50">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Simulation Controls</div>
        
        {/* Run / Stop / Reset Grid */}
        <div id="ctrl-main-actions" className="flex gap-2 mb-4 h-10">
            <button 
                onClick={() => setIsRunning(!isRunning)}
                className={`
                    flex-1 rounded-md font-bold text-xs tracking-wide shadow-lg transition-all flex items-center justify-center gap-2
                    ${isRunning 
                        ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20' 
                        : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/30 border border-transparent'}
                `}
            >
                {isRunning ? (
                    <>
                        <span className="w-2 h-2 bg-red-500 rounded-sm animate-pulse"></span>
                        STOP
                    </>
                ) : (
                    <>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        RUN
                    </>
                )}
            </button>

            <button 
                onClick={handleReset}
                className="w-12 rounded-md bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-white/5 flex items-center justify-center transition-colors"
                title="Reset Domain"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
        </div>

        {/* Speed Control (0.5x, 1x, 2x, 4x) */}
        <div id="ctrl-speed" className="mb-4">
            <div className="flex justify-between text-[10px] font-medium text-slate-500 mb-1.5">
                <span className="uppercase">Speed</span>
                <span className="text-emerald-400 font-mono">{params.simulationSpeed}x</span>
            </div>
            <div className="flex bg-slate-800 p-1 rounded-lg gap-1 border border-white/5">
                {[0.5, 1.0, 2.0, 4.0].map((speed) => (
                    <button
                        key={speed}
                        onClick={() => setParams(p => ({...p, simulationSpeed: speed}))}
                        className={`
                            flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all
                            ${params.simulationSpeed === speed 
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}
                        `}
                    >
                        {speed}×
                    </button>
                ))}
            </div>
        </div>

        {/* Visualization Mode (Moved from Preset Tab) */}
        <div id="ctrl-vis-mode" className="mb-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Visualization Mode</div>
            <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(VisualizationMode).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setVisMode(label as VisualizationMode)}
                        className={`
                            text-[10px] font-bold py-2 px-2 rounded-md transition-all border
                            ${visMode === label 
                                ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20' 
                                : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700 hover:text-white'}
                        `}
                    >
                        {label.split(' ')[0]}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* 2. TABS NAVIGATION */}
      <div id="ctrl-tabs" className="flex border-b border-white/5 bg-black/20">
          {[
              { id: 'preset', label: 'Preset' },
              { id: 'settings', label: 'Settings' },
              { id: 'view', label: 'CFL' }
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                    flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-colors border-b-2
                    ${activeTab === tab.id 
                        ? 'text-blue-400 border-blue-400 bg-white/5' 
                        : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'}
                `}
              >
                  {tab.label}
              </button>
          ))}
      </div>

      {/* 3. SCROLLABLE TAB CONTENT */}
      <div id="ctrl-tab-content" className="flex-1 overflow-y-auto custom-scrollbar p-5">
          
          {/* PRESET TAB */}
          {activeTab === 'preset' && (
              <div className="space-y-6">
                 <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Flow Presets</div>
                    <div className="grid gap-2">
                        <PresetBtn 
                            label="Shock Diamonds" sub="M 2.0 • NPR 3.5" icon="◆" color="text-yellow-400" bg="bg-yellow-400/10" 
                            isActive={activePreset === 'diamond'}
                            onClick={() => applyPreset('diamond')} 
                        />
                        <PresetBtn 
                            label="Subsonic Laminar" sub="M 0.8 • Smooth" icon="≈" color="text-blue-400" bg="bg-blue-400/10" 
                            isActive={activePreset === 'laminar'}
                            onClick={() => applyPreset('laminar')} 
                        />
                        <PresetBtn 
                            label="Shear Turbulence" sub="M 1.5 • Unstable" icon="≋" color="text-red-400" bg="bg-red-400/10" 
                            isActive={activePreset === 'turbulent'}
                            onClick={() => applyPreset('turbulent')} 
                        />
                    </div>
                 </div>
              </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
              <div className="space-y-6">
                 <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Chamber Conditions</div>
                    <Slider label="Total Pressure" value={params.pressureTotal} min={100000} max={600000} step={5000} unit="Pa" onChange={(v) => setParams(p => ({ ...p, pressureTotal: v }))} colorClass="bg-blue-500" />
                    <Slider label="Total Temp" value={params.tempTotal} min={300} max={2500} step={50} unit="K" onChange={(v) => setParams(p => ({ ...p, tempTotal: v }))} colorClass="bg-red-500" />
                     <Slider label="Mach Number" value={params.mach} min={0.5} max={4.0} step={0.1} unit="" onChange={(v) => setParams(p => ({ ...p, mach: v }))} colorClass="bg-purple-500" />
                 </div>

                 <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Environment</div>
                    <Slider label="Ambient Pressure" value={params.pressureAmbient} min={10000} max={200000} step={1000} unit="Pa" onChange={(v) => setParams(p => ({ ...p, pressureAmbient: v }))} colorClass="bg-cyan-500" />
                    
                    <div className="mt-2 p-3 bg-slate-800/50 rounded border border-white/5 flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-medium">Nozzle Pressure Ratio</span>
                        <span className={`text-sm font-mono font-bold ${Math.abs(npr - 1) < 0.1 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {npr.toFixed(2)}
                        </span>
                    </div>
                 </div>
              </div>
          )}

          {/* CFL TAB */}
          {activeTab === 'view' && (
              <div className="space-y-6">
                  <div>
                     <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Numerical Stability</div>
                     <Slider 
                        label="CFL Number" 
                        value={params.cfl} 
                        min={0.1} max={0.9} step={0.05} unit="" 
                        onChange={(v) => setParams(p => ({ ...p, cfl: v }))} 
                        colorClass="bg-emerald-600" 
                    />
                  </div>
              </div>
          )}
      </div>

      {/* About Section at Bottom */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <button 
            onClick={onOpenAbout}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-xs font-bold uppercase tracking-wider transition-colors border border-white/5 flex items-center justify-center gap-2"
        >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" clipRule="evenodd" />
            </svg>
            About
        </button>
      </div>
    </div>
  );
};

const PresetBtn = ({ label, sub, icon, color, bg, onClick, isActive }: any) => (
    <button 
        onClick={onClick}
        className={`
            flex items-center gap-3 p-3 rounded-lg transition-all group w-full text-left relative overflow-hidden
            ${isActive 
                ? 'bg-slate-800 border-l-4 border-l-blue-500 shadow-lg shadow-black/20' 
                : 'bg-slate-900/50 hover:bg-slate-800 border border-white/5 hover:border-white/10'}
        `}
    >
        {isActive && <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>}
        <div className={`w-8 h-8 rounded-md ${bg} flex items-center justify-center ${color} font-bold text-sm group-hover:scale-110 transition-transform z-10`}>
            {icon}
        </div>
        <div className="z-10">
            <div className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{label}</div>
            <div className="text-[10px] text-slate-500">{sub}</div>
        </div>
    </button>
);