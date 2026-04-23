import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Sparkles, MeshDistortMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

function AbstractShape({ position, scale = 1, speed = 1, color, geometry = 'torus' }) {
  const meshRef = useRef();
  const initialRotation = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001 * speed;
      meshRef.current.rotation.y += 0.002 * speed;
    }
  });

  const geometryMap = {
    torus: <torusGeometry args={[1, 0.4, 32, 64]} />,
    icosahedron: <icosahedronGeometry args={[1.2, 0]} />,
    octahedron: <octahedronGeometry args={[1, 0]} />,
    dodecahedron: <dodecahedronGeometry args={[1, 0]} />,
    torusKnot: <torusKnotGeometry args={[0.8, 0.25, 128, 32]} />,
    sphere: <sphereGeometry args={[1, 64, 64]} />,
    box: <boxGeometry args={[1.5, 1.5, 1.5]} />,
    cone: <coneGeometry args={[1, 2, 64]} />,
  };

  return (
    <Float speed={speed * 1.5} rotationIntensity={0.8} floatIntensity={1.2}>
      <mesh ref={meshRef} position={position} scale={scale} rotation={[initialRotation, initialRotation, 0]}>
        {geometryMap[geometry] || geometryMap.torus}
        <MeshTransmissionMaterial
          backside
          samples={12}
          thickness={0.6}
          chromaticAberration={0.2}
          anisotropy={0.4}
          distortion={0.3}
          distortionScale={0.4}
          temporalDistortion={0.3}
          iridescence={1}
          iridescenceIOR={1.4}
          iridescenceThicknessRange={[0, 1400]}
          color={color}
          transmission={0.92}
          roughness={0.08}
        />
      </mesh>
    </Float>
  );
}

function AnimatedSphere({ position, scale = 1, color = '#5b7cff' }) {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x += 0.001;
    }
    if (materialRef.current) {
      materialRef.current.distort = 0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          ref={materialRef}
          color={color}
          transmission={0.9}
          roughness={0.1}
          distort={0.3}
          speed={2}
          thickness={0.5}
        />
      </mesh>
    </Float>
  );
}

function GlowingOrb({ position, scale = 1, color = '#5b7cff' }) {
  const ref = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.003;
    }
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
      glowRef.current.scale.setScalar(scale * pulse);
    }
  });

  return (
    <group position={position}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh ref={ref} scale={scale * 0.6}>
          <sphereGeometry args={[1, 64, 64]} />
          <MeshTransmissionMaterial
            backside
            samples={8}
            thickness={0.4}
            color={color}
            transmission={0.9}
            roughness={0.1}
            ior={1.5}
          />
        </mesh>
      </Float>
    </group>
  );
}

function ParticleField({ count = 200 }) {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
      
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i * 3] = 0.36; colors[i * 3 + 1] = 0.48; colors[i * 3 + 2] = 1;
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 0.22; colors[i * 3 + 1] = 0.78; colors[i * 3 + 2] = 1;
      } else {
        colors[i * 3] = 0.44; colors[i * 3 + 1] = 0.97; colors[i * 3 + 2] = 0.82;
      }
    }
    return positions;
  }, [count]);

  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.0002;
      ref.current.rotation.x += 0.0001;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        transparent
        opacity={0.7}
        sizeAttenuation
        vertexColors
      />
    </points>
  );
}

function Ring({ position, scale = 1, color = '#5b7cff' }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x += 0.005;
      ref.current.rotation.y += 0.003;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh ref={ref} position={position} scale={scale}>
        <torusGeometry args={[1, 0.08, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
    </Float>
  );
}

function TwistedRibbon({ position, scale = 1, color = '#8ea2ff' }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z += 0.002;
    }
  });

  const curve = useMemo(() => {
    return new THREE.TorusKnotGeometry(0.8, 0.15, 128, 16);
  }, []);

  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={ref} position={position} scale={scale} geometry={curve}>
        <MeshTransmissionMaterial
          backside
          samples={8}
          thickness={0.3}
          chromaticAberration={0.1}
          color={color}
          transmission={0.85}
          roughness={0.1}
        />
      </mesh>
    </Float>
  );
}

