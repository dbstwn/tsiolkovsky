export function turboColormap(t: number): string {
  // A simplified approximation of the Turbo colormap or a standard Jet/Rainbow
  // t is between 0 and 1
  const x = Math.max(0, Math.min(1, t));
  
  // Simple "Jet" style approximation for performance
  let r = 0, g = 0, b = 0;
  
  if (x < 0.125) { r=0; g=0; b=4*(x+0.125); }
  else if (x < 0.375) { r=0; g=4*(x-0.125); b=1; }
  else if (x < 0.625) { r=4*(x-0.375); g=1; b=1-4*(x-0.375); }
  else if (x < 0.875) { r=1; g=1-4*(x-0.625); b=0; }
  else { r=1-4*(x-0.875); g=0; b=0; }

  return `rgb(${Math.floor(r*255)}, ${Math.floor(g*255)}, ${Math.floor(b*255)})`;
}

export function getSchlierenColor(gradient: number, maxGrad: number): string {
    // Schlieren looks best as grayscale or sepia-tone, mapping gradient magnitude to intensity
    // Exponential scaling to highlight weak shocks
    const intensity = Math.min(1, Math.pow(gradient / (maxGrad + 0.0001), 0.5));
    const val = Math.floor(intensity * 255);
    // Dark background, white shocks
    return `rgb(${val}, ${val}, ${val})`;
}