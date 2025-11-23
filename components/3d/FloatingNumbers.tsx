
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import { FloatingText } from '../../types';
import * as THREE from 'three';

const FloatingItem: React.FC<{ item: FloatingText }> = ({ item }) => {
    const groupRef = useRef<THREE.Group>(null);
    const removeFloatingText = useGameStore(state => state.removeFloatingText);
    const DURATION = 2000; // ms

    useFrame((state) => {
        if (!groupRef.current) return;
        
        const elapsed = Date.now() - item.createdAt;
        if (elapsed > DURATION) {
            removeFloatingText(item.id);
            return;
        }

        const progress = elapsed / DURATION;
        
        // Float up
        groupRef.current.position.y = item.position[1] + 1.5 + (progress * 2);
        
        // Fade out (using scale as proxy for opacity if material doesn't support easy transparent updates in Text)
        const scale = 1 + progress * 0.5;
        groupRef.current.scale.set(scale, scale, scale);
        
        // Look at camera
        groupRef.current.lookAt(state.camera.position);
    });

    // Calculate opacity based on time
    const opacity = Math.max(0, 1 - (Date.now() - item.createdAt) / DURATION);

    return (
        <group ref={groupRef} position={item.position}>
             <Text
                fontSize={0.8}
                color={item.color}
                outlineWidth={0.05}
                outlineColor="white"
                anchorX="center"
                anchorY="middle"
                fillOpacity={opacity}
                outlineOpacity={opacity}
            >
                {item.text}
            </Text>
        </group>
    );
};

export const FloatingNumbers = () => {
    const floatingTexts = useGameStore(state => state.floatingTexts);

    return (
        <group>
            {floatingTexts.map(item => (
                <FloatingItem key={item.id} item={item} />
            ))}
        </group>
    );
};
