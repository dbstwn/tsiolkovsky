import React, { useEffect, useRef, useState } from 'react';

interface LandingPageProps {
  onLaunch: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  const [loadingState, setLoadingState] = useState<'idle' | 'loading'>('idle');
  const [loadingText, setLoadingText] = useState('Initializing...');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    class FluidParticle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        radius: number;
        color: string;

        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = initial ? Math.random() * width : -20;
            this.y = Math.random() * height;
            
            // Parabolic Velocity Profile (Poiseuille-like flow)
            const centerY = height / 2;
            const normalizedY = (this.y - centerY) / (height / 2); // -1 (top) to 1 (bottom)
            const profileFactor = 1 - Math.pow(normalizedY, 2); // 1 at center, 0 at edges
            
            // Speed logic: Center is fast, edges are slow
            const speed = 2 + profileFactor * 5; 
            
            this.vx = speed + (Math.random() - 0.5); 
            this.vy = (Math.random() - 0.5) * 0.5;
            
            // Reduced size for finer detail (0.2 to 0.6 px)
            this.radius = Math.random() * 0.4 + 0.2;

            // CFD Heatmap Coloring
            // Map speed to Hue: Blue (Slow/Cold) -> Green -> Yellow -> Red (Fast/Hot)
            const t = Math.max(0, Math.min(1, (speed - 1.5) / 6));
            const hue = 240 * (1 - t); 
            this.color = `hsla(${hue}, 80%, 60%, 0.8)`;
        }

        update(time: number) {
            this.x += this.vx;
            this.y += this.vy;

            // Fluid Turbulence / Meander
            this.y += Math.sin(this.x * 0.005 + time) * 0.3;

            // Reset if off-screen right
            if (this.x > width + 20) {
                this.reset();
            }
        }

        draw(ctx: CanvasRenderingContext2D) {
            // Particle Head
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();

            // Motion Trail
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.radius;
            ctx.globalAlpha = 0.4;
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3); // Trail length based on speed
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }
    }

    const particles: FluidParticle[] = [];
    const particleCount = Math.floor((width * height) / 600); 
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new FluidParticle());
    }

    let frameId: number;
    let time = 0;

    const animate = () => {
        // Clear with semi-transparent black for trail decay effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, width, height);
        
        time += 0.02;
        
        particles.forEach(p => {
            p.update(time);
            p.draw(ctx);
        });

        frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(frameId);
    };
  }, []);

  const handleStart = () => {
    setLoadingState('loading');
    
    // Loading Sequence
    const texts = [
        "Allocating Mesh Grid...",
        "Initializing Kernels...",
        "Solving Euler Equations...",
        "Preparing Processors...",
        "Ready."
    ];
    
    let step = 0;
    const totalTime = 2000;
    const intervalTime = totalTime / texts.length;

    const textInterval = setInterval(() => {
        if (step < texts.length) {
            setLoadingText(texts[step]);
            step++;
        }
    }, intervalTime);

    // Progress Bar Animation
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / totalTime) * 100);
        setLoadingProgress(progress);
        
        if (progress >= 100) {
            clearInterval(progressInterval);
        }
    }, 16);

    // Launch
    setTimeout(() => {
        clearInterval(textInterval);
        onLaunch();
    }, totalTime); 
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans perspective-1000">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Main Content Wrapper */}
      <div 
        className={`
            absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 
            transition-all duration-700 ease-in-out
            ${loadingState === 'loading' ? 'opacity-0 scale-95 blur-sm pointer-events-none' : 'opacity-100 scale-100'}
        `}
      >
        <div className="bg-slate-900/20 backdrop-blur-xl p-10 md:p-14 rounded-[2.5rem] border border-white/10 shadow-2xl max-w-5xl w-full relative overflow-hidden group">
            
            {/* Title */}
            <h1 className="text-7xl md:text-8xl font-bold text-white tracking-tighter italic mb-4 drop-shadow-xl leading-none relative z-10" style={{ fontFamily: 'Kanit, sans-serif' }}>
                Tsiolkovsky
            </h1>

            {/* Badges Row */}
            <div className="mb-10 flex flex-wrap justify-center items-center gap-4 relative z-10">
                {/* Version */}
                <span className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px] font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    Version 1.0.0
                </span>
                
                {/* Stable Release - Green Neon */}
                <span className="px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-[11px] font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(16,185,129,0.4)] drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]">
                    Stable Release
                </span>

                {/* Open Source - RGB Breathing */}
                <span className="px-5 py-2 rounded-full bg-black/40 border text-[11px] font-bold tracking-[0.2em] uppercase animate-rgb-breathe">
                    Open Source
                </span>
            </div>

            <p className="text-xl md:text-2xl text-slate-300 font-light tracking-wide mb-12 relative z-10">
                Real-Time <span className="text-blue-400 font-semibold drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">Rocket Engine</span> CFD Simulator
            </p>

            {/* Grid Features - Colors matched to Supersonic Blue */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
                <NeonFeature title="Roe Flux" desc="High-Res Riemann Solver" />
                <NeonFeature title="Euler Eq" desc="Compressible Flow Physics" />
                <NeonFeature title="INSTANTANEOUSLY" desc="Solve with single snap" />
            </div>

            {/* Simple Modern Launch Button */}
            <div className="flex justify-center relative z-20">
                <button 
                    onClick={handleStart}
                    className="group relative px-10 py-4 bg-slate-900/50 hover:bg-slate-800 border border-white/20 hover:border-blue-400/50 rounded-lg text-white font-medium text-lg tracking-widest uppercase transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] backdrop-blur-sm"
                >
                    <span className="flex items-center gap-4">
                        Launch Simulator
                        {/* Moving Arrow Icon */}
                        <svg 
                            className="w-5 h-5 text-blue-400 animate-pulse-horizontal" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </span>
                </button>
            </div>
            
            {/* Background Glow for Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/5 blur-[100px] pointer-events-none rounded-full mix-blend-screen"></div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loadingState === 'loading' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-300">
             <div className="w-full max-w-md px-8">
                {/* Loading Text */}
                <div className="flex justify-between items-end mb-2">
                    <span className="text-blue-400 font-mono text-sm tracking-widest uppercase animate-pulse">{loadingText}</span>
                    <span className="text-slate-500 font-mono text-xs">{Math.floor(loadingProgress)}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all duration-100 ease-out"
                        style={{ width: `${loadingProgress}%` }}
                    ></div>
                </div>
                
                {/* Decorative sub-text */}
                <div className="mt-8 text-center">
                    <p className="text-slate-600 text-[10px] uppercase tracking-[0.3em] font-light">Tsiolkovsky Engine V1.0.0</p>
                </div>
             </div>
          </div>
      )}

      <style>{`
        @keyframes pulse-horizontal {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(4px); }
        }
        .animate-pulse-horizontal {
            animation: pulse-horizontal 1.5s ease-in-out infinite;
        }
        @keyframes rgb-breathe {
            0% { border-color: rgba(255, 50, 50, 0.6); color: rgba(255, 100, 100, 1); box-shadow: 0 0 10px rgba(255,0,0,0.3); }
            33% { border-color: rgba(50, 255, 50, 0.6); color: rgba(100, 255, 100, 1); box-shadow: 0 0 10px rgba(0,255,0,0.3); }
            66% { border-color: rgba(50, 50, 255, 0.6); color: rgba(100, 100, 255, 1); box-shadow: 0 0 10px rgba(0,0,255,0.3); }
            100% { border-color: rgba(255, 50, 50, 0.6); color: rgba(255, 100, 100, 1); box-shadow: 0 0 10px rgba(255,0,0,0.3); }
        }
        .animate-rgb-breathe {
            animation: rgb-breathe 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

const NeonFeature = ({ title, desc }: { title: string, desc: string }) => {
    // Colors matching "Supersonic" blue (Blue-400 ~ #60a5fa)
    return (
        <div 
            className="flex flex-col items-center justify-center p-5 rounded-xl bg-slate-900/60 border border-blue-400/20 backdrop-blur-sm hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-[0_0_20px_rgba(96,165,250,0.15)]"
        >
            <div 
                className="font-bold text-sm uppercase tracking-wider mb-1 drop-shadow-sm text-blue-400"
            >
                {title}
            </div>
            <div className="text-[11px] text-slate-400 font-mono opacity-90">{desc}</div>
        </div>
    );
};