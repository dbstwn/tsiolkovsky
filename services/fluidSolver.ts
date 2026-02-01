import { PHYSICS_CONSTANTS } from '../types';

/**
 * 2D Compressible Euler Solver
 * Finite Volume Method with Roe Flux Difference Splitting
 */
export class FluidSolver {
  // Grid dimensions
  nx: number;
  ny: number;
  dx: number;
  dy: number;

  // Conservative Variables [rho, rho*u, rho*v, rho*E]
  Q: Float32Array; 
  Q_new: Float32Array;

  // State
  t: number = 0;
  
  // Cache for boundaries
  inletState: { rho: number; u: number; v: number; p: number; E: number };
  ambientState: { rho: number; u: number; v: number; p: number; E: number };

  constructor(nx: number = 300, ny: number = 150) {
    this.nx = nx;
    this.ny = ny;
    
    // Domain size approx 0.9m length for high resolution
    const domainLength = 0.9;
    this.dx = domainLength / nx;
    this.dy = this.dx; // Square cells
    
    const size = nx * ny * 4;
    this.Q = new Float32Array(size);
    this.Q_new = new Float32Array(size);

    this.inletState = { rho: 1.2, u: 0, v: 0, p: 101325, E: 0 };
    this.ambientState = { rho: 1.225, u: 0, v: 0, p: 101325, E: 0 };
  }

  reset() {
    this.t = 0;
    this.initializeField();
  }

  getPressure(rho: number, rhou: number, rhov: number, rhoE: number): number {
    // Robust pressure calculation with safety clamp
    // Increased safety floor for High Mach stability
    const safeRho = Math.max(1e-4, rho);
    const kinE = 0.5 * (rhou * rhou + rhov * rhov) / safeRho;
    let p = (PHYSICS_CONSTANTS.GAMMA - 1) * (rhoE - kinE);
    // Clamp pressure to prevent vacuum/instability
    return Math.max(10.0, p); 
  }

  computeEnergy(rho: number, u: number, v: number, p: number): number {
    return p / (PHYSICS_CONSTANTS.GAMMA - 1) + 0.5 * rho * (u * u + v * v);
  }

  updateBoundaryConditions(pt: number, tt: number, mach: number, pAmb: number) {
    const gamma = PHYSICS_CONSTANTS.GAMMA;
    const R = PHYSICS_CONSTANTS.R;

    // Isentropic Flow Relations
    const tStatic = tt / (1 + (gamma - 1) * 0.5 * mach * mach);
    const pStatic = pt / Math.pow(1 + (gamma - 1) * 0.5 * mach * mach, gamma / (gamma - 1));
    const rhoStatic = pStatic / (R * tStatic);
    const c = Math.sqrt(gamma * R * tStatic);
    const uStatic = mach * c;

    this.inletState = {
      rho: rhoStatic,
      u: uStatic,
      v: 0,
      p: pStatic,
      E: this.computeEnergy(rhoStatic, uStatic, 0, pStatic)
    };

    const tAmb = 300; 
    const rhoAmb = pAmb / (R * tAmb);
    this.ambientState = {
      rho: rhoAmb,
      u: 0, 
      v: 0,
      p: pAmb,
      E: this.computeEnergy(rhoAmb, 0, 0, pAmb)
    };
  }

  initializeField() {
    for (let i = 0; i < this.nx * this.ny; i++) {
        const idx = i * 4;
        this.Q[idx] = this.ambientState.rho;
        this.Q[idx + 1] = this.ambientState.rho * this.ambientState.u;
        this.Q[idx + 2] = this.ambientState.rho * this.ambientState.v;
        this.Q[idx + 3] = this.ambientState.E;
    }
    this.applyBoundaryConditions();
  }

  step(cfl: number) {
    const dt = this.calculateTimeStep(cfl);
    this.t += dt;

    // Dimensional Splitting: X then Y
    this.computeFluxes(dt, this.dx, 1, 0);
    this.computeFluxes(dt, this.dy, 0, 1);

    this.applyBoundaryConditions();
    
    // Safety check and fix BEFORE committing new state
    const isStable = this.fixPositivityAndCheckStability();

    if (isStable) {
        this.Q.set(this.Q_new);
    } else {
        console.warn("Solver instability detected. Resetting to ambient.");
        this.reset(); 
    }
  }