function MorphingBlob({ position, scale = 1, color = '#5b7cff' }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001;
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          speed={3}
          distort={0.6}
          transmission={0.9}
          roughness={0.1}
          thickness={0.5}
        />
      </mesh>
    </Float>
  );
}

export default function FloatingShapes() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  const bgColor = isLight ? '#f5f7ff' : '#07111f';
  const fogColor = isLight ? '#f5f7ff' : '#07111f';
  
  const lightColors = {
    indigo: '#5b7cff',
    cyan: '#0ea5e9',
    mint: '#059669',
    peach: '#ea580c',
    violet: '#7c3aed',
    pink: '#ec4899',
  };
  
  const darkColors = {
    indigo: '#5b7cff',
    cyan: '#39c6ff',
    mint: '#6ff7d2',
    peach: '#ffbb8b',
    violet: '#a78bfa',
    pink: '#f472b6',
  };
  
  const colors = isLight ? lightColors : darkColors;
  const sparklesColor = isLight ? '#5b7cff' : '#8ea2ff';

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" args={[fogColor, 8, 25]} />
      
      <ambientLight intensity={isLight ? 0.6 : 0.4} />
      <directionalLight position={[10, 10, 5]} intensity={isLight ? 1.2 : 1} color={isLight ? '#1a1a2e' : '#ffffff'} />
      <pointLight position={[-8, 5, 5]} intensity={isLight ? 0.8 : 1} color={colors.indigo} />
      <pointLight position={[8, -5, 5]} intensity={isLight ? 0.6 : 0.8} color={colors.cyan} />
      <pointLight position={[0, 8, 5]} intensity={isLight ? 0.5 : 0.6} color={colors.mint} />
      <pointLight position={[0, -8, 5]} intensity={isLight ? 0.4 : 0.5} color={colors.peach} />
      <pointLight position={[-5, -5, 3]} intensity={isLight ? 0.3 : 0.5} color={colors.pink} />

      <Sparkles 
        count={200} 
        scale={25} 
        size={2.5} 
        speed={0.4} 
        opacity={isLight ? 0.4 : 0.6}
        color={sparklesColor}
      />

      <AbstractShape
        position={[-4, 2.5, -5]}
        scale={0.9}
        speed={0.7}
        color={colors.indigo}
        geometry="torusKnot"
      />
      <AbstractShape
        position={[4, -1.5, -4]}
        scale={0.7}
        speed={1.1}
        color={colors.cyan}
        geometry="icosahedron"
      />
      <AbstractShape
        position={[-2.5, -2.5, -6]}
        scale={0.5}
        speed={0.9}
        color={colors.mint}
        geometry="octahedron"
      />
      <AbstractShape
        position={[2.5, 3, -5]}
        scale={0.4}
        speed={1.3}
        color={colors.peach}
        geometry="dodecahedron"
      />
      <AbstractShape
        position={[-3.5, 0, -4]}
        scale={0.35}
        speed={1}
        color={colors.violet}
        geometry="cone"
      />

      <AnimatedSphere
        position={[3.5, -2, -5]}
        scale={0.5}
        color={colors.pink}
      />
      <AnimatedSphere
        position={[-3, -1.5, -4]}
        scale={0.35}
        color={colors.violet}
      />

      <MorphingBlob
        position={[0, 2.5, -6]}
        scale={0.45}
        color={colors.cyan}
      />

      <GlowingOrb position={[3, 2, -5]} scale={0.5} color={colors.indigo} />
      <GlowingOrb position={[-2, 2.5, -4]} scale={0.35} color={colors.cyan} />
      <GlowingOrb position={[0, -3, -5]} scale={0.4} color={colors.mint} />
      <GlowingOrb position={[-3, -2, -5]} scale={0.3} color={colors.pink} />

      <Ring position={[-1, 1, -6]} scale={0.8} color={sparklesColor} />
      <Ring position={[2, -2.5, -5]} scale={0.5} color={colors.cyan} />
      <Ring position={[1.5, 2, -6]} scale={0.3} color={colors.pink} />

      <TwistedRibbon position={[0, 0, -7]} scale={0.6} color={colors.mint} />

      <ParticleField count={300} />
    </Canvas>
  );
}