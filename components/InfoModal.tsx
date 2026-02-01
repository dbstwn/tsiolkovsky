import React from 'react';

export interface InfoModalProps {
  type: string | null;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const data = INFO_DATA[type];

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl p-8 animate-in zoom-in-95 duration-200 overflow-hidden relative" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-slate-800 border border-white/5 ${data.colorClass}`}>
                    {/* Render Icon safely checking if it's a string (font) or Element (svg) */}
                    {typeof data.icon === 'string' ? (
                        <span className="material-symbols-outlined" style={{fontSize: '24px'}}>{data.icon}</span>
                    ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            {data.icon}
                        </svg>
                    )}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{data.title}</h2>
                    <p className="text-sm text-slate-400 font-medium">{data.subtitle}</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Text Description */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Technical Description</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        {data.description}
                    </p>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Physical Interpretation</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        {data.interpretation}
                    </p>
                </div>
            </div>

            {/* Right: Math & Units */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Governing Equations</h3>
                    <div className="bg-black/40 rounded-xl p-6 border border-white/5 flex items-center justify-center">
                        <div className="text-base text-blue-200 font-serif italic">
                            {data.mathComponent}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Units</div>
                        <div className="text-lg font-mono text-white">{data.units}</div>
                     </div>
                     <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Symbol</div>
                        <div className="text-lg font-mono text-white font-serif italic">{data.symbol}</div>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

/* Data Definitions */
const INFO_DATA: Record<string, any> = {
    velocity: {
        title: "Terminal Velocity",
        subtitle: "Jet Exhaust Kinetics",
        colorClass: "text-blue-400",
        // Using string identifier for Material Symbol
        icon: "speed", 
        units: "m/s",
        symbol: "V_exit",
        description: "The speed at which the fluid exits the nozzle and enters the ambient domain. In supersonic flows, this velocity is directly tied to the Mach number and the local speed of sound.",
        interpretation: "High exit velocity indicates high thrust potential. Mismatches between the exit pressure and ambient pressure at high velocities drive the formation of shock diamonds.",
        mathComponent: (
            <div className="flex flex-col items-center gap-4">
                 <div className="flex items-center">
                    <span>V<sub>exit</sub> = M<sub>exit</sub> · </span>
                    <span className="math-sqrt"><span className="math-sqrt-symbol">√</span>γ · R · T<sub>exit</sub></span>
                </div>
            </div>
        )
    },
    pressure: {
        title: "Static Pressure",
        subtitle: "Thermodynamic State",
        colorClass: "text-orange-400",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 14h16M4 10h16M12 4v6m0 10v-6" />,
        units: "Pa (Pascal)",
        symbol: "P",
        description: "The thermodynamic pressure of the fluid. In compressible flows, static pressure varies drastically across shock waves (sudden rise) and expansion fans (gradual drop).",
        interpretation: "The ratio of Exit Pressure to Ambient Pressure (NPR) determines whether the jet is underexpanded (NPR > 1), overexpanded (NPR < 1), or perfectly expanded.",
        mathComponent: (
            <div className="flex flex-col items-center">
                <div className="flex items-center mb-2">
                    <span className="mr-2">P = ρ · R · T</span>
                </div>
                <div className="w-full h-px bg-white/10 my-1"></div>
                <div className="flex items-center mt-2">
                    <div className="math-fraction mr-2">
                        <span className="math-num">P</span>
                        <span className="math-denom">P₀</span>
                    </div>
                    <span> = </span>
                    <span className="mx-1">(1 + </span>
                    <div className="math-fraction">
                        <span className="math-num">γ - 1</span>
                        <span className="math-denom">2</span>
                    </div>
                    <span>M²)</span>
                    <sup className="-mt-4 text-xs ml-1" style={{verticalAlign: 'super'}}>-γ / (γ - 1)</sup>
                </div>
            </div>
        )
    },
    temp: {
        title: "Static Temperature",
        subtitle: "Thermal Energy State",
        colorClass: "text-red-400",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 4.5a3.5 3.5 0 0 0-7 0v9.25a5.5 5.5 0 1 0 7 0V4.5ZM10.5 2v2.5M10.5 6v2" />,
        units: "K (Kelvin)",
        symbol: "T",
        description: "The absolute temperature of the gas. As the flow accelerates to supersonic speeds, static temperature drops significantly as internal energy is converted into kinetic energy.",
        interpretation: "Temperature gradients affect the speed of sound. Hotter jets have higher sound speeds, meaning they must travel faster to achieve the same Mach number.",
        mathComponent: (
            <div className="flex items-center">
                <span className="mr-2">T = </span>
                <div className="math-fraction">
                    <span className="math-num">T₀</span>
                    <span className="math-denom">
                        1 + <div className="math-fraction" style={{fontSize:'0.8em', margin:'0 2px'}}>
                                <span className="math-num">γ - 1</span>
                                <span className="math-denom">2</span>
                            </div> M²
                    </span>
                </div>
            </div>
        )
    },
    state: {
        title: "Flow Regime",
        subtitle: "Compressibility Classification",
        colorClass: "text-emerald-400",
        // Using string identifier for Material Symbol
        icon: "air",
        units: "Dimensionless",
        symbol: "M (Mach)",
        description: "Classifies the flow based on the local Mach number. Subsonic flows communicate pressure disturbances upstream, while supersonic flows do not, leading to shock formation.",
        interpretation: "Supersonic (M > 1) is required for shock diamonds. Transonic flows (0.8 < M < 1.2) exhibit mixed behaviors and are highly unstable.",
        mathComponent: (
            <div className="text-sm font-sans not-italic">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <span className="text-slate-400 text-right">Subsonic</span>
                    <span className="font-mono">M &lt; 0.8</span>
                    
                    <span className="text-slate-400 text-right">Transonic</span>
                    <span className="font-mono">0.8 ≤ M ≤ 1.2</span>
                    
                    <span className="text-slate-400 text-right">Supersonic</span>
                    <span className="font-mono">M &gt; 1.2</span>
                </div>
            </div>
        )
    },
    time: {
        title: "Simulation Time",
        subtitle: "Solver Evolution",
        colorClass: "text-purple-400",
        icon: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
        units: "s (Seconds)",
        symbol: "t",
        description: "The elapsed physical time in the simulation domain since the start of the solver. This is derived from the accumulated time steps (dt) calculated via the CFL condition.",
        interpretation: "Allows observation of unsteady phenomena like shock oscillation or startup transients. Faster speeds (e.g., 4x, 8x) execute more solver steps per render frame.",
        mathComponent: (
            <div className="flex items-center gap-2">
                <span>t<sub>total</sub> = </span>
                <span style={{fontSize: '1.5em'}}>Σ</span>
                <span>Δt<sub>step</sub></span>
            </div>
        )
    }
};