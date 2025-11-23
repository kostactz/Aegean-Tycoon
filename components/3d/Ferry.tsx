
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail, Billboard, Text } from '@react-three/drei';
import { Vector3, Group, QuadraticBezierCurve3 } from 'three';
import { Player, Island } from '../../types';
import { ROUTES } from '../../constants';
import { useGameStore } from '../../store/gameStore';

interface FerryProps {
  player: Player;
  islands: Island[];
}

export const Ferry: React.FC<FerryProps> = ({ player, islands }) => {
  const meshRef = useRef<Group>(null);
  const moveStartTime = useGameStore(state => state.moveStartTime);
  const turnIndex = useGameStore(state => state.turnIndex);
  const players = useGameStore(state => state.players);
  const isActivePlayer = players[turnIndex].id === player.id;
  
  // Dock Offset (Random seed based on ID)
  const dockOffset = useMemo(() => {
     let hash = 0;
     for (let i = 0; i < player.id.length; i++) {
        hash = player.id.charCodeAt(i) + ((hash << 5) - hash);
     }
     return (hash % 100) / 300; 
  }, [player.id]);

  const currentIsland = islands.find(i => i.id === player.positionId);
  const destIsland = islands.find(i => i.id === player.travelDestinationId);

  // Curve Calculation
  const movementCurve = useMemo(() => {
      if (!currentIsland || !destIsland) return null;

      const start = new Vector3(...currentIsland.position);
      const end = new Vector3(...destIsland.position);
      
      start.y = 0.05; start.z += 1.2; start.x += dockOffset;
      end.y = 0.05; end.z += 1.2; end.x += dockOffset;

      const route = ROUTES.find(r => 
          (r.from === currentIsland.id && r.to === destIsland.id) || 
          (r.from === destIsland.id && r.to === currentIsland.id)
      );

      if (!route) {
          return new QuadraticBezierCurve3(start, new Vector3().addVectors(start, end).multiplyScalar(0.5), end);
      }
      return new QuadraticBezierCurve3(start, new Vector3(...route.controlPoints[0]), end);

  }, [currentIsland, destIsland, dockOffset]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (movementCurve && player.travelDestinationId && isActivePlayer && moveStartTime) {
        // --- MOVING STATE (Synced by Time) ---
        const elapsed = Date.now() - moveStartTime;
        const progress = Math.min(elapsed / 3000, 1); // 3000ms travel time

        const point = movementCurve.getPoint(progress);
        meshRef.current.position.copy(point);

        const lookAtPoint = movementCurve.getPoint(Math.min(progress + 0.05, 1));
        meshRef.current.lookAt(lookAtPoint);
        
        // Tilt and Pitch
        const turnIntensity = (lookAtPoint.x - point.x) * 2;
        meshRef.current.rotation.z = -turnIntensity * 0.5;
        meshRef.current.rotation.x = -0.15; // Bow up

    } else if (currentIsland) {
        // --- IDLE STATE ---
        const targetPos = new Vector3(...currentIsland.position);
        targetPos.y = 0.05; 
        targetPos.z += 1.2; 
        targetPos.x += dockOffset;

        meshRef.current.position.lerp(targetPos, delta * 3);
        
        // Ambient motion
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        meshRef.current.position.y = 0.05 + Math.sin(state.clock.elapsedTime * 2 + dockOffset * 10) * 0.03;
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
        meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  const mainColor = player.avatarColor; 
  const deckColor = "#ffffff";
  const windowColor = "#1e293b";

  return (
    <group>
        <Trail 
            width={1.2} 
            length={12} 
            color="#ffffff" 
            attenuation={(t) => t * t}
            target={meshRef} 
        >
            <group ref={meshRef} position={[0,0,0]}>
                
                {/* Status Icons */}
                {player.isJailed && (
                    <Billboard position={[0, 1.2, 0]}>
                        <mesh>
                           <circleGeometry args={[0.3, 32]} />
                           <meshBasicMaterial color="white" transparent opacity={0.8} />
                        </mesh>
                        <Text 
                            position={[0, 0, 0.01]} 
                            fontSize={0.3} 
                            color="#ef4444"
                            anchorX="center" 
                            anchorY="middle"
                        >
                            {player.jailReason === 'STRIKE' ? '⚓' : '⛔'}
                        </Text>
                    </Billboard>
                )}

                {/* --- FERRY MESH --- */}
                <mesh position={[0, 0.1, 0]} castShadow>
                    <boxGeometry args={[0.3, 0.2, 0.8]} />
                    <meshStandardMaterial color={mainColor} />
                </mesh>
                <mesh position={[0, 0.1, 0.5]} rotation={[0, 0, 0]} castShadow>
                     <cylinderGeometry args={[0.05, 0.15, 0.2, 4]} />
                     <meshStandardMaterial color={mainColor} />
                </mesh>
                <mesh position={[0, 0.25, 0]} castShadow>
                    <boxGeometry args={[0.28, 0.15, 0.7]} />
                    <meshStandardMaterial color={deckColor} />
                </mesh>
                <mesh position={[0, 0.35, 0.2]} castShadow>
                    <boxGeometry args={[0.25, 0.15, 0.2]} />
                    <meshStandardMaterial color={deckColor} />
                </mesh>
                <mesh position={[0, 0.38, 0.31]}>
                    <boxGeometry args={[0.22, 0.05, 0.01]} />
                    <meshStandardMaterial color={windowColor} roughness={0.2} />
                </mesh>
                <mesh position={[0.08, 0.4, -0.2]}>
                    <cylinderGeometry args={[0.04, 0.04, 0.2]} />
                    <meshStandardMaterial color={mainColor} />
                </mesh>
                <mesh position={[-0.08, 0.4, -0.2]}>
                    <cylinderGeometry args={[0.04, 0.04, 0.2]} />
                    <meshStandardMaterial color={mainColor} />
                </mesh>
                <mesh position={[0, 0.15, -0.45]} rotation={[-Math.PI/4, 0, 0]}>
                    <boxGeometry args={[0.25, 0.02, 0.2]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
                <mesh position={[0, 0.7, 0]} rotation={[Math.PI, 0, 0]}>
                    <coneGeometry args={[0.1, 0.2, 4]} />
                    <meshBasicMaterial color={player.avatarColor} />
                </mesh>
            </group>
        </Trail>
    </group>
  );
};
