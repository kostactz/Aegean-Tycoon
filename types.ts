import React from 'react';

export type Phase = 'LOBBY' | 'ROLLING' | 'MOVING' | 'CHOOSING_PATH' | 'ACTION' | 'EVENT' | 'GAME_OVER';

export type WeatherType = 'CLEAR' | 'MELTEMI' | 'HEATWAVE';

export type FerryType = 'STANDARD' | 'SPEEDBOAT' | 'CATAMARAN' | 'CARGO';

export interface Player {
  id: string;
  name: string;
  avatarColor: string;
  positionId: string; // The ID of the island they are currently on
  travelDestinationId?: string | null; // If set, they are moving towards this island
  money: number;
  properties: string[]; // IDs of islands owned
  isJailed: boolean; // "Stuck in Kifisos" or "Strike"
  jailReason: 'TRAFFIC' | 'STRIKE' | null;
  
  // New Tycoon Mechanics
  tourists: number; // Current tourists on board
  ferryType: FerryType;
}

export interface Island {
  id: string;
  name: string;
  description: string;
  position: [number, number, number]; // x, y, z
  price: number;
  rent: number;
  level: number; // 1 = Basic, 2 = Club, 3 = Hotel, 4 = Resort
  ownerId: string | null;
  type: 'ISLAND' | 'START' | 'EVENT';
  landmarks?: string[];
  funFact?: string;
}

export interface Route {
  from: string;
  to: string;
  controlPoints: [number, number, number][]; // For curved lines
}

export interface GameEventData {
  id: string;
  title: string;
  description: string;
  type: 'BAD' | 'GOOD' | 'NEUTRAL';
  effectType: 'MONEY' | 'MOVE' | 'JAIL' | 'WEATHER';
  target: 'SELF' | 'ALL_OTHERS' | 'ALL'; // New field for social events
  value: number; // Amount of money or steps
}

export interface FloatingText {
  id: string;
  text: string;
  position: [number, number, number];
  color: string;
  createdAt: number;
}

// Global augmentation to fix R3F JSX errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      group: any;
      primitive: any;
      instancedMesh: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      spotLight: any;
      hemisphereLight: any;
      
      // Geometries
      boxGeometry: any;
      sphereGeometry: any;
      planeGeometry: any;
      cylinderGeometry: any;
      coneGeometry: any;
      circleGeometry: any;
      ringGeometry: any;
      dodecahedronGeometry: any;
      icosahedronGeometry: any;
      bufferGeometry: any;
      
      // Materials
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      shaderMaterial: any;
      
      // Attributes
      float32BufferAttribute: any;
      
      // Catch-all
      [elem: string]: any;
    }
  }
}

// Augment React's JSX namespace for newer TS/React versions
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}