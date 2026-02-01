import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Simulator } from './components/Simulator';

export default function App() {
  const [hasLaunched, setHasLaunched] = useState(false);

  // Simple State-based routing
  if (!hasLaunched) {
      return <LandingPage onLaunch={() => setHasLaunched(true)} />;
  }

  return <Simulator />;
}