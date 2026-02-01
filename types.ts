export interface SimulationParams {
  // Engine / Physics
  pressureTotal: number; // Pa
  tempTotal: number;     // K
  mach: number;          // Unitless
  pressureAmbient: number; // Pa (Controlled via NPR)
  gamma: number;         // Ratio of specific heats (1.4 for air)
  
  // Numerical
  cfl: number;           // Courant number
  gridResolution: 'low' | 'medium' | 'high';
  simulationSpeed: number; // Speed multiplier (0.25x - 4.0x)
}

export enum VisualizationMode {
  SCHLIEREN = 'Schlieren (|∇ρ|)',
  DENSITY = 'Density (ρ)',
  PRESSURE = 'Pressure (P)',
  MACH = 'Mach Number (M)',
  VELOCITY = 'Velocity (|U|)',
  TEMPERATURE = 'Temperature (T)'
}

export const PHYSICS_CONSTANTS = {
  R: 287.05, // Specific gas constant for air J/(kg*K)
  GAMMA: 1.4,
};

// Initial Defaults - Set to Underexpanded jet to show diamonds by default
// NPR = 300000 / 101325 ≈ 2.96 (Highly underexpanded)
export const DEFAULT_PARAMS: SimulationParams = {
  pressureTotal: 350000,
  tempTotal: 1000,
  mach: 2.0,
  pressureAmbient: 101325, 
  gamma: 1.4,
  cfl: 0.5, // Conservative start for stability
  gridResolution: 'medium',
  simulationSpeed: 1.0
};