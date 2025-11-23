
import React, { useMemo, useRef } from 'react';
import { Island as IslandType } from '../../types';
import { Text, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface IslandProps {
  data: IslandType;
  ownedByColor?: string;
}

// --- SUB COMPONENTS ---

const Tree = ({ position, type }: { position: [number, number, number], type: 'olive' | 'pine' }) => (
  <group position={position}>
    <mesh position={[0, 0.15, 0]}>
      <cylinderGeometry args={[0.05, 0.08, 0.3, 5]} />
      <meshStandardMaterial color="#5c4033" />
    </mesh>
    <mesh position={[0, 0.4, 0]}>
      {type === 'olive' ? (
        <icosahedronGeometry args={[0.2, 0]} />
      ) : (
        <coneGeometry args={[0.2, 0.5, 6]} />
      )}
      <meshStandardMaterial color={type === 'olive' ? "#4d7c0f" : "#14532d"} flatShading />
    </mesh>
  </group>
);

const Rock = ({ position, scale, color = "#78716c" }: { position: [number, number, number], scale: number, color?: string }) => (
  <mesh position={position} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]} scale={scale}>
    <dodecahedronGeometry args={[1, 0]} />
    <meshStandardMaterial color={color} flatShading roughness={0.8} />
  </mesh>
);

const Windmill = ({ position }: { position: [number, number, number] }) => {
    const bladeRef = useRef<THREE.Group>(null);
    useFrame((_, delta) => {
        if (bladeRef.current) bladeRef.current.rotation.z -= delta * 1.5;
    });

    return (
        <group position={position}>
            {/* Base */}
            <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.15, 0.2, 0.6]} />
                <meshStandardMaterial color="white" />
            </mesh>
            {/* Roof */}
            <mesh position={[0, 0.7, 0]}>
                <coneGeometry args={[0.16, 0.2, 16]} />
                <meshStandardMaterial color="#a8a29e" />
            </mesh>
            {/* Blades Group */}
            <group position={[0, 0.5, 0.1]} ref={bladeRef}>
                 <mesh>
                     <boxGeometry args={[0.05, 0.9, 0.02]} />
                     <meshStandardMaterial color="#fcd34d" />
                 </mesh>
                 <mesh rotation={[0, 0, Math.PI/2]}>
                     <boxGeometry args={[0.05, 0.9, 0.02]} />
                     <meshStandardMaterial color="#fcd34d" />
                 </mesh>
            </group>
        </group>
    );
}

const Church = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
        {/* Body */}
        <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial color="white" />
        </mesh>
        {/* Dome */}
        <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#2563eb" />
        </mesh>
        {/* Cross */}
        <group position={[0, 0.65, 0]}>
            <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[0.02, 0.15, 0.02]} />
                <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[0.1, 0.02, 0.02]} />
                <meshStandardMaterial color="white" />
            </mesh>
        </group>
    </group>
);

const StoneHouse = ({ position, scale }: { position: [number, number, number], scale: [number, number, number] }) => (
    <group position={position} scale={scale}>
        {/* Stone Walls */}
        <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#a8a29e" roughness={0.9} />
        </mesh>
        {/* Tiled Roof */}
        <mesh position={[0, 0.6, 0]} rotation={[0, Math.PI/4, 0]}>
             <coneGeometry args={[0.8, 0.4, 4]} />
             <meshStandardMaterial color="#b45309" flatShading />
        </mesh>
    </group>
);

const Monastery = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
        {/* High white wall */}
        <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[0.4, 1.2, 0.4]} />
            <meshStandardMaterial color="white" />
        </mesh>
        {/* Top arch */}
        <mesh position={[0, 1.2, 0]} rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.1]} />
            <meshStandardMaterial color="white" />
        </mesh>
    </group>
);

