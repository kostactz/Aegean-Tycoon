
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uWaveIntensity;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    float wave1 = sin(pos.x * 0.2 + uTime * 0.5) * 0.5 * uWaveIntensity;
    float wave2 = cos(pos.y * 0.2 + uTime * 0.3) * 0.5 * uWaveIntensity;
    float wave3 = sin(pos.x * 1.0 + uTime * 1.0) * 0.1 * (uWaveIntensity - 1.0);
    
    pos.z += wave1 + wave2 + max(0.0, wave3);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uFoamThreshold;
  
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
    // Richer Mediterranean Colors
    vec3 deepBlue = vec3(0.0, 0.05, 0.35); // Darker base
    vec3 turquoise = vec3(0.0, 0.5, 0.7); // Less neon turquoise
    
    float n = noise(vUv * 30.0 + uTime * 0.5);
    float n2 = noise(vUv * 15.0 - uTime * 0.2);
    
    float mixFactor = (n + n2) * 0.5;
    
    vec3 color = mix(deepBlue, turquoise, mixFactor + 0.1);
    
    // Foam logic
    float foamNoise = noise(vUv * 80.0 + uTime * 1.5);
    float foamLevel = step(uFoamThreshold, foamNoise);
    
    // Add sparkles/caustics feel
    float sparkles = step(0.98, noise(vUv * 120.0 + uTime));
    
    color += foamLevel * 0.6;
    color += sparkles * 0.3;
    
    gl_FragColor = vec4(color, 0.95);
  }
`;

export const Water = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const weather = useGameStore(state => state.weather);
  
  const targetIntensity = useRef(1.0);
  const currentIntensity = useRef(1.0);

  useFrame((state, delta) => {
    if (materialRef.current) {
      // Meltemi causes bigger waves and more foam
      targetIntensity.current = weather === 'MELTEMI' ? 3.0 : 1.0;
      currentIntensity.current = THREE.MathUtils.lerp(currentIntensity.current, targetIntensity.current, delta * 0.5);

      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uWaveIntensity.value = currentIntensity.current;
      // Lower threshold = more foam. 0.95 is normal, 0.85 is foamy.
      materialRef.current.uniforms.uFoamThreshold.value = weather === 'MELTEMI' ? 0.82 : 0.95;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
      {/* Significantly increased plane size for larger map */}
      <planeGeometry args={[400, 400, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uWaveIntensity: { value: 1.0 },
          uFoamThreshold: { value: 0.95 }
        }}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
