'use client';

import React from 'react';
import { ContactShadows } from '@react-three/drei';

export function LightingEnvironment() {
  return (
    <>
      {/* Soft Ambient Fill Light */}
      <ambientLight intensity={0.6} color="#0f172a" />

      {/* Primary Key Directional Light with Shadows */}
      <directionalLight
        position={[8, 12, 6]}
        intensity={2.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={25}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={8}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0001}
      />

      {/* Cyan Fill Light from Left-Front */}
      <pointLight position={[-6, 4, 4]} intensity={2.5} color="#00f3ff" distance={15} />

      {/* Purple Rim Accent Light from Right-Back */}
      <pointLight position={[6, 8, -6]} intensity={3.5} color="#a855f7" distance={20} />

      {/* Bottom Glowing Accent Light */}
      <pointLight position={[0, -1.8, 0]} intensity={2.0} color="#ec4899" distance={8} />

      {/* Ground Contact Shadows */}
      <ContactShadows
        position={[0, -2.5, 0]}
        opacity={0.7}
        scale={12}
        blur={2}
        far={4.5}
        color="#000000"
      />
    </>
  );
}