const PortPiraeus = ({ data }: { data: IslandType }) => {
    return (
        <group>
            <mesh receiveShadow position={[0, 0, 0]}>
                <boxGeometry args={[3, 0.4, 3]} />
                <meshStandardMaterial color="#94a3b8" roughness={0.9} />
            </mesh>
            <mesh position={[-0.5, 0.35, -0.5]} castShadow>
                <boxGeometry args={[0.4, 0.3, 0.8]} />
                <meshStandardMaterial color="#ef4444" roughness={0.5} />
            </mesh>
            <mesh position={[-0.6, 0.35, 0.2]} castShadow>
                <boxGeometry args={[0.4, 0.3, 0.8]} />
                <meshStandardMaterial color="#1d4ed8" roughness={0.5} />
            </mesh>
            {/* Cranes */}
            <group position={[1.2, 0.2, 1.2]} rotation={[0, -Math.PI/4, 0]}>
                <mesh position={[0, 0.8, 0]}>
                    <boxGeometry args={[0.15, 1.6, 0.15]} />
                    <meshStandardMaterial color="#f97316" />
                </mesh>
                <mesh position={[-0.4, 1.5, 0]} rotation={[0, 0, 0.2]}>
                    <boxGeometry args={[1.5, 0.1, 0.1]} />
                    <meshStandardMaterial color="#f97316" />
                </mesh>
            </group>
        </group>
    )
}

const SeaBuoy = ({ data }: { data: IslandType }) => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if(ref.current) {
            ref.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
            ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
        }
    })
    return (
        <group ref={ref}>
            <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="#dc2626" />
            </mesh>
            <mesh position={[0, 1.0, 0]}>
                <sphereGeometry args={[0.3]} />
                <meshBasicMaterial color="#fef08a" />
            </mesh>
        </group>
    )
}

export const IslandComponent: React.FC<IslandProps> = ({ data, ownedByColor }) => {
  
  // Procedural Details Generation
  const details = useMemo(() => {
    if (data.type !== 'ISLAND') return { houses: [], trees: [], rocks: [], hasWindmill: false, hasChurch: false, isVolcanic: false, isStone: false, hasMonastery: false, isMilos: false, treeType: 'olive' };
    
    const houses = [];
    const trees = [];
    const rocks = [];

    const hasWindmill = data.id === 'mykonos' || data.id === 'paros' || data.id === 'ios';
    const hasChurch = data.id === 'tinos' || data.id === 'santorini';
    const isVolcanic = data.id === 'santorini';
    const isMilos = data.id === 'milos'; 
    const isStone = data.id === 'hydra'; 
    const hasMonastery = data.id === 'amorgos';
    const treeType = data.id === 'hydra' ? 'pine' : 'olive';

    let houseCount = 4 + (data.level - 1) * 3;
    if (hasWindmill) houseCount -= 1; 
    if (hasMonastery) houseCount -= 2;

    const baseRadius = isVolcanic ? 0.6 : 0.4;

    for (let i = 0; i < houseCount; i++) {
      const angle = (i / houseCount) * Math.PI * 2 + Math.random() * 0.5;
      const radius = baseRadius + Math.random() * 0.4;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      let yPos = 0.1;
      if (isVolcanic) yPos = 1.2;

      const heightBonus = data.level > 1 && i % 3 === 0 ? 0.3 : 0;
      const height = 0.3 + Math.random() * 0.3 + heightBonus;
      
      houses.push({ 
          position: [x, (height / 2) + yPos, z] as [number, number, number], 
          scale: [0.3, height, 0.3] as [number, number, number],
          isHotel: heightBonus > 0 
      });
    }

    const treeCount = isVolcanic ? 0 : (isStone ? 8 : 4);
    for (let i = 0; i < treeCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.9 + Math.random() * 0.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        trees.push([x, 0.1, z] as [number, number, number]);
    }

    for (let i = 0; i < (isVolcanic || isMilos ? 6 : 3); i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.3 + Math.random() * 0.4;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        rocks.push({ pos: [x, 0, z] as [number,number,number], scale: 0.1 + Math.random() * 0.3 });
    }

    return { houses, trees, rocks, hasWindmill, hasChurch, isVolcanic, isStone, hasMonastery, isMilos, treeType };
  }, [data.type, data.level, data.id]);

  let groundColor = "#d6d3d1"; 
  let groundHeight = 0.5;
  let groundRoughness = 1.0;

  if (details.isVolcanic) {
      groundColor = "#3f1a14"; 
      groundHeight = 2.5; 
  }
  if (details.isMilos) {
      groundColor = "#f3f4f6"; 
      groundRoughness = 0.4; 
  }
  if (details.isStone) {
      groundColor = "#78716c"; 
      groundHeight = 0.8;
  }

  return (
    <group position={data.position}>
        <Float speed={2} rotationIntensity={0} floatIntensity={0.2}>
            <Text
                position={[0, 3.5, 0]}
                fontSize={0.6}
                color="#1e293b"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.04}
                outlineColor="#ffffff"
            >
                {data.name}
            </Text>
            {data.type === 'ISLAND' && (
                <Text
                    position={[0, 3.0, 0]}
                    fontSize={0.3}
                    color={ownedByColor ? ownedByColor : "#64748b"}
                    anchorX="center"
                    anchorY="middle"
                >
                    {ownedByColor ? '★'.repeat(data.level) : `${data.price}€`}
                </Text>
            )}
        </Float>

        {data.type === 'START' && <PortPiraeus data={data} />}
        
        {data.type === 'EVENT' && <SeaBuoy data={data} />}

        {data.type === 'ISLAND' && (
            <group position={[0, -0.35, 0]}>
                {/* Terrain Base */}
                {/* Adjusted Y so it sinks slightly into water */}
                <mesh castShadow receiveShadow position={[0, (groundHeight / 2), 0]}>
                    <cylinderGeometry args={[1 + (data.level * 0.05), 1.2 + (data.level * 0.05), groundHeight, 7]} />
                    <meshStandardMaterial color={groundColor} roughness={groundRoughness} />
                </mesh>
                
                {/* Ownership Ring */}
                {ownedByColor && (
                    <mesh position={[0, 0.2, 0]} rotation={[-Math.PI/2, 0, 0]}>
                        <ringGeometry args={[1.5, 1.7, 32]} />
                        <meshBasicMaterial color={ownedByColor} />
                    </mesh>
                )}

                <group position={[0, details.isVolcanic ? groundHeight - 0.2 : 0.4, 0]}>
                    {details.houses.map((h, i) => {
                        if (details.isStone) {
                             return <StoneHouse key={i} position={h.position} scale={h.scale} />;
                        }

                        return (
                            <mesh key={i} position={h.position} scale={h.scale} castShadow>
                                <boxGeometry args={[1, 1, 1]} />
                                <meshStandardMaterial color={h.isHotel ? "#e2e8f0" : "#ffffff"} roughness={0.2} />
                                {(i % 2 === 0 || h.isHotel) && (
                                    <mesh position={[0, 0.55, 0]} scale={[0.8, 0.2, 0.8]}>
                                        <sphereGeometry args={[0.5, 16, 16]} />
                                        <meshStandardMaterial color={h.isHotel ? "#3b82f6" : (i % 3 === 0 ? "#3b82f6" : "#ffffff")} />
                                    </mesh>
                                )}
                            </mesh>
                        );
                    })}
                </group>

                {details.hasWindmill && <Windmill position={[0.6, 0.7, 0.6]} />}
                {details.hasChurch && <Church position={details.isVolcanic ? [-0.4, 1.6, 0.2] : [-0.4, 0.5, 0.2]} />}
                {details.hasMonastery && <Monastery position={[0, 0.8, -0.3]} />}

                {details.trees.map((pos, i) => (
                    <Tree key={`tree-${i}`} position={pos} type={details.treeType as 'olive'|'pine'} />
                ))}

                {details.rocks.map((rock, i) => (
                    <Rock key={`rock-${i}`} position={rock.pos} scale={rock.scale} color={details.isMilos ? '#f3f4f6' : undefined} />
                ))}

                <mesh position={[0, 0.2, 1.4]} rotation={[0, 0, 0]} receiveShadow>
                    <boxGeometry args={[0.5, 0.1, 0.8]} />
                    <meshStandardMaterial color="#57534e" />
                </mesh>
            </group>
        )}
    </group>
  );
};
