
import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Sky, Line, Cloud } from '@react-three/drei';
import { EffectComposer, TiltShift, Bloom, Vignette } from '@react-three/postprocessing';
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

const Clouds = () => {
    return (
        <group>
            <Cloud position={[-10, 5, -10]} opacity={0.5} speed={0.2} width={10} depth={1.5} segments={20} />
            <Cloud position={[10, 4, 5]} opacity={0.4} speed={0.2} width={10} depth={1.5} segments={20} color="#ecfeff" />
            <Cloud position={[0, 8, -5]} opacity={0.3} speed={0.1} width={20} depth={2} segments={30} />
        </group>
    )
}

export const GameScene = () => {
  const islands = useGameStore(state => state.islands);
  const players = useGameStore(state => state.players);

  return (
    <Canvas shadows camera={{ position: [8, 8, 8], fov: 45 }} dpr={[1, 2]}>
      <Suspense fallback={null}>
        {/* Lighting adjustments for natural "Deep Mediterranean" look */}
        <ambientLight intensity={0.5} />
        <directionalLight 
            position={[30, 50, 20]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-30}
            shadow-camera-right={30}
            shadow-camera-top={30}
            shadow-camera-bottom={-30}
        />
        <Environment preset="sunset" />
        <Sky sunPosition={[30, 50, 20]} turbidity={0.3} rayleigh={0.7} mieCoefficient={0.005} />
        
        <Clouds />

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

        {/* Post Processing: Reduced blur and glare for cleaner look */}
        <EffectComposer>
            <Bloom luminanceThreshold={0.9} intensity={0.3} />
            {/* Extremely subtle tilt shift, almost fully clear */}
            <TiltShift focusDistance={0.5} focalLength={0.8} bokehScale={0.1} />
            <Vignette eskil={false} offset={0.1} darkness={0.4} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
};
