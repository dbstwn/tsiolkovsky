import React, { useState } from 'react';
import { SimulationParams, VisualizationMode } from '../types';
import { turboColormap } from '../services/colormap';

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  visMode: VisualizationMode;
  fps: number;
  minVal: number;
  maxVal: number;
}

export const SimulationCanvas: React.FC<Props> = ({ canvasRef, visMode, fps, minVal, maxVal }) => {
  const [showOverlay, setShowOverlay] = useState(true);

  const getGradientStyle = () => {
      if (visMode === VisualizationMode.SCHLIEREN) {
          return { background: 'linear-gradient(to right, rgb(40,20,0), rgb(255,255,255))' };
      }
      return { 
          background: `linear-gradient(to right, 
            ${turboColormap(0)}, ${turboColormap(0.25)}, ${turboColormap(0.5)}, 
            ${turboColormap(0.75)}, ${turboColormap(1.0)})` 
      };
  };

  return (
    <div id="sim-canvas-area" className="relative w-full h-full bg-slate-900 overflow-hidden group">
        {/* Main Rendering Canvas */}
        <canvas 
            ref={canvasRef} 
            className="w-full h-full object-cover"
            // Width/Height will be set by hook to match grid, CSS scales it
        />
        
        {/* BRANDING (Bottom Left) - UPDATED OPACITY & TEXT */}
        <div className="absolute bottom-6 left-8 pointer-events-none z-20">
            <div>
                <h1 className="text-5xl font-bold text-white/60 italic tracking-tighter drop-shadow-lg" style={{ fontFamily: 'Kanit, sans-serif' }}>
                    Tsiolkovsky
                </h1>
                <p className="text-[10px] text-slate-400 font-mono mt-2 opacity-80 uppercase tracking-widest drop-shadow-md">
                    Rocket Engine Flow Dynamics Solver
                </p>
            </div>
        </div>

        {/* Overlays (Nozzle + Grid) */}
        {showOverlay && (
            <div className="absolute inset-0 pointer-events-none z-10">
                {/* Nozzle Overlay */}
                <div className="absolute left-0 top-1/3 bottom-1/3 w-8 border-y-2 border-r-2 border-white/40 rounded-r-md flex items-center justify-end pr-1 opacity-70">
                    <span className="text-[9px] font-bold text-white/80 -rotate-90 whitespace-nowrap">NOZZLE EXIT</span>
                </div>
                <div className="absolute left-10 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-60">
                    <div className="h-[2px] w-12 bg-blue-400"></div>
                    <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[8px] border-l-blue-400"></div>
                </div>

                {/* Grid Lines (6 columns, 3 rows) */}
                <div className="absolute inset-0 w-full h-full grid grid-cols-6 grid-rows-3 opacity-20">
                    {[...Array(18)].map((_, i) => (
                        <div key={i} className="border-r border-b border-white last:border-r-0 last:border-b-0"></div>
                    ))}
                </div>
            </div>
        )}

        {/* Minimal HUD Info (Top Left) */}
        <div id="sim-hud-annotations" className="absolute top-4 left-4 pointer-events-none flex flex-col gap-2 z-30">
            <div className="bg-black/30 backdrop-blur-md px-3 py-2 rounded text-[10px] font-mono text-gray-400 border border-white/5 pointer-events-auto hover:bg-black/50 transition-colors">
                <div className="flex gap-4">
                     <span>FPS: {fps}</span>
                     <span>Grid: 300x150</span>
                </div>
                <div className="mt-1 pt-1 border-t border-white/10">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-white">
                        <input 
                            type="checkbox" 
                            checked={showOverlay} 
                            onChange={(e) => setShowOverlay(e.target.checked)}
                            className="w-3 h-3 rounded bg-slate-700 border-none"
                        />
                        <span>Annotations</span>
                    </label>
                </div>
            </div>
        </div>

        {/* Legend (Bottom Right) - FIXED ARTIFACTS */}
        <div id="sim-legend" className="absolute bottom-6 right-8 pointer-events-none transition-opacity duration-300 z-30">
            {/* Added overflow-hidden and border opacity fix to prevent blinking edges */}
            <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl flex flex-col gap-3 min-w-[240px] overflow-hidden">
                <div className="flex justify-between items-center text-xs uppercase font-bold text-slate-300">
                     <span>{visMode.split('(')[0]}</span>
                     <span className="text-[10px] text-slate-500 font-mono opacity-80">{visMode.match(/\(.*\)/)?.[0]}</span>
                </div>
                {/* Scale Bar */}
                <div className="h-4 w-full rounded-md shadow-inner relative overflow-hidden" style={getGradientStyle()}>
                    {/* Inner shadow overlay */}
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/20 rounded-md"></div>
                </div>
                <div className="flex justify-between text-xs font-mono text-white font-bold tabular-nums">
                    <span>{minVal.toExponential(1)}</span>
                    <span>{maxVal.toExponential(1)}</span>
                </div>
            </div>
        </div>
    </div>
  );
};