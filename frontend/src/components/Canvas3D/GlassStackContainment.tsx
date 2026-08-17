'use client';

import React from 'react';
import { Html } from '@react-three/drei';

interface GlassStackContainmentProps {
  stackCapacity?: number;
}

export function GlassStackContainment({ stackCapacity = 8 }: GlassStackContainmentProps) {
  const cylinderHeight = 6.2;
  const cylinderRadius = 1.35;

  return (
    <group position={[0, 0.6, 0]}>
      {/* Outer Glass Containment Cylinder */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[cylinderRadius, cylinderRadius, cylinderHeight, 48, 1, true]} />
        <meshPhysicalMaterial
          color="#00f3ff"
          transmission={0.94}
          opacity={1}
          transparent={true}
          roughness={0.08}
          ior={1.48}
          thickness={0.6}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          side={2}
          reflectivity={0.9}
        />
      </mesh>

      {/* Top Metallic Collar */}
      <mesh position={[0, cylinderHeight / 2 + 0.1, 0]}>
        <cylinderGeometry args={[cylinderRadius + 0.1, cylinderRadius + 0.1, 0.2, 48]} />
        <meshStandardMaterial color="#18181b" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Top Metallic Ring */}
      <mesh position={[0, cylinderHeight / 2 + 0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[cylinderRadius - 0.05, cylinderRadius + 0.08, 48]} />
        <meshBasicMaterial color="#00f3ff" side={2} />
      </mesh>

      {/* Bottom Metallic Collar */}
      <mesh position={[0, -cylinderHeight / 2 - 0.1, 0]}>
        <cylinderGeometry args={[cylinderRadius + 0.1, cylinderRadius + 0.1, 0.2, 48]} />
        <meshStandardMaterial color="#18181b" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Bottom Ring */}
      <mesh position={[0, -cylinderHeight / 2 - 0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[cylinderRadius - 0.05, cylinderRadius + 0.08, 48]} />
        <meshBasicMaterial color="#a855f7" side={2} />
      </mesh>

      {/* Vertical Guide Rails */}
      {[-Math.PI / 4, Math.PI / 4, (3 * Math.PI) / 4, (-3 * Math.PI) / 4].map((angle, i) => {
        const x = Math.cos(angle) * (cylinderRadius + 0.05);
        const z = Math.sin(angle) * (cylinderRadius + 0.05);
        return (
          <mesh key={i} position={[x, 0, z]}>
            <cylinderGeometry args={[0.03, 0.03, cylinderHeight + 0.4, 16]} />
            <meshStandardMaterial color="#27272a" metalness={0.9} roughness={0.2} />
          </mesh>
        );
      })}

      {/* Clean Stack Top Badge */}
      <Html position={[0, cylinderHeight / 2 + 0.6, 0]} center distanceFactor={10}>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-950/90 border border-white/10 text-zinc-400 font-mono text-[10px] uppercase tracking-[0.15em] whitespace-nowrap backdrop-blur-md select-none pointer-events-none shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>STACK TOP</span>
        </div>
      </Html>
    </group>
  );
}
