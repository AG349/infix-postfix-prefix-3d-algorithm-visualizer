'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { LightingEnvironment } from './LightingEnvironment';
import { Pedestal } from './Pedestal';
import { GlassStackContainment } from './GlassStackContainment';
import { Cube3D } from './Cube3D';

interface Scene3DProps {
  stackState: string[];
  poppedItems?: string[];
}

export function Scene3D({ stackState, poppedItems = [] }: Scene3DProps) {
  return (
    <div className="w-full h-full min-h-[480px] relative rounded-xl overflow-hidden border border-white/10 bg-zinc-950/80 shadow-crisp-card">
      <Canvas
        camera={{ position: [0, 2.5, 9.5], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={['#060608']} />

        <OrbitControls
          enablePan={false}
          minDistance={6}
          maxDistance={14}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2 - 0.05}
          rotateSpeed={0.6}
        />

        <LightingEnvironment />
        <Pedestal />
        <GlassStackContainment stackCapacity={8} />

        {stackState.map((token, index) => {
          const yPos = -1.8 + index * 0.75;
          return (
            <Cube3D
              key={`${token}-${index}`}
              id={`${token}-${index}`}
              token={token}
              targetPosition={[0, yPos, 0]}
              index={index}
            />
          );
        })}

        {poppedItems.map((token, idx) => {
          return (
            <Cube3D
              key={`popped-${token}-${idx}`}
              id={`popped-${token}-${idx}`}
              token={token}
              targetPosition={[2.5, 0.5 + idx * 0.8, 0]}
              index={idx}
              isPopping={true}
            />
          );
        })}
      </Canvas>
    </div>
  );
}
