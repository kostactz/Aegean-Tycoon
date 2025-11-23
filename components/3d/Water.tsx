

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import { DAY_NIGHT_CYCLE_DURATION, CYCLE_PHASE } from '../../constants';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uWaveIntensity;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Stronger, more complex rolling waves
    float wave1 = sin(pos.x * 0.4 + uTime * 0.8) * 0.3 * uWaveIntensity;
    float wave2 = cos(pos.y * 0.3 + uTime * 0.6) * 0.2 * uWaveIntensity;
    float wave3 = sin(pos.x * 0.8 + pos.y * 0.5 + uTime * 1.2) * 0.1 * uWaveIntensity;
    
    pos.z += wave1 + wave2 + wave3; // Z is up because of rotation
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uFoamThreshold;
  uniform float uNightMix;
  
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), f.x),
               mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), f.x), f.y);
  }

  void main() {
    // Brighter, clearer Aegean colors
    vec3 deepBlue = vec3(0.0, 0.35, 0.6); 
    vec3 turquoise = vec3(0.0, 0.8, 0.95);
    vec3 nightBlue = vec3(0.0, 0.02, 0.1);
    
    float n = noise(vUv * 20.0 + uTime * 0.4);
    
    vec3 color = mix(deepBlue, turquoise, n * 0.7);
    
    // Apply Night Darkening
    color = mix(color, nightBlue, uNightMix * 0.9);
    
    // Sharp foam edges
    float foamNoise = noise(vUv * 60.0 + uTime * 1.2);
    float foamLevel = step(uFoamThreshold, foamNoise);
    
    // Intense sparkles for sunny look
    float sparkles = step(0.97, noise(vUv * 100.0 + uTime * 2.5));
    
    color += foamLevel * (0.9 - uNightMix * 0.5); // Dim foam slightly at night
    
    // Dim sparkles at night
    float sparkleIntensity = 0.8 * (1.0 - uNightMix * 0.8);
    color += sparkles * sparkleIntensity;
    
    // Increased alpha to make the color pop over the dark reflector
    float alpha = 0.4 + (foamLevel * 0.6) + (sparkles * 0.6);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export const Water = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const weather = useGameStore(state => state.weather);
  const gameStartTime = useGameStore(state => state.gameStartTime);
  
  const targetIntensity = useRef(1.0);
  const currentIntensity = useRef(1.0);

  useFrame((state, delta) => {
    // Calculate night mix locally
    const elapsed = Date.now() - gameStartTime;
    const progress = (elapsed % DAY_NIGHT_CYCLE_DURATION) / DAY_NIGHT_CYCLE_DURATION;
    let nightMix = 0;
    
    if (progress >= CYCLE_PHASE.SUNSET_START && progress <= CYCLE_PHASE.SUNSET_END) {
             nightMix = (progress - CYCLE_PHASE.SUNSET_START) / (CYCLE_PHASE.SUNSET_END - CYCLE_PHASE.SUNSET_START);
    } else if (progress > CYCLE_PHASE.SUNSET_END && progress < CYCLE_PHASE.SUNRISE_START) {
             nightMix = 1;
    } else if (progress >= CYCLE_PHASE.SUNRISE_START && progress <= CYCLE_PHASE.SUNRISE_END) {
             nightMix = 1 - (progress - CYCLE_PHASE.SUNRISE_START) / (CYCLE_PHASE.SUNRISE_END - CYCLE_PHASE.SUNRISE_START);
    }

    if (materialRef.current) {
      targetIntensity.current = weather === 'MELTEMI' ? 2.5 : 1.0;
      currentIntensity.current = THREE.MathUtils.lerp(currentIntensity.current, targetIntensity.current, delta * 0.5);

      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uWaveIntensity.value = currentIntensity.current;
      materialRef.current.uniforms.uFoamThreshold.value = weather === 'MELTEMI' ? 0.75 : 0.92;
      materialRef.current.uniforms.uNightMix.value = nightMix;
    }
  });

  return (
    <group>
        {/* LAYER 1: Realistic Reflections (Base) with Distortion */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
            <planeGeometry args={[400, 400]} />
            <MeshReflectorMaterial
                blur={[300, 100]}
                resolution={512}
                mixBlur={1}
                mixStrength={10}
                roughness={0.6}
                depthScale={1.2}
                minDepthThreshold={0.4}
                maxDepthThreshold={1.4}
                color="#004970"
                metalness={0.7}
                mirror={0.7}
                distortion={1} // Adds waviness to the reflection
            />
        </mesh>

        {/* LAYER 2: Animated Shader (Waves & Foam) */}
        {/* Transparent overlay that physically moves */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[400, 400, 128, 128]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={{
                    uTime: { value: 0 },
                    uWaveIntensity: { value: 1.0 },
                    uFoamThreshold: { value: 0.92 },
                    uNightMix: { value: 0 }
                }}
                transparent
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </mesh>
    </group>
  );
};
