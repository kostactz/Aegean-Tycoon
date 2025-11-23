
import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Sky, Line, SoftShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Water } from './Water';
import { IslandComponent } from './Island';
import { Ferry } from './Ferry';
import { CameraRig } from './CameraRig';
import { WeatherEffects } from './WeatherEffects';
import { InteractionMarkers } from './InteractionMarkers';
import { FloatingNumbers } from './FloatingNumbers';
import { Dice } from './Dice';
import { useGameStore } from '../../store/gameStore';
import { ROUTES, ISLANDS } from '../../constants';
import * as THREE from 'three';

const RouteLines = () => {
    const lines = React.useMemo(() => {
        return ROUTES.map((route) => {
             const startIsland = ISLANDS.find(i => i.id === route.from);
             const endIsland = ISLANDS.find(i => i.id === route.to);
             
             if (!startIsland || !endIsland) return null;

             const start = new THREE.Vector3(...startIsland.position);
             const end = new THREE.Vector3(...endIsland.position);
             
             // Raise lines slightly above water surface to avoid z-fighting with waves
             start.y = 0.05;
             end.y = 0.05;

             const control = new THREE.Vector3(...route.controlPoints[0]);
             
             const curve = new THREE.QuadraticBezierCurve3(start, control, end);
             const points = curve.getPoints(20);

             return (
                 <Line 
                    key={`${route.from}-${route.to}`} 
                    points={points} 
                    color="white" 
                    opacity={0.3} 
                    transparent 
                    lineWidth={1.5} 
                    dashed 
                    dashScale={3} 
                    dashSize={0.4} 
                    gapSize={0.2} 
                 />
             );
        });
    }, []);

    return <group>{lines}</group>;
}

export const GameScene = () => {
  const islands = useGameStore(state => state.islands);
  const players = useGameStore(state => state.players);

  return (
    <Canvas 
      shadows="soft" // Enable soft shadows
      camera={{ position: [8, 12, 15], fov: 45 }} 
      dpr={[1, 1.5]} // Limit pixel ratio for performance with reflections
    >
      <Suspense fallback={null}>
        {/* SUNNY LIGHTING SETUP */}
        <ambientLight intensity={0.9} />
        
        <directionalLight 
            position={[50, 80, 30]} // High Noon Sun
            intensity={2.5} 
            castShadow 
            shadow-bias={-0.0005}
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-40}
            shadow-camera-right={40}
            shadow-camera-top={40}
            shadow-camera-bottom={-40}
        />

        {/* High contrast environment for reflections */}
        <Environment preset="city" />
        
        {/* Crystal clear sunny sky */}
        <Sky 
            sunPosition={[50, 80, 30]} 
            turbidity={0.05} 
            rayleigh={0.12} 
            mieCoefficient={0.002} 
            mieDirectionalG={0.8} 
        />
        
        {/* Cinematic Director */}
        <CameraRig />

        {/* The World */}
        <Water />
        <WeatherEffects />
        <RouteLines />
        <InteractionMarkers />
        <FloatingNumbers />
        
        {/* 3D UI Elements */}
        <Dice />
        
        {islands.map(island => {
            const owner = players.find(p => p.id === island.ownerId);
            return (
                <IslandComponent 
                    key={island.id} 
                    data={island} 
                    ownedByColor={owner?.avatarColor} 
                />
            );
        })}

        {players.map(player => (
            <Ferry key={player.id} player={player} islands={islands} />
        ))}

        {/* Post Processing: Clean look */}
        <EffectComposer>
            <Bloom luminanceThreshold={1.1} intensity={0.2} />
            <Vignette eskil={false} offset={0.1} darkness={0.3} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
};
