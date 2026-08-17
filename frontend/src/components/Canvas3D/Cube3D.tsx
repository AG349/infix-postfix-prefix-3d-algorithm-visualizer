'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export interface Cube3DProps {
  id: string;
  token: string;
  targetPosition: [number, number, number];
  index: number;
  isPopping?: boolean;
  isCombining?: boolean;
}

export function Cube3D({
  token,
  targetPosition,
  index,
  isPopping = false,
  isCombining = false,
}: Cube3DProps) {
  const meshRef = useRef<THREE.Group>(null);
  const currentPos = useRef<THREE.Vector3>(
    new THREE.Vector3(targetPosition[0], targetPosition[1] + 8, targetPosition[2])
  );

  const isOperator = ['+', '-', '*', '/', '^', '(', ')'].includes(token);
  const isCombined = token.startsWith('(') || token.includes(' ');

  let mainColor = '#00f3ff';
  let emissiveColor = '#002830';
  let badgeBorder = 'border-cyan-500/40 text-cyan-300 bg-zinc-950/90 border';

  if (isCombined) {
    mainColor = '#f59e0b';
    emissiveColor = '#3b2500';
    badgeBorder = 'border-amber-500/40 text-amber-300 bg-zinc-950/90 border';
  } else if (isOperator) {
    mainColor = '#a855f7';
    emissiveColor = '#27003e';
    badgeBorder = 'border-purple-500/40 text-purple-300 bg-zinc-950/90 border';
  }

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const targetVec = new THREE.Vector3(...targetPosition);
    if (isPopping) {
      targetVec.x += 4.5;
      targetVec.y += 2.0;
    }

    const speed = isPopping ? 8 : 12;
    currentPos.current.lerp(targetVec, Math.min(1, delta * speed));
    meshRef.current.position.copy(currentPos.current);

    meshRef.current.rotation.y = Math.sin(Date.now() * 0.002 + index) * 0.08;
  });

  return (
    <group ref={meshRef} position={currentPos.current}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.65, 1.5]} />
        <meshPhysicalMaterial
          color={mainColor}
          emissive={emissiveColor}
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.85}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          transparent={true}
          opacity={isPopping ? 0.3 : 0.95}
        />
      </mesh>

      <mesh scale={[0.85, 0.7, 0.85]}>
        <boxGeometry args={[1.5, 0.65, 1.5]} />
        <meshBasicMaterial color={mainColor} transparent opacity={0.3} />
      </mesh>

      <Html position={[0, 0, 0.82]} center distanceFactor={8}>
        <div
          className={`flex items-center justify-center px-2.5 py-1 rounded font-mono font-semibold text-xs tracking-wider whitespace-nowrap backdrop-blur-md transition-all ${badgeBorder}`}
        >
          {token}
        </div>
      </Html>
    </group>
  );
}
