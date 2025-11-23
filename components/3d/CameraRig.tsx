
import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, QuadraticBezierCurve3 } from 'three';
import { useGameStore } from '../../store/gameStore';
import { ISLANDS, ROUTES } from '../../constants';

export const CameraRig = () => {
  const { camera } = useThree();
  const phase = useGameStore((state) => state.phase);
  const players = useGameStore((state) => state.players);
  const turnIndex = useGameStore((state) => state.turnIndex);
  const validNextMoves = useGameStore((state) => state.validNextMoves);
  const moveStartTime = useGameStore((state) => state.moveStartTime);
  
  // Refs to store smooth transition targets
  const targetPos = useRef(new Vector3(20, 20, 20));
  const targetLookAt = useRef(new Vector3(0, 0, 0));

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
    const t = state.clock.getElapsedTime();

    // --- STATE MACHINE FOR CAMERA TARGETS ---
    
    if (phase === 'LOBBY') {
        // Radius adjusted to see the full map structure
        targetPos.current.set(Math.sin(t * 0.1) * 35, 25, Math.cos(t * 0.1) * 35);
        targetLookAt.current.set(0, 0, 0);
    } 
    else if (phase === 'MOVING' && moveStartTime && movementCurve) {
        // --- CINEMATIC TRACKING MODE ---
        const elapsed = Date.now() - moveStartTime;
        const progress = Math.min(elapsed / 3000, 1);
        
        const boatPos = movementCurve.getPoint(progress);
        const nextBoatPos = movementCurve.getPoint(Math.min(progress + 0.1, 1));
        
        const dir = new Vector3().subVectors(nextBoatPos, boatPos).normalize();
        
        // High trailing camera to see destination
        const camOffset = dir.clone().multiplyScalar(-15).add(new Vector3(0, 15, 0));
        
        targetPos.current.copy(boatPos).add(camOffset);
        targetLookAt.current.copy(boatPos).add(dir.multiplyScalar(5));
    }
    else if (phase === 'ROLLING' || phase === 'MOVING') { 
         if (currentIsland) {
             const p = currentIsland.position;
             // High "God View" to see neighbors clearly
             targetPos.current.set(p[0] + 12, p[1] + 25, p[2] + 12);
             targetLookAt.current.set(p[0], 0, p[2]);
         }
    }
    else if (phase === 'CHOOSING_PATH') {
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
            
            // Very high up to see arrows
            const height = 25; 
            
            targetPos.current.set(centerX, height, centerZ + 10); 
            targetLookAt.current.set(centerX, 0, centerZ); 
        }
    }
    else if (phase === 'ACTION' || phase === 'EVENT') {
        if (currentIsland) {
            const p = currentIsland.position;
            // Closer view for interaction
            targetPos.current.set(p[0] + 5, p[1] + 6, p[2] + 5);
            targetLookAt.current.set(p[0], p[1] + 0.5, p[2]);
        }
    }

    // --- SMOOTH INTERPOLATION (LERP) ---
    const smoothSpeed = phase === 'MOVING' ? 3 : 2;
    
    camera.position.lerp(targetPos.current, delta * smoothSpeed);
    
    const currentLookAt = new Vector3();
    camera.getWorldDirection(currentLookAt).multiplyScalar(5).add(camera.position); 
    
    currentLookAt.lerp(targetLookAt.current, delta * smoothSpeed);
    camera.lookAt(currentLookAt);
  });

  return null;
};
