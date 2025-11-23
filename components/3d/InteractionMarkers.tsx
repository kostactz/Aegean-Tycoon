
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import { ISLANDS } from '../../constants';
import * as THREE from 'three';

export const InteractionMarkers = () => {
  const validNextMoves = useGameStore((state) => state.validNextMoves);
  const chooseDirection = useGameStore((state) => state.chooseDirection);
  const phase = useGameStore((state) => state.phase);
  const players = useGameStore((state) => state.players);
  const turnIndex = useGameStore((state) => state.turnIndex);

  if (phase !== 'CHOOSING_PATH' || validNextMoves.length === 0) return null;

  return (
    <group>
      {validNextMoves.map((islandId) => {
        const targetIsland = ISLANDS.find((i) => i.id === islandId);
        if (!targetIsland) return null;
        
        return (
          <SelectionArrow 
            key={islandId} 
            position={targetIsland.position} 
            onClick={() => chooseDirection(islandId)} 
            targetName={targetIsland.name}
          />
        );
      })}
    </group>
  );
};

interface SelectionArrowProps {
  position: [number, number, number];
  onClick: () => void;
  targetName: string;
}

const SelectionArrow: React.FC<SelectionArrowProps> = ({ position, onClick, targetName }) => {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        if (groupRef.current) {
            // Stronger Bob and spin
            const t = state.clock.elapsedTime;
            groupRef.current.position.y = position[1] + 2.5 + Math.sin(t * 5) * 0.3;
            groupRef.current.rotation.y += 0.03;
            
            // Scale pulse
            const scale = 1 + Math.sin(t * 8) * 0.1 + (hovered ? 0.3 : 0);
            groupRef.current.scale.setScalar(scale);
        }
    });

    return (
        <group position={[position[0], position[1], position[2]]}>
            <group 
                ref={groupRef}
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(true); }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false); }}
            >
                {/* Arrow Head (pointing down) */}
                <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
                    <coneGeometry args={[0.7, 1.2, 8]} />
                    <meshStandardMaterial 
                        color={hovered ? "#fbbf24" : "#f59e0b"} 
                        emissive={hovered ? "#fbbf24" : "#f59e0b"} 
                        emissiveIntensity={hovered ? 1.0 : 0.4} 
                    />
                </mesh>
                
                {/* Text Label */}
                <Text 
                    position={[0, 1.5, 0]} 
                    fontSize={0.6} 
                    color="white"
                    outlineWidth={0.05}
                    outlineColor="#000000"
                    anchorY="bottom"
                >
                    {targetName}
                </Text>

                {/* Invisible Hitbox for easier tapping */}
                <mesh position={[0, 0.5, 0]} visible={false}>
                    <sphereGeometry args={[1.5, 8, 8]} />
                    <meshBasicMaterial />
                </mesh>
            </group>
            
            {/* Ground Ring Marker */}
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <ringGeometry args={[1.5, 1.8, 32]} />
                <meshBasicMaterial color={hovered ? "#fbbf24" : "#f59e0b"} transparent opacity={0.6} />
            </mesh>
            
            {/* Vertical Line connecting arrow to ground */}
            <mesh position={[0, 1.25, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 2.5]} />
                <meshBasicMaterial color="#f59e0b" transparent opacity={0.5} />
            </mesh>
        </group>
    );
}