  computeFluxes(dt: number, h: number, dirX: number, dirY: number) {
    // Copy current Q to Q_new as base for update (accumulator)
    if (dirX === 1) this.Q_new.set(this.Q);

    const isX = dirX === 1;
    const outer = isX ? this.ny : this.nx;
    const inner = isX ? this.nx : this.ny;

    const r_dt_h = dt / h;

    for (let j = 0; j < outer; j++) {
      for (let i = 0; i < inner - 1; i++) {
        let idxL, idxR;
        if (isX) {
             idxL = (j * this.nx + i) * 4;
             idxR = (j * this.nx + i + 1) * 4;
        } else {
             idxL = (i * this.nx + j) * 4;
             idxR = ((i + 1) * this.nx + j) * 4;
        }

        const flux = this.roeFlux1D(idxL, idxR, dirX, dirY);

        this.Q_new[idxL]     -= r_dt_h * flux[0];
        this.Q_new[idxL + 1] -= r_dt_h * flux[1];
        this.Q_new[idxL + 2] -= r_dt_h * flux[2];
        this.Q_new[idxL + 3] -= r_dt_h * flux[3];

        this.Q_new[idxR]     += r_dt_h * flux[0];
        this.Q_new[idxR + 1] += r_dt_h * flux[1];
        this.Q_new[idxR + 2] += r_dt_h * flux[2];
        this.Q_new[idxR + 3] += r_dt_h * flux[3];
      }
    }
  }

  roeFlux1D(idxL: number, idxR: number, nx: number, ny: number): number[] {
    const gamma = PHYSICS_CONSTANTS.GAMMA;
    const eps = 1e-9;

    // 1. Primitive Variables L
    const rL = Math.max(1e-6, this.Q[idxL]);
    const uL_raw = this.Q[idxL+1] / rL; 
    const vL_raw = this.Q[idxL+2] / rL;
    const pL = this.getPressure(rL, this.Q[idxL+1], this.Q[idxL+2], this.Q[idxL+3]);
    const hL = (this.Q[idxL+3] + pL) / rL;

    // 2. Primitive Variables R
    const rR = Math.max(1e-6, this.Q[idxR]);
    const uR_raw = this.Q[idxR+1] / rR;
    const vR_raw = this.Q[idxR+2] / rR;
    const pR = this.getPressure(rR, this.Q[idxR+1], this.Q[idxR+2], this.Q[idxR+3]);
    const hR = (this.Q[idxR+3] + pR) / rR;

    // Safety check for invalid inputs
    if(isNaN(pL) || isNaN(pR)) return [0,0,0,0];

    // 3. Rotate to Face Normal
    const uL = uL_raw * nx + vL_raw * ny;
    const vL = -uL_raw * ny + vL_raw * nx;
    const uR = uR_raw * nx + vR_raw * ny;
    const vR = -uR_raw * ny + vR_raw * nx;

    // 4. Roe Averaging
    const sL = Math.sqrt(rL);
    const sR = Math.sqrt(rR);
    const id = 1.0 / (sL + sR + eps);

    const u = (sL * uL + sR * uR) * id;
    const v = (sL * vL + sR * vR) * id;
    const h = (sL * hL + sR * hR) * id;
    const q2 = u*u + v*v;
    const c2 = (gamma - 1) * (h - 0.5 * q2);
    
    // Increased Sound Speed Floor for Mach > 3 stability
    const c = Math.sqrt(Math.max(50.0, c2)); 

    // 5. Eigenvalues & Entropy Fix
    const l1 = Math.abs(u - c);
    const l2 = Math.abs(u);
    const l3 = Math.abs(u);
    const l4 = Math.abs(u + c);

    // Dynamic Entropy Fix (Harten) - Increased for high shocks
    const delta = 0.25 * (Math.abs(u) + c); 
    const fix = (l: number) => l < delta ? (l*l + delta*delta)/(2*delta) : l;
    
    const L1 = fix(l1);
    const L2 = fix(l2);
    const L3 = fix(l3);
    const L4 = fix(l4);

    // 6. Wave Amplitudes
    const dr = rR - rL;
    const du = uR - uL;
    const dv = vR - vL;
    const dp = pR - pL;
    
    const rhoRoe = sL * sR;
    
    const alpha1 = (dp - rhoRoe*c*du) / (2*c*c);
    const alpha2 = dr - dp/(c*c);
    const alpha3 = rhoRoe * dv;
    const alpha4 = (dp + rhoRoe*c*du) / (2*c*c);

    // 7. Dissipation Term
    const d0 = L1*alpha1 + L2*alpha2 + L4*alpha4;
    const d1 = L1*alpha1*(u-c) + L2*alpha2*u + L4*alpha4*(u+c);
    const d2 = L1*alpha1*v + L2*alpha2*v + L3*alpha3 + L4*alpha4*v;
    const d3 = L1*alpha1*(h - u*c) + L2*alpha2*(0.5*q2) + L3*alpha3*v + L4*alpha4*(h + u*c);

    // 8. Physical Flux Average
    const FL = [rL*uL, rL*uL*uL + pL, rL*uL*vL, rL*uL*hL];
    const FR = [rR*uR, rR*uR*uR + pR, rR*uR*vR, rR*uR*hR];

    const fn0 = 0.5*(FL[0] + FR[0]) - 0.5*d0;
    const fn1 = 0.5*(FL[1] + FR[1]) - 0.5*d1;
    const fn2 = 0.5*(FL[2] + FR[2]) - 0.5*d2;
    const fn3 = 0.5*(FL[3] + FR[3]) - 0.5*d3;

    // 9. Rotate Back
    return [
        fn0,
        fn1 * nx - fn2 * ny,
        fn1 * ny + fn2 * nx,
        fn3
    ];
  }

