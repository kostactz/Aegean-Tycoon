
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import { DAY_NIGHT_CYCLE_DURATION, CYCLE_PHASE } from '../../constants';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  uniform float uWaveIntensity;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Large rolling swell (Low frequency, higher amplitude)
    float swell = sin(pos.x * 0.1 + uTime * 0.3) * 0.6 * uWaveIntensity;
    
    // Cross chop (Mid frequency)
    float chop = cos(pos.y * 0.3 + pos.x * 0.15 + uTime * 0.5) * 0.25 * uWaveIntensity;
    
    // Detail jitter (High frequency)
    float detail = sin(pos.x * 0.8 + pos.y * 0.6 + uTime * 0.8) * 0.05 * uWaveIntensity;
    
    float elevation = swell + chop + detail;
    pos.z += elevation; 
    
    vElevation = elevation;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  uniform float uFoamThreshold;
  uniform float uNightMix;
  
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  
  // Value Noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), f.x),
               mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), f.x), f.y);
  }
  
  // FBM for detailed foam texture
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 3; ++i) {
        v += a * noise(p);
        p = rot * p * 2.0 + shift;
        a *= 0.5;
    }
    return v;
  }

  void main() {
    // Elegant Aegean Palette
    vec3 deepBlue = vec3(0.0, 0.15, 0.4); 
    vec3 turquoise = vec3(0.0, 0.55, 0.75);
    vec3 nightBlue = vec3(0.0, 0.02, 0.1);
    
    // --- ORGANIC FLOWING NOISE ---
    // Layer 1: Slow, large movement
    vec2 uv1 = vUv * 8.0 + vec2(uTime * 0.02, uTime * 0.01);
    float n1 = noise(uv1);
    
    // Layer 2: Faster interference
    vec2 uv2 = vUv * 15.0 - vec2(uTime * 0.03, uTime * 0.02);
    float n2 = noise(uv2);
    
    // Base wave pattern
    float wavePattern = mix(n1, n2, 0.5);
    
    // --- COLOR MIXING ---
    // Mix deep blue and turquoise based on wave height/noise
    // Lighter color at peaks (simulating light passing through thin water)
    vec3 color = mix(deepBlue, turquoise, smoothstep(0.4, 0.8, wavePattern + vElevation * 0.15));
    
    // --- NIGHT DARKENING ---
    color = mix(color, nightBlue, uNightMix * 0.95);
    
    // --- FOAM LOGIC ---
    // Foam concentrates at peaks of waves
    // Use elevation + noise to find crests
    float crest = smoothstep(uFoamThreshold, uFoamThreshold + 0.2, wavePattern + vElevation * 0.3);
    
    // Foam Texture (detailed bubbles)
    // Distort UVs with the large wave pattern for cohesion
    vec2 foamUv = vUv * 40.0 + vec2(uTime * 0.05) + (vec2(n1, n2) * 0.3);
    float foamTex = fbm(foamUv);
    
    // "Webbing" effect: patchy foam
    // Erode the foam based on its own noise texture to create bubbles/webbing
    float foamMask = crest * smoothstep(0.4, 0.7, foamTex);
    
    // Dim foam at night
    vec3 foamColor = vec3(0.96, 0.99, 1.0) * (1.0 - uNightMix * 0.5);
    
    // Apply Foam
    color = mix(color, foamColor, foamMask);
    
    // --- ALPHA ---
    // Transparent water, opaque foam
    float alpha = 0.6 + (foamMask * 0.4);
    
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
      
      // Thresholds: Higher number = Less foam.
      // Meltemi (Storm) = 0.55 (More foam), Normal = 0.75 (Less foam)
      const targetThreshold = weather === 'MELTEMI' ? 0.55 : 0.75;
      materialRef.current.uniforms.uFoamThreshold.value = THREE.MathUtils.lerp(
          materialRef.current.uniforms.uFoamThreshold.value, 
          targetThreshold, 
          delta
      );
      
      materialRef.current.uniforms.uNightMix.value = nightMix;
    }
  });

  return (
    <group>
        {/* LAYER 1: Realistic Reflections (Base) */}
        {/* Moved down to -0.8 to prevent larger waves from clipping through */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
            <planeGeometry args={[400, 400]} />
            <MeshReflectorMaterial
                blur={[300, 100]}
                resolution={512}
                mixBlur={1}
                mixStrength={15}
                roughness={0.5}
                depthScale={1.2}
                minDepthThreshold={0.4}
                maxDepthThreshold={1.4}
                color="#002b4d" // Slightly darker base
                metalness={0.8}
                mirror={0.6}
                distortion={0.5} 
            />
        </mesh>

        {/* LAYER 2: Animated Shader (Waves & Foam) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[400, 400, 128, 128]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={{
                    uTime: { value: 0 },
                    uWaveIntensity: { value: 1.0 },
                    uFoamThreshold: { value: 0.75 },
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
