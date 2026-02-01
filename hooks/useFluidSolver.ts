import { useEffect, useRef, useState, useCallback } from 'react';
import { FluidSolver } from '../services/fluidSolver';
import { SimulationParams, VisualizationMode } from '../types';
import { turboColormap } from '../services/colormap';

export const useFluidSolver = (params: SimulationParams, visMode: VisualizationMode, isRunning: boolean) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const solverRef = useRef<FluidSolver | null>(null);
  const requestRef = useRef<number>();
  const stepsAccumulator = useRef(0); // Accumulator for fractional speeds

  const [solverTime, setSolverTime] = useState(0);
  const [fps, setFps] = useState(0);
  const [minVal, setMinVal] = useState(0);
  const [maxVal, setMaxVal] = useState(0);

  // Initialize Solver
  useEffect(() => {
    // High Res grid
    solverRef.current = new FluidSolver(300, 150);
    solverRef.current.updateBoundaryConditions(
      params.pressureTotal,
      params.tempTotal,
      params.mach,
      params.pressureAmbient
    );
    drawFrame(); // Initial draw
    return () => cancelAnimation();
  }, []);

  const cancelAnimation = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  // Reset Handler
  const resetSolver = useCallback(() => {
    if (solverRef.current) {
      solverRef.current.reset();
      solverRef.current.updateBoundaryConditions(
        params.pressureTotal,
        params.tempTotal,
        params.mach,
        params.pressureAmbient
      );
      setSolverTime(0);
      stepsAccumulator.current = 0;
      drawFrame();
    }
  }, [params]);

  // Live Parameter Synchronization (Atomic Update)
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

  // Rendering Logic
  const drawFrame = () => {
    const solver = solverRef.current;
    const canvas = canvasRef.current;
    if (!solver || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Map VisMode to key
    const modeKey = visMode === VisualizationMode.SCHLIEREN ? 'schlieren' :
                    visMode === VisualizationMode.DENSITY ? 'density' :
                    visMode === VisualizationMode.PRESSURE ? 'pressure' :
                    visMode === VisualizationMode.MACH ? 'mach' : 
                    visMode === VisualizationMode.TEMPERATURE ? 'temperature' : 
                    'velocity';

    const { data, min, max } = solver.getScalarField(modeKey);
    setMinVal(min);
    setMaxVal(max);

    // Offscreen Buffer for pixel manipulation
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const buf = imgData.data;

    if (canvas.width !== solver.nx || canvas.height !== solver.ny) {
        canvas.width = solver.nx;
        canvas.height = solver.ny;
    }

    const range = max - min + 1e-6;

    for (let i = 0; i < data.length; i++) {
        const val = data[i];
        const col = i % solver.nx;
        const row = Math.floor(i / solver.nx);
        const invRow = (solver.ny - 1) - row; 
        const bufIdx = (invRow * solver.nx + col) * 4;
        
        let r, g, b;

        if (visMode === VisualizationMode.SCHLIEREN) {
            const intensity = Math.min(1.0, Math.max(0, val / (max * 0.9)));
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

    ctx.putImageData(imgData, 0, 0);
  };

  // Animation Loop
  useEffect(() => {
    let lastTime = performance.now();
    let frameCount = 0;

    const animate = () => {
      if (!isRunning) return; 

      const solver = solverRef.current;
      if (solver) {
        // Accumulate fractional steps
        stepsAccumulator.current += params.simulationSpeed;
        
        // Determine integer number of steps to run this frame
        let stepsToRun = Math.floor(stepsAccumulator.current);
        
        // Remove executed steps from accumulator
        if (stepsToRun > 0) {
             stepsAccumulator.current -= stepsToRun;
        }

        // Safety clamp to prevent spiral of death if processing is too slow
        const maxStepsPerFrame = 10;
        if (stepsToRun > maxStepsPerFrame) {
            stepsToRun = maxStepsPerFrame;
            stepsAccumulator.current = 0; // Reset accumulator to avoid lag buildup
        }
        
        // Execute solver steps
        for(let i = 0; i < stepsToRun; i++) {
             solver.step(params.cfl);
        }
        
        setSolverTime(solver.t);
        drawFrame();
      }

      // FPS Counter
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimation();
    }

    return () => cancelAnimation();
  }, [isRunning, params.cfl, params.simulationSpeed, visMode]);

  return {
    canvasRef,
    resetSolver,
    solverTime,
    fps,
    minVal,
    maxVal
  };
};