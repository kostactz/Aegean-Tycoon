
import React from 'react';
import { GameScene } from './components/3d/GameScene';
import { HUD } from './components/ui/HUD';
import { useAudio } from './hooks/useAudio';

const App: React.FC = () => {
  useAudio(); // Mount audio system

  return (
    <div className="w-full h-full relative bg-gradient-to-b from-blue-300 to-blue-500">
      {/* 3D Layer */}
      <div className="absolute inset-0 z-0">
        <GameScene />
      </div>

      {/* UI Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <HUD />
      </div>
    </div>
  );
};

export default App;