  calculateTimeStep(cfl: number): number {
    let maxSpeed = 0;
    
    // Check ALL cells
    for (let i = 0; i < this.nx * this.ny; i++) {
        const idx = i * 4;
        const r = Math.max(1e-6, this.Q[idx]);
        const invR = 1.0/r; 
        const u = this.Q[idx+1]*invR;
        const v = this.Q[idx+2]*invR;
        
        let p = this.getPressure(r, this.Q[idx+1], this.Q[idx+2], this.Q[idx+3]);
        
        const c = Math.sqrt(PHYSICS_CONSTANTS.GAMMA * p * invR);
        const speed = Math.sqrt(u*u + v*v) + c;
        if (speed > maxSpeed) maxSpeed = speed;
    }
    
    maxSpeed = Math.max(10.0, maxSpeed); 
    
    // Conservative Time Step for Stability
    // If Mach is high (>3), maxSpeed will be huge, automatically lowering dt.
    const calculatedDt = cfl * Math.min(this.dx, this.dy) / maxSpeed;
    
    // Hard cap to prevent instability during initial transient
    return Math.min(calculatedDt, 0.00005); 
  }

  applyBoundaryConditions() {
    const centerY = Math.floor(this.ny / 2);
    const radius = Math.floor(this.ny / 8); 
    
    // 1. INLET (Left)
    for (let j = 0; j < this.ny; j++) {
        const idx = (j * this.nx) * 4;
        
        if (Math.abs(j - centerY) <= radius) {
            this.Q_new[idx] = this.inletState.rho;
            this.Q_new[idx+1] = this.inletState.rho * this.inletState.u;
            this.Q_new[idx+2] = this.inletState.rho * this.inletState.v;
            this.Q_new[idx+3] = this.inletState.E;
        } else {
            // Reflective Wall
            this.Q_new[idx] = this.Q_new[idx+4]; 
            this.Q_new[idx+1] = 0; 
            this.Q_new[idx+2] = this.Q_new[idx+4+2]; 
            const rho = this.Q_new[idx];
            const p = this.getPressure(this.Q_new[idx+4], this.Q_new[idx+4+1], this.Q_new[idx+4+2], this.Q_new[idx+4+3]);
            this.Q_new[idx+3] = this.computeEnergy(rho, 0, this.Q_new[idx+2]/rho, p);
        }
    }

    // 2. OUTLET (Right)
    for (let j = 0; j < this.ny; j++) {
        const idxOut = (j * this.nx + this.nx - 1) * 4;
        const idxIn = (j * this.nx + this.nx - 2) * 4;
        this.Q_new[idxOut] = this.Q_new[idxIn];
        this.Q_new[idxOut+1] = this.Q_new[idxIn+1];
        this.Q_new[idxOut+2] = this.Q_new[idxIn+2];
        this.Q_new[idxOut+3] = this.Q_new[idxIn+3];
    }

    // 3. FAR FIELD
    for (let i = 0; i < this.nx; i++) {
        const idxBot = i * 4;
        const idxTop = ((this.ny - 1) * this.nx + i) * 4;
        
        this.Q_new[idxBot] = this.ambientState.rho;
        this.Q_new[idxBot+1] = 0;
        this.Q_new[idxBot+2] = 0;
        this.Q_new[idxBot+3] = this.ambientState.E;

        this.Q_new[idxTop] = this.ambientState.rho;
        this.Q_new[idxTop+1] = 0;
        this.Q_new[idxTop+2] = 0;
        this.Q_new[idxTop+3] = this.ambientState.E;
    }
  }

  // Returns true if stable, false if NaN/Inf detected
  fixPositivityAndCheckStability(): boolean {
    // Aggressive floors for High Mach flows
    const minRho = 0.05; 
    const minP = 100.0; 
    const gamma = PHYSICS_CONSTANTS.GAMMA;

    for (let i = 0; i < this.nx * this.ny; i++) {
        const idx = i * 4;
        
        let r = this.Q_new[idx];
        let E = this.Q_new[idx+3];
        
        // Critical Stability Check
        if (isNaN(r) || !isFinite(r)) return false;
        if (isNaN(E) || !isFinite(E)) return false;

        // Density Floor
        if (r < minRho) {
            r = minRho;
            this.Q_new[idx] = r;
            this.Q_new[idx+1] = 0;
            this.Q_new[idx+2] = 0;
        }

        const u = this.Q_new[idx+1]/r;
        const v = this.Q_new[idx+2]/r;
        
        if(isNaN(u) || isNaN(v)) return false;

        const kinE = 0.5 * r * (u*u + v*v);
        let p = (gamma - 1) * (E - kinE);

        // Pressure Floor
        if (isNaN(p) || p < minP) {
            p = minP;
            // Adjust Energy to match new pressure
            this.Q_new[idx+3] = p / (gamma - 1) + kinE;
        }
    }
    return true;
  }

  getScalarField(mode: string): { data: Float32Array, min: number, max: number } {
    const data = new Float32Array(this.nx * this.ny);
    let min = Number.MAX_VALUE;
    let max = -Number.MAX_VALUE;

    for(let i=0; i < this.nx * this.ny; i++) {
        const idx = i * 4;
        let val = 0;

        const rho = this.Q[idx];
        const u = this.Q[idx+1] / (rho + 1e-9);
        const v = this.Q[idx+2] / (rho + 1e-9);
        const E = this.Q[idx+3];
        const p = this.getPressure(rho, this.Q[idx+1], this.Q[idx+2], E);

        if (mode === 'density') val = rho;
        else if (mode === 'pressure') val = p;
        else if (mode === 'velocity') val = Math.sqrt(u*u + v*v);
        else if (mode === 'temperature') val = p / (rho * PHYSICS_CONSTANTS.R);
        else if (mode === 'mach') {
            const c = Math.sqrt(PHYSICS_CONSTANTS.GAMMA * p / (rho + 1e-9));
            val = Math.sqrt(u*u + v*v) / (c + 1e-9);
        } else if (mode === 'schlieren') {
            let drdx = 0;
            let drdy = 0;
            const col = i % this.nx;
            const row = Math.floor(i / this.nx);
            
            if (col > 0 && col < this.nx - 1) {
                drdx = (this.Q[(idx+4)] - this.Q[(idx-4)]) / (2 * this.dx);
            }
            if (row > 0 && row < this.ny - 1) {
                const idxUp = ((row+1)*this.nx + col)*4;
                const idxDown = ((row-1)*this.nx + col)*4;
                drdy = (this.Q[idxUp] - this.Q[idxDown]) / (2 * this.dy);
            }
            val = Math.sqrt(drdx*drdx + drdy*drdy);
            val = Math.log(1 + 10*val); 
        }

        data[i] = val;
        if(val < min) min = val;
        if(val > max) max = val;
    }
    return { data, min, max };
  }
}