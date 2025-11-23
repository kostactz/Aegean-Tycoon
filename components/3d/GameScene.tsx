

import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Sky, Line, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Water } from './Water';
import { IslandComponent } from './Island';
import { Ferry } from './Ferry';
import { CameraRig } from './CameraRig';
import { WeatherEffects } from './WeatherEffects';
import { InteractionMarkers } from './InteractionMarkers';
import { FloatingNumbers } from './FloatingNumbers';
import { BackgroundShips } from './BackgroundShips';
import { Dice } from './Dice';
import { useGameStore } from '../../store/gameStore';
import { ROUTES, ISLANDS, DAY_NIGHT_CYCLE_DURATION, CYCLE_PHASE } from '../../constants';
import * as THREE from 'three';

const RouteLines = () => {
    const lines = React.useMemo(() => {
        return ROUTES.map((route) => {
             const startIsland = ISLANDS.find(i => i.id === route.from);
             const endIsland = ISLANDS.find(i => i.id === route.to);
             
             if (!startIsland || !endIsland) return null;

             const start = new THREE.Vector3(...startIsland.position);
             const end = new THREE.Vector3(...endIsland.position);
             
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

// Custom hook to calculate night mixing factor
const useNightMix = () => {
    const gameStartTime = useGameStore(state => state.gameStartTime);
    const [mix, setMix] = useState(0);

    useFrame(() => {
        const elapsed = Date.now() - gameStartTime;
        const progress = (elapsed % DAY_NIGHT_CYCLE_DURATION) / DAY_NIGHT_CYCLE_DURATION;
        
        let m = 0;
        if (progress >= CYCLE_PHASE.SUNSET_START && progress <= CYCLE_PHASE.SUNSET_END) {
             // Sunset Phase: 0 -> 1
             m = (progress - CYCLE_PHASE.SUNSET_START) / (CYCLE_PHASE.SUNSET_END - CYCLE_PHASE.SUNSET_START);
        } else if (progress > CYCLE_PHASE.SUNSET_END && progress < CYCLE_PHASE.SUNRISE_START) {
             // Night Phase: 1
             m = 1;
        } else if (progress >= CYCLE_PHASE.SUNRISE_START && progress <= CYCLE_PHASE.SUNRISE_END) {
             // Sunrise Phase: 1 -> 0
             m = 1 - (progress - CYCLE_PHASE.SUNRISE_START) / (CYCLE_PHASE.SUNRISE_END - CYCLE_PHASE.SUNRISE_START);
        }
        setMix(m);
    });
    return mix;
}

const DayNightController = () => {
    const gameStartTime = useGameStore(state => state.gameStartTime);
    const setTimeOfDay = useGameStore(state => state.setTimeOfDay);
    const { scene } = useThree();
    
    const lightRef = useRef<THREE.DirectionalLight>(null);
    const ambientRef = useRef<THREE.AmbientLight>(null);
    const starsRef = useRef<THREE.Group>(null);
    
    const lastStoreUpdate = useRef(0);
    
    // Colors
    const dayColor = new THREE.Color("#fff7ed"); // Warm White
    const sunsetColor = new THREE.Color("#f97316"); // Orange
    const nightColor = new THREE.Color("#60a5fa"); // Blue Moon
    
    const dayAmbient = new THREE.Color("#ffffff");
    const sunsetAmbient = new THREE.Color("#7c2d12"); // Dark red/brown
    const nightAmbient = new THREE.Color("#172554"); // Deep blue

    useFrame(() => {
        if (!lightRef.current || !ambientRef.current) return;

        const elapsed = Date.now() - gameStartTime;
        const progress = (elapsed % DAY_NIGHT_CYCLE_DURATION) / DAY_NIGHT_CYCLE_DURATION;
        
        // Sync store for UI (1Hz)
        if (Date.now() - lastStoreUpdate.current > 1000) {
            setTimeOfDay(progress);
            lastStoreUpdate.current = Date.now();
        }

        // Calculate mixing factor for current frame
        let nightMix = 0;
        if (progress >= CYCLE_PHASE.SUNSET_START && progress <= CYCLE_PHASE.SUNSET_END) {
             nightMix = (progress - CYCLE_PHASE.SUNSET_START) / (CYCLE_PHASE.SUNSET_END - CYCLE_PHASE.SUNSET_START);
        } else if (progress > CYCLE_PHASE.SUNSET_END && progress < CYCLE_PHASE.SUNRISE_START) {
             nightMix = 1;
        } else if (progress >= CYCLE_PHASE.SUNRISE_START && progress <= CYCLE_PHASE.SUNRISE_END) {
             nightMix = 1 - (progress - CYCLE_PHASE.SUNRISE_START) / (CYCLE_PHASE.SUNRISE_END - CYCLE_PHASE.SUNRISE_START);
        }

        // --- SUN/MOON POSITION ---
        // 0.0 = Noon (Top) -> 0.25 = Sunset (Horizon) -> 0.5 = Midnight (Bottom) -> 0.75 = Sunrise
        const angle = (progress * Math.PI * 2) + (Math.PI / 2);
        const radius = 80;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        lightRef.current.position.set(x, y, 30);
        
        if (nightMix > 0.5) {
             // Moon logic (Opposite side of cycle)
             lightRef.current.position.set(-x, -y, 30);
        }

        // --- LIGHT COLOR INTERPOLATION ---
        const sunColor = new THREE.Color().copy(dayColor);
        if (nightMix < 0.5) {
             const t = nightMix * 2;
             sunColor.lerp(sunsetColor, t);
        } else {
             const t = (nightMix - 0.5) * 2;
             sunColor.copy(sunsetColor).lerp(nightColor, t);
        }
        lightRef.current.color.copy(sunColor);

        // --- AMBIENT COLOR ---
        const ambColor = new THREE.Color().copy(dayAmbient);
        if (nightMix < 0.5) {
             ambColor.lerp(sunsetAmbient, nightMix * 2);
        } else {
             ambColor.copy(sunsetAmbient).lerp(nightAmbient, (nightMix - 0.5) * 2);
        }
        ambientRef.current.color.copy(ambColor);
        
        // --- INTENSITIES ---
        const dayIntensity = 2.0;
        const sunsetIntensity = 1.0;
        const nightIntensity = 0.25; // Drastically reduced for realistic night
        
        let targetIntensity = dayIntensity;
        if (nightMix < 0.5) {
            targetIntensity = THREE.MathUtils.lerp(dayIntensity, sunsetIntensity, nightMix * 2);
        } else {
            targetIntensity = THREE.MathUtils.lerp(sunsetIntensity, nightIntensity, (nightMix - 0.5) * 2);
        }
        lightRef.current.intensity = targetIntensity;
        
        // Lower ambient intensity significantly at night to prevent glowing meshes
        ambientRef.current.intensity = THREE.MathUtils.lerp(0.8, 0.05, nightMix);

        // Control Scene Environment Intensity to prevent bright reflections at night
        if (scene) {
            scene.environmentIntensity = THREE.MathUtils.lerp(1.0, 0.1, nightMix);
        }

        // --- STARS ---
        if (starsRef.current) {
            const starOpacity = Math.max(0, (nightMix - 0.3) / 0.7);
            starsRef.current.scale.setScalar(starOpacity > 0 ? 1 : 0);
        }
    });

    const timeOfDay = useGameStore(state => state.timeOfDay);
    const angle = (timeOfDay * Math.PI * 2) + (Math.PI / 2);
    const sunX = Math.cos(angle) * 100;
    const sunY = Math.sin(angle) * 100;

    return (
        <group>
            <ambientLight ref={ambientRef} />
            <directionalLight 
                ref={lightRef}
                castShadow 
                shadow-bias={-0.0005}
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-40}
                shadow-camera-right={40}
                shadow-camera-top={40}
                shadow-camera-bottom={-40}
            />
             <Sky 
                sunPosition={[sunX, sunY, 30]} 
                turbidity={0.1 + (timeOfDay > 0.2 && timeOfDay < 0.3 ? 5 : 0)} 
                rayleigh={timeOfDay > 0.2 && timeOfDay < 0.3 ? 2 : 0.5} 
                mieCoefficient={0.005} 
                mieDirectionalG={0.8} 
            />
            <group ref={starsRef}>
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            </group>
        </group>
    );
}

const EffectsController = () => {
    const nightMix = useNightMix();
    // Bloom intensity: Day 0.2, Night 1.5
    const bloomIntensity = 0.2 + (nightMix * 1.3);
    const threshold = 1.1 - (nightMix * 0.6);

    return (
        <EffectComposer>
            <Bloom luminanceThreshold={threshold} intensity={bloomIntensity} />
            <Vignette eskil={false} offset={0.1} darkness={0.3} />
        </EffectComposer>
    )
}

export const GameScene = () => {
  const islands = useGameStore(state => state.islands);
  const players = useGameStore(state => state.players);
  
  return (
    <Canvas 
      shadows="soft" 
      camera={{ position: [8, 12, 15], fov: 45 }} 
      dpr={[1, 1.5]}
    >
      <Suspense fallback={null}>
        
        <DayNightController />
        
        <Environment preset="city" background={false} />
        
        <CameraRig />

        <Water />
        <WeatherEffects />
        <RouteLines />
        <InteractionMarkers />
        <FloatingNumbers />
        <BackgroundShips />
        
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

        <EffectsController />
      </Suspense>
    </Canvas>
  );
};
