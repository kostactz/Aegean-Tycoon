
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Ship = ({ startPos, speed, scale, type }: { startPos: [number,number,number], speed: number, scale: number, type: 'tanker'|'cruise' }) => {
    const meshRef = useRef<THREE.Group>(null);
    const limit = 80;

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        meshRef.current.position.x += speed * delta;
        
        // Loop around world
        if (meshRef.current.position.x > limit) {
            meshRef.current.position.x = -limit;
        }
    });

    return (
        <group ref={meshRef} position={startPos} scale={scale}>
            {/* Hull */}
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[4, 1, 1]} />
                <meshStandardMaterial color={type === 'tanker' ? '#7f1d1d' : '#f8fafc'} />
            </mesh>
            {/* Bridge */}
            <mesh position={[-1, 1.2, 0]}>
                <boxGeometry args={[1, 1, 0.8]} />
                <meshStandardMaterial color="white" />
            </mesh>
            {/* Details */}
            {type === 'tanker' ? (
                <mesh position={[1, 1, 0]} rotation={[0, 0, Math.PI / 2]}>
                     <cylinderGeometry args={[0.3, 0.3, 2]} />
                     <meshStandardMaterial color="#b91c1c" />
                </mesh>
            ) : (
                <mesh position={[0.5, 1.1, 0]}>
                     <boxGeometry args={[2, 0.5, 0.7]} />
                     <meshStandardMaterial color="#38bdf8" />
                </mesh>
            )}
            {/* Smoke/Wake Trail (Simple) */}
            <mesh position={[-2.5, 0.1, 0]}>
                <planeGeometry args={[4, 0.5]} />
                <meshBasicMaterial color="white" transparent opacity={0.2} side={THREE.DoubleSide} />
            </mesh>
        </group>
    )
}

export const BackgroundShips = () => {
    return (
        <group>
            <Ship startPos={[-60, -0.2, -40]} speed={0.8} scale={1.5} type="tanker" />
            <Ship startPos={[-40, -0.2, 50]} speed={1.2} scale={2.0} type="cruise" />
            <Ship startPos={[20, -0.2, -60]} speed={0.5} scale={1.0} type="tanker" />
        </group>
    )
}
