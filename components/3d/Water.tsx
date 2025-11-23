
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uWaveIntensity;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Gentle rolling waves
    float wave1 = sin(pos.x * 0.2 + uTime * 0.5) * 0.2 * uWaveIntensity;
    float wave2 = cos(pos.y * 0.2 + uTime * 0.3) * 0.2 * uWaveIntensity;
    
    pos.z += wave1 + wave2; // Z is up because of rotation
    
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
    // Colors
    vec3 deepBlue = vec3(0.0, 0.3, 0.5); 
    vec3 turquoise = vec3(0.0, 0.7, 0.9);
    
    float n = noise(vUv * 30.0 + uTime * 0.5);
    
    vec3 color = mix(deepBlue, turquoise, n * 0.6);
    
    // Foam logic
    float foamNoise = noise(vUv * 80.0 + uTime * 1.5);
    float foamLevel = step(uFoamThreshold, foamNoise);
    
    // Sparkles
    float sparkles = step(0.98, noise(vUv * 120.0 + uTime * 2.0));
    
    color += foamLevel * 0.8;
    color += sparkles * 0.5;
    
    // Alpha Logic:
    // Base water is transparent (0.2) to let the Reflector below show through.
    // Foam and Sparkles are opaque (0.9) to sit on top.
    float alpha = 0.2 + (foamLevel * 0.7) + (sparkles * 0.7);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export const Water = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const weather = useGameStore(state => state.weather);
  
  const targetIntensity = useRef(1.0);
  const currentIntensity = useRef(1.0);

  useFrame((state, delta) => {
    if (materialRef.current) {
      targetIntensity.current = weather === 'MELTEMI' ? 3.0 : 1.0;
      currentIntensity.current = THREE.MathUtils.lerp(currentIntensity.current, targetIntensity.current, delta * 0.5);

      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uWaveIntensity.value = currentIntensity.current;
      materialRef.current.uniforms.uFoamThreshold.value = weather === 'MELTEMI' ? 0.82 : 0.95;
    }
  });

  return (
    <group>
        {/* LAYER 1: Realistic Reflections (Base) */}
        {/* Positioned slightly below the waves */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
            <planeGeometry args={[400, 400]} />
            <MeshReflectorMaterial
                blur={[400, 100]}
                resolution={512} // Lower resolution for performance on mobile
                mixBlur={1}
                mixStrength={15} // Reflection strength
                roughness={0.4}
                depthScale={1.2}
                minDepthThreshold={0.4}
                maxDepthThreshold={1.4}
                color="#005580" // Deep sea base color
                metalness={0.6}
            />
        </mesh>

        {/* LAYER 2: Animated Shader (Waves & Foam) */}
        {/* Transparent overlay to add the "Aegean" style and movement */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
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
                depthWrite={false} // Prevents z-fighting with reflector
                side={THREE.DoubleSide}
            />
        </mesh>
    </group>
  );
};
