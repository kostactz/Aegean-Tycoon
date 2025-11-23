
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

export const Dice = () => {
  const meshRef = useRef<THREE.Group>(null);
  const diceValue = useGameStore(state => state.diceValue);
  const isDiceRolling = useGameStore(state => state.isDiceRolling);
  const phase = useGameStore(state => state.phase);

  // Rotation logic for each face to face UP
  // Standard dice: 1 opposite 6, 2 opposite 5, 3 opposite 4
  // We assume default rotation shows 1 up.
  const getTargetRotation = (val: number): [number, number, number] => {
      switch(val) {
          case 1: return [0, 0, 0];
          case 2: return [-Math.PI/2, 0, 0];
          case 3: return [0, Math.PI/2, 0];
          case 4: return [0, -Math.PI/2, 0];
          case 5: return [Math.PI/2, 0, 0];
          case 6: return [Math.PI, 0, 0];
          default: return [0,0,0];
      }
  };

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (isDiceRolling) {
        // Spin wildly
        meshRef.current.rotation.x += 15 * delta;
        meshRef.current.rotation.y += 12 * delta;
        meshRef.current.rotation.z += 8 * delta;
        
        // Bob up and down
        meshRef.current.position.y = 3 + Math.sin(state.clock.elapsedTime * 10) * 1;
    } else {
        // Smoothly rotate to target face
        const targetRot = getTargetRotation(diceValue);
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...targetRot));
        meshRef.current.quaternion.slerp(q, delta * 5);
        
        // Return to rest position
        meshRef.current.position.lerp(new THREE.Vector3(0, 2, 0), delta * 5);
    }
  });

  // Only show dice during rolling phase or shortly after
  const isVisible = phase === 'ROLLING' || isDiceRolling || (phase === 'MOVING' && diceValue > 0);

  if (!isVisible && !isDiceRolling) return null;

  return (
    <group ref={meshRef} position={[0, 2, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.1} />
      </mesh>
      
      {/* Dots (Simplified as black meshes or text for clarity) */}
      <Face val={1} pos={[0, 0, 0.41]} rot={[0, 0, 0]} />
      <Face val={6} pos={[0, 0, -0.41]} rot={[0, Math.PI, 0]} />
      <Face val={2} pos={[0, 0.41, 0]} rot={[-Math.PI/2, 0, 0]} />
      <Face val={5} pos={[0, -0.41, 0]} rot={[Math.PI/2, 0, 0]} />
      <Face val={3} pos={[-0.41, 0, 0]} rot={[0, -Math.PI/2, 0]} />
      <Face val={4} pos={[0.41, 0, 0]} rot={[0, Math.PI/2, 0]} />
    </group>
  );
};

const Face = ({ val, pos, rot }: { val: number, pos: [number,number,number], rot: [number,number,number] }) => (
    <group position={pos} rotation={rot}>
        {/* Simple Dots Logic */}
        {/* Or just text for simplicity and clarity */}
        <Text 
            fontSize={0.5} 
            color="black" 
            anchorX="center" 
            anchorY="middle"
        >
            {val}
        </Text>
    </group>
);
