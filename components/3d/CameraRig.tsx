
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, QuadraticBezierCurve3 } from 'three';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useGameStore } from '../../store/gameStore';
import { ISLANDS, ROUTES } from '../../constants';

export const CameraRig = () => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  
  // State to track if user is overriding the camera
  const isUserInteracting = useRef(false);

  const phase = useGameStore((state) => state.phase);
  const players = useGameStore((state) => state.players);
  const turnIndex = useGameStore((state) => state.turnIndex);
  const validNextMoves = useGameStore((state) => state.validNextMoves);
  const moveStartTime = useGameStore((state) => state.moveStartTime);
  
  // Target vectors for smooth interpolation
  const targetPos = useRef(new Vector3(20, 20, 20));
  const targetLookAt = useRef(new Vector3(0, 0, 0));

  // Reset user interaction when important game state changes
  // This ensures the camera snaps back to the action on new turns/phases
  useEffect(() => {
    isUserInteracting.current = false;
  }, [phase, turnIndex, players[turnIndex].positionId]);

  // Pre-calculate current player route if moving
  const currentPlayer = players[turnIndex];
  const currentIsland = ISLANDS.find(i => i.id === currentPlayer.positionId);
  const destIsland = ISLANDS.find(i => i.id === currentPlayer.travelDestinationId);

  const movementCurve = useMemo(() => {
    if (!currentIsland || !destIsland) return null;
    const start = new Vector3(...currentIsland.position);
    const end = new Vector3(...destIsland.position);
    start.y = 0.05; end.y = 0.05;

    const route = ROUTES.find(r => 
        (r.from === currentIsland.id && r.to === destIsland.id) || 
        (r.from === destIsland.id && r.to === currentIsland.id)
    );
    if (!route) return new QuadraticBezierCurve3(start, start.clone().add(end).multiplyScalar(0.5), end);
    return new QuadraticBezierCurve3(start, new Vector3(...route.controlPoints[0]), end);
  }, [currentIsland, destIsland]);

  useFrame((state, delta) => {
    // If user is dragging/panning, stop auto-directing
    if (isUserInteracting.current) return;

    const t = state.clock.getElapsedTime();

    // --- DIRECTOR LOGIC ---
    // Calculate where the camera *should* be based on game state

    if (phase === 'LOBBY') {
        // Slow rotation around the archipelago
        targetPos.current.set(Math.sin(t * 0.1) * 35, 25, Math.cos(t * 0.1) * 35);
        targetLookAt.current.set(0, 0, 0);
    } 
    else if (phase === 'MOVING' && moveStartTime && movementCurve) {
        // Chase Camera
        const elapsed = Date.now() - moveStartTime;
        const progress = Math.min(elapsed / 3000, 1);
        
        const boatPos = movementCurve.getPoint(progress);
        const nextBoatPos = movementCurve.getPoint(Math.min(progress + 0.1, 1));
        
        const dir = new Vector3().subVectors(nextBoatPos, boatPos).normalize();
        
        // Offset: Behind and above
        const camOffset = dir.clone().multiplyScalar(-15).add(new Vector3(0, 15, 0));
        
        targetPos.current.copy(boatPos).add(camOffset);
        targetLookAt.current.copy(boatPos).add(dir.multiplyScalar(5));
    }
    else if (phase === 'ROLLING' || phase === 'MOVING') { 
         // "God View" of the current location
         if (currentIsland) {
             const p = currentIsland.position;
             targetPos.current.set(p[0] + 12, p[1] + 25, p[2] + 12);
             targetLookAt.current.set(p[0], 0, p[2]);
         }
    }
    else if (phase === 'CHOOSING_PATH') {
        // Overhead view centered between options
        if (currentIsland) {
            const p = currentIsland.position;
            let sumX = p[0];
            let sumZ = p[2];
            let count = 1;

            validNextMoves.forEach(id => {
                const target = ISLANDS.find(i => i.id === id);
                if (target) {
                    sumX += target.position[0];
                    sumZ += target.position[2];
                    count++;
                }
            });

            const centerX = sumX / count;
            const centerZ = sumZ / count;
            
            // High up to see arrows
            targetPos.current.set(centerX, 25, centerZ + 10); 
            targetLookAt.current.set(centerX, 0, centerZ); 
        }
    }
    else if (phase === 'ACTION' || phase === 'EVENT') {
        // Close up for reading/deciding
        if (currentIsland) {
            const p = currentIsland.position;
            targetPos.current.set(p[0] + 8, p[1] + 8, p[2] + 8);
            targetLookAt.current.set(p[0], p[1] + 0.5, p[2]);
        }
    }

    // --- APPLY SMOOTH MOVEMENT ---
    const smoothSpeed = phase === 'MOVING' ? 3 : 2;
    
    // Lerp Camera Position
    camera.position.lerp(targetPos.current, delta * smoothSpeed);
    
    // Lerp Controls Target (LookAt)
    if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt.current, delta * smoothSpeed);
        controlsRef.current.update();
    }
  });

  return (
    <OrbitControls 
        ref={controlsRef}
        makeDefault
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going under water
        onStart={() => {
            isUserInteracting.current = true;
        }}
        // Note: We do NOT set isUserInteracting to false onEnd, 
        // because we want the user to stay in control until the next game event resets it.
    />
  );
};
