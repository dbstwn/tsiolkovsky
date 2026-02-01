import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  color: string;
  onHelp: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, unit, icon, color, onHelp }) => (
    <div className="bg-slate-900/60 backdrop-blur border border-white/5 rounded-xl p-3 flex flex-col justify-between hover:bg-slate-800/60 transition-colors group relative">
        <div className="flex justify-end items-start">
             {/* Icon removed from here as requested, only showing help button */}
             <button onClick={(e) => { e.stopPropagation(); onHelp(); }} className="text-slate-600 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </button>
        </div>
        
        <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5">{label}</span>
            <div className="flex items-baseline gap-1">
                <span className="text-xl font-mono text-white tracking-tighter">{value}</span>
                <span className="text-[10px] text-blue-400 font-medium">{unit}</span>
            </div>
        </div>
    </div>
);

// Helper for math content rendering
export const MathTooltipContent = ({ type }: { type: string }) => {
    if (type === 'velocity') {
        return (
            <div className="text-sm font-mono text-blue-200">
                <div className="mb-2">
                    V<sub>exit</sub> = M<sub>exit</sub> · <span className="math-sqrt"><span className="math-sqrt-symbol">√</span>γ · R · T<sub>exit</sub></span>
                </div>
            </div>
        );
    }
    if (type === 'pressure') {
        return (
            <div className="text-sm font-mono text-blue-200">
                <div className="mb-2">P = ρ · R · T</div>
                <div className="flex items-center">
                    <span className="mr-2">P / P₀ = </span>
                    <span>(1 + </span>
                    <div className="math-fraction">
                        <span className="math-num">γ - 1</span>
                        <span className="math-denom">2</span>
                    </div>
                    <span>· M²)</span>
                    <sup style={{marginLeft:'2px'}}>-γ / (γ - 1)</sup>
                </div>
            </div>
        );
    }
    if (type === 'temp') {
        return (
            <div className="text-sm font-mono text-blue-200 flex items-center">
                <span className="mr-2">T = </span>
                <div className="math-fraction">
                    <span className="math-num">T₀</span>
                    <span className="math-denom">
                        1 + <div className="math-fraction" style={{fontSize:'0.9em', margin:'0 2px'}}>
                                <span className="math-num">γ - 1</span>
                                <span className="math-denom">2</span>
                            </div> · M²
                    </span>
                </div>
            </div>
        );
    }
    // Fallback/Default
    return null;
};