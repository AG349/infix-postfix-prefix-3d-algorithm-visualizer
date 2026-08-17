'use client';

import React from 'react';

export function Pedestal() {
  return (
    <group position={[0, -2.5, 0]}>
      {/* Base Heavy Metallic Disk */}
      <mesh receiveShadow position={[0, -0.2, 0]}>
        <cylinderGeometry args={[2.8, 3.2, 0.4, 64]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.92}
          roughness={0.18}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Raised Pedestal Core */}
      <mesh receiveShadow castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[2.2, 2.6, 0.4, 64]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.88}
          roughness={0.25}
        />
      </mesh>

      {/* Glowing Neon Accent Outer Ring */}
      <mesh position={[0, 0.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.0, 2.15, 64]} />
        <meshBasicMaterial color="#00f3ff" side={2} />
      </mesh>

      {/* Glowing Neon Inner Stack Seat */}
      <mesh position={[0, 0.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.3, 64]} />
        <meshBasicMaterial color="#a855f7" side={2} />
      </mesh>

      {/* Center Metallic Mounting Platform */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[1.1, 1.15, 0.1, 64]} />
        <meshStandardMaterial
          color="#090d16"
          metalness={0.95}
          roughness={0.12}
        />
      </mesh>
    </group>
  );
}
