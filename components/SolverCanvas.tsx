import React, { useEffect, useRef, useState } from 'react';
import { FluidSolver } from '../services/fluidSolver';
import { SimulationParams, VisualizationMode } from '../types';
import { turboColormap } from '../services/colormap';

interface Props {
  params: SimulationParams;
  visMode: VisualizationMode;
  onTimeUpdate: (t: number) => void;
  isRunning: boolean;
  onReset: boolean;
}

export const SolverCanvas: React.FC<Props> = ({ params, visMode, onTimeUpdate, isRunning, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const solverRef = useRef<FluidSolver | null>(null);
  const requestRef = useRef<number>();
  const [fps, setFps] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  
  const minValRef = useRef<HTMLSpanElement>(null);
  const maxValRef = useRef<HTMLSpanElement>(null);

  // Initialize Solver
  useEffect(() => {
    const nx = 200;
    const ny = 100;
    
    solverRef.current = new FluidSolver(nx, ny);
    solverRef.current.updateBoundaryConditions(
        params.pressureTotal,
        params.tempTotal,
        params.mach,
        params.pressureAmbient
    );
    drawFrame();

    return () => {
       if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
  }, []);

  // Update physics
  useEffect(() => {
    if (solverRef.current) {
        solverRef.current.updateBoundaryConditions(
            params.pressureTotal,
            params.tempTotal,
            params.mach,
            params.pressureAmbient
        );
    }
  }, [params.pressureTotal, params.tempTotal, params.mach, params.pressureAmbient]);

  // Handle Reset
  useEffect(() => {
    if (solverRef.current) {
        solverRef.current.reset();
        solverRef.current.updateBoundaryConditions(
            params.pressureTotal,
            params.tempTotal,
            params.mach,
            params.pressureAmbient
        );
        drawFrame();
        onTimeUpdate(0);
    }
  }, [onReset]);

  const drawFrame = () => {
    const solver = solverRef.current;
    const canvas = canvasRef.current;
    if (!solver || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const modeKey = visMode === VisualizationMode.SCHLIEREN ? 'schlieren' :
                    visMode === VisualizationMode.DENSITY ? 'density' :
                    visMode === VisualizationMode.PRESSURE ? 'pressure' :
                    visMode === VisualizationMode.MACH ? 'mach' : 'velocity';

    const { data, min, max } = solver.getScalarField(modeKey);

    if (minValRef.current && maxValRef.current) {
        if (visMode === VisualizationMode.SCHLIEREN) {
             minValRef.current.innerText = "Low";
             maxValRef.current.innerText = "High";
        } else {
             minValRef.current.innerText = min.toExponential(1);
             maxValRef.current.innerText = max.toExponential(1);
        }
    }

    // Offscreen render
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = solver.nx;
    offscreenCanvas.height = solver.ny;
    const offCtx = offscreenCanvas.getContext('2d');
    if(!offCtx) return;

    const imgData = offCtx.createImageData(solver.nx, solver.ny);
    const buf = imgData.data;
    const range = max - min + 1e-6;

    for (let i = 0; i < data.length; i++) {
        const val = data[i];
        let r, g, b;
        const col = i % solver.nx;
        const row = Math.floor(i / solver.nx);
        const invRow = (solver.ny - 1) - row; 
        const bufIdx = (invRow * solver.nx + col) * 4;

        if (visMode === VisualizationMode.SCHLIEREN) {
            const intensity = Math.min(1.0, Math.max(0, val / (max * 0.8)));
            const byte = Math.floor(intensity * 255);
            r = Math.min(255, byte + 40);
            g = Math.min(255, byte + 20);
            b = byte;
        } else {
            const norm = (val - min) / range;
            const colorStr = turboColormap(norm); 
            const rgb = colorStr.match(/\d+/g)?.map(Number) || [0,0,0];
            r = rgb[0]; g = rgb[1]; b = rgb[2];
        }

        buf[bufIdx] = r;
        buf[bufIdx + 1] = g;
        buf[bufIdx + 2] = b;
        buf[bufIdx + 3] = 255;
    }

    offCtx.putImageData(imgData, 0, 0);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    let lastTime = performance.now();
    let frames = 0;
    let accumulatedSteps = 0;

    const animate = (time: number) => {
        if (!isRunning) {
            requestRef.current = requestAnimationFrame(animate);
            return;
        }

        const solver = solverRef.current;
        if (solver) {
            accumulatedSteps += params.simulationSpeed;
            let stepsToRun = Math.floor(accumulatedSteps);
            accumulatedSteps -= stepsToRun;
            stepsToRun = Math.min(stepsToRun, 5); 

            try {
                for(let k=0; k<stepsToRun; k++) {
                    solver.step(params.cfl);
                }
                if (stepsToRun > 0) {
                    onTimeUpdate(solver.t);
                }
            } catch (e) {
                console.error("Solver diverged", e);
            }

            drawFrame();
        }

        frames++;
        if (time - lastTime >= 1000) {
            setFps(frames);
            frames = 0;
            lastTime = time;
        }

        requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, params.cfl, params.simulationSpeed, visMode]); 

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
    <div className="relative w-full h-full bg-slate-900 overflow-hidden group">
        {/* Main Rendering Canvas */}
        <canvas 
            ref={canvasRef} 
            width={800} 
            height={400} 
            className="w-full h-full object-cover"
        />
        
        {/* BRANDING (Bottom Left) - MANDATORY */}
        <div className="absolute bottom-6 left-8 pointer-events-none opacity-80 z-20">
            <h1 className="text-4xl font-bold text-white italic tracking-tighter" style={{ fontFamily: 'sans-serif' }}>
                FlowForce
            </h1>
            <p className="text-xs text-blue-200 font-light tracking-wide mt-[-2px]">
                Ignite the Math: High-fidelity flow for next-gen propulsion CFD-simulator
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-1 opacity-70">
                Engineered by Dimas B. Setiawan
            </p>
        </div>

        {/* Nozzle Overlay */}
        {showOverlay && (
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-0 top-1/3 bottom-1/3 w-8 border-y-2 border-r-2 border-white/40 rounded-r-md flex items-center justify-end pr-1 opacity-70">
                    <span className="text-[9px] font-bold text-white/80 -rotate-90 whitespace-nowrap">NOZZLE EXIT</span>
                </div>
                <div className="absolute left-10 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-60">
                    <div className="h-[2px] w-12 bg-blue-400"></div>
                    <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[8px] border-l-blue-400"></div>
                </div>
            </div>
        )}

        {/* Minimal HUD Info (Top Left) */}
        <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-2">
            <div className="bg-black/30 backdrop-blur-md px-3 py-2 rounded text-[10px] font-mono text-gray-400 border border-white/5 pointer-events-auto hover:bg-black/50 transition-colors">
                <div className="flex gap-4">
                     <span>FPS: {fps}</span>
                     <span>Grid: 200x100</span>
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

        {/* Legend (Bottom Right) */}
        <div className="absolute bottom-6 right-8 pointer-events-none transition-opacity duration-300">
            <div className="bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10 shadow-xl flex flex-col gap-2 min-w-[180px]">
                <div className="flex justify-between items-center text-[9px] uppercase font-bold text-slate-400">
                     <span>{visMode.split('(')[0]}</span>
                </div>
                <div className="h-2 w-full rounded-sm ring-1 ring-white/10" style={getGradientStyle()}></div>
                <div className="flex justify-between text-[9px] font-mono text-white">
                    <span ref={minValRef}>0.0e0</span>
                    <span ref={maxValRef}>1.0e0</span>
                </div>
            </div>
        </div>
    </div>
  );
};