
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

const Seagulls = () => {
    const count = 30;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    const birds = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            x: (Math.random() - 0.5) * 40,
            y: 3 + Math.random() * 5,
            z: (Math.random() - 0.5) * 40,
            speed: 0.02 + Math.random() * 0.03,
            angle: Math.random() * Math.PI * 2,
            radius: 5 + Math.random() * 10,
            centerX: (Math.random() - 0.5) * 10,
            centerZ: (Math.random() - 0.5) * 10,
            flapSpeed: 5 + Math.random() * 5,
            offset: Math.random() * 100
        }));
    }, []);

    useFrame((state) => {
        if(!meshRef.current) return;
        const t = state.clock.getElapsedTime();

        birds.forEach((bird, i) => {
            // Circling logic
            const angle = t * bird.speed + bird.offset;
            bird.x = bird.centerX + Math.cos(angle) * bird.radius;
            bird.z = bird.centerZ + Math.sin(angle) * bird.radius;
            
            // Bobbing height
            const y = bird.y + Math.sin(t + bird.offset) * 0.5;

            dummy.position.set(bird.x, y, bird.z);
            
            // Rotation (face direction of movement)
            dummy.rotation.y = -angle; 
            
            // Flapping (Scale Y simulates wings going up/down vaguely for v-shape)
            const flap = Math.sin(t * bird.flapSpeed);
            dummy.scale.set(0.1, 0.1 * flap, 0.1); 
            
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
            {/* Simple V shape geometry */}
            <bufferGeometry>
                <float32BufferAttribute attach="attributes-position" count={3} array={new Float32Array([
                    -0.5, 0.5, 0, // Left Wing tip
                    0, 0, 0,      // Center
                    0.5, 0.5, 0   // Right Wing tip
                ])} itemSize={3} />
            </bufferGeometry>
            <meshBasicMaterial color="white" side={THREE.DoubleSide} />
        </instancedMesh>
    );
}

export const WeatherEffects = () => {
  const weather = useGameStore((state) => state.weather);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Meltemi Wind Particles
  const count = 300;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
        x: (Math.random() - 0.5) * 50,
        y: 2.0 + Math.random() * 5, // Raised to avoid clipping with sea waves
        z: (Math.random() - 0.5) * 50,
        speed: 0.2 + Math.random() * 0.5,
        len: 1 + Math.random() * 3
      }));
  }, []);

  useFrame(() => {
    if (weather !== 'MELTEMI' || !meshRef.current) return;

    particles.forEach((particle, i) => {
      particle.x += particle.speed;
      if (particle.x > 25) particle.x = -25; // Loop

      dummy.position.set(particle.x, particle.y, particle.z);
      // Wind streaks
      dummy.scale.set(particle.len, 0.03, 0.03); 
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
        <Seagulls />
        {weather === 'MELTEMI' && (
            <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color="white" transparent opacity={0.3} />
            </instancedMesh>
        )}
    </group>
  );
};
