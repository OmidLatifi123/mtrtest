// components/IonBeamShepherd.tsx
"use client";
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface IonBeamShepherdProps {
  asteroidPosition: THREE.Vector3;
  isActive: boolean;
  onComplete?: () => void;
  onDeflect?: (delta: THREE.Vector3) => void; // Called to apply deflection
}

const IonBeamShepherd: React.FC<IonBeamShepherdProps> = ({
  asteroidPosition,
  isActive,
  onComplete,
  onDeflect,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const spacecraftRef = useRef<THREE.Group>(null);
  const ionBeamRef = useRef<THREE.Mesh>(null);
  const plasmaParticlesRef = useRef<THREE.Points>(null);
  const thrusterRef = useRef<THREE.Points>(null);
  const ionGlowRef = useRef<THREE.Mesh>(null);
  
  const startTime = useRef<number>(0);
  const hasStarted = useRef<boolean>(false);
  const isComplete = useRef<boolean>(false);
  const approachComplete = useRef<boolean>(false);
  const lastDeflectionTime = useRef<number>(0);

  // Spacecraft positioning (stays at optimal distance for ion beam)
  const targetPosition = useMemo(() => {
    const offset = new THREE.Vector3(-8, 3, 2); // Stay at distance for effective ion beam
    return asteroidPosition.clone().add(offset);
  }, [asteroidPosition]);

  // Launch position
  const launchPosition = useMemo(() => {
    const earthPos = new THREE.Vector3(0, 0, 0);
    const direction = asteroidPosition.clone().sub(earthPos).normalize();
    return earthPos.clone().add(direction.multiplyScalar(25));
  }, [asteroidPosition]);

  // Spacecraft geometry - more angular, industrial design
  const spacecraftGeometry = useMemo(() => {
    const geometry = new THREE.BoxGeometry(2, 0.8, 1.2);
    return geometry;
  }, []);

  const spacecraftMaterial = useMemo(
    () => new THREE.MeshPhongMaterial({
      color: 0x333366,
      shininess: 80,
      emissive: 0x001133,
    }),
    []
  );

  // Ion drive geometry
  const ionDriveGeometry = useMemo(() => new THREE.CylinderGeometry(0.4, 0.6, 1.5, 8), []);
  const ionDriveMaterial = useMemo(
    () => new THREE.MeshPhongMaterial({
      color: 0x4444aa,
      shininess: 100,
      emissive: 0x002244,
    }),
    []
  );

  // Solar panels
  const solarPanelGeometry = useMemo(() => new THREE.BoxGeometry(3, 0.05, 1.5), []);
  const solarPanelMaterial = useMemo(
    () => new THREE.MeshPhongMaterial({
      color: 0x001144,
      shininess: 50,
    }),
    []
  );

  // Ion beam geometry and material
  const ionBeamMaterial = useMemo(
    () => new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0.7 },
        color: { value: new THREE.Color(0.8, 0.9, 1.0) },
        intensity: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float time;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          // Ion beam turbulence
          vec3 pos = position;
          pos.x += sin(pos.z * 15.0 + time * 12.0) * 0.1 * (1.0 - abs(pos.z) / 4.0);
          pos.y += cos(pos.z * 18.0 + time * 10.0) * 0.08 * (1.0 - abs(pos.z) / 4.0);
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float time;
        uniform float opacity;
        uniform vec3 color;
        uniform float intensity;
        
        void main() {
          // Create beam core with plasma-like appearance
          float dist = length(vUv - 0.5) * 2.0;
          float core = 1.0 - smoothstep(0.0, 0.3, dist);
          float outer = 1.0 - smoothstep(0.3, 1.0, dist);
          
          // Plasma turbulence
          float noise = sin(vPosition.z * 20.0 + time * 15.0) * 0.3 + 0.7;
          float pulse = sin(time * 8.0) * 0.2 + 0.8;
          
          float beam = core + outer * 0.3;
          beam *= noise * pulse * intensity;
          
          // Color variation for plasma effect
          vec3 plasmaColor = color;
          plasmaColor.b += sin(time * 10.0 + vPosition.z * 5.0) * 0.2;
          plasmaColor.g += cos(time * 12.0 + vPosition.z * 8.0) * 0.1;
          
          gl_FragColor = vec4(plasmaColor, beam * opacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    }),
    []
  );

  // Plasma particles for the ion beam
  const plasmaGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(300 * 3);
    const colors = new Float32Array(300 * 3);
    const velocities = new Float32Array(300 * 3);
    
    for (let i = 0; i < 300; i++) {
      // Start particles at spacecraft position
      positions[i * 3] = (Math.random() - 0.5) * 0.8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
      positions[i * 3 + 2] = Math.random() * 8; // Spread along beam length
      
      // Particle velocities
      velocities[i * 3] = (Math.random() - 0.5) * 0.1;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
      velocities[i * 3 + 2] = 0.2 + Math.random() * 0.3; // Forward velocity
      
      // Plasma colors - blue-white with variations
      const intensity = 0.5 + Math.random() * 0.5;
      colors[i * 3] = 0.7 * intensity;
      colors[i * 3 + 1] = 0.8 * intensity;
      colors[i * 3 + 2] = 1.0 * intensity;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.userData = { velocities };
    
    return geometry;
  }, []);

  const plasmaMaterial = useMemo(
    () => new THREE.PointsMaterial({
      size: 0.08,
      transparent: true,
      opacity: 0.9,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    }),
    []
  );

  // Thruster particles for spacecraft positioning
  const thrusterGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(40 * 3);
    const colors = new Float32Array(40 * 3);
    
    for (let i = 0; i < 40; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      
      const intensity = Math.random();
      colors[i * 3] = 0.2 + intensity * 0.6; // Red
      colors[i * 3 + 1] = 0.4 + intensity * 0.4; // Orange
      colors[i * 3 + 2] = 1.0; // Blue accent
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    return geometry;
  }, []);

  const thrusterMaterial = useMemo(
    () => new THREE.PointsMaterial({
      size: 0.12,
      transparent: true,
      opacity: 0.7,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    }),
    []
  );

  useFrame((state) => {
    if (!isActive) {
      hasStarted.current = false;
      isComplete.current = false;
      approachComplete.current = false;
      lastDeflectionTime.current = 0;
      return;
    }

    if (!hasStarted.current) {
      startTime.current = state.clock.elapsedTime;
      hasStarted.current = true;
    }

    const elapsed = state.clock.elapsedTime - startTime.current;
    const approachDuration = 4.0; // 4 seconds to reach optimal position
    const shepherdDuration = 12.0; // 12 seconds of continuous ion beam pushing
    const totalDuration = approachDuration + shepherdDuration;

    // Phase 1: Approach and positioning
    if (elapsed < approachDuration) {
      const approachProgress = elapsed / approachDuration;
      
      if (spacecraftRef.current) {
        // Interpolate spacecraft position
        const currentPos = new THREE.Vector3().lerpVectors(
          launchPosition,
          targetPosition,
          approachProgress
        );
        
        spacecraftRef.current.position.copy(currentPos);
        spacecraftRef.current.visible = true;
        
        // Point spacecraft toward asteroid
        spacecraftRef.current.lookAt(asteroidPosition);
        
        // Show positioning thrusters
        if (thrusterRef.current) {
          thrusterRef.current.visible = true;
          
          // Animate thruster particles
          const positions = thrusterGeometry.attributes.position.array as Float32Array;
          for (let i = 0; i < positions.length; i += 3) {
            positions[i] -= 0.08;
            positions[i + 1] += (Math.random() - 0.5) * 0.02;
            positions[i + 2] += (Math.random() - 0.5) * 0.02;
            if (positions[i] < -1.5) {
              positions[i] = 0.3;
              positions[i + 1] = (Math.random() - 0.5) * 0.3;
              positions[i + 2] = (Math.random() - 0.5) * 0.3;
            }
          }
          thrusterGeometry.attributes.position.needsUpdate = true;
        }
      }
    }
    // Phase 2: Ion beam shepherding
    else {
      if (!approachComplete.current) {
        approachComplete.current = true;
        if (thrusterRef.current) thrusterRef.current.visible = false;
      }
      
      const shepherdElapsed = elapsed - approachDuration;
      const shepherdProgress = Math.min(shepherdElapsed / shepherdDuration, 1);
      
      if (spacecraftRef.current) {
        // Maintain position relative to asteroid (accounting for deflection)
        const currentOffset = targetPosition.clone().sub(asteroidPosition);
        const adjustedPosition = asteroidPosition.clone().add(currentOffset);
        
        // Smooth position updates to maintain beam alignment
        spacecraftRef.current.position.lerp(adjustedPosition, 0.1);
        spacecraftRef.current.lookAt(asteroidPosition);
        
        // Station-keeping oscillation
        const stationKeeping = Math.sin(elapsed * 1.5) * 0.1;
        spacecraftRef.current.position.y += stationKeeping;
      }
      
      // Show ion beam
      if (ionBeamRef.current && spacecraftRef.current) {
        ionBeamRef.current.visible = true;
        
        // Position beam between spacecraft and asteroid
        const beamStart = spacecraftRef.current.position.clone();
        const beamEnd = asteroidPosition.clone();
        const beamCenter = new THREE.Vector3().addVectors(beamStart, beamEnd).multiplyScalar(0.5);
        const beamLength = beamStart.distanceTo(beamEnd);
        
        ionBeamRef.current.position.copy(beamCenter);
        ionBeamRef.current.lookAt(beamEnd);
        ionBeamRef.current.rotateX(Math.PI / 2);
        ionBeamRef.current.scale.y = beamLength / 2;
        
        // Update shader uniforms
        ionBeamMaterial.uniforms.time.value = elapsed;
        ionBeamMaterial.uniforms.intensity.value = 0.8 + shepherdProgress * 0.4;
      }
      
      // Show ion glow at spacecraft
      if (ionGlowRef.current && spacecraftRef.current) {
        ionGlowRef.current.visible = true;
        ionGlowRef.current.position.copy(spacecraftRef.current.position);
        ionGlowRef.current.position.x += 1.2; // Position at ion drive
        
        const glowScale = 1 + Math.sin(elapsed * 8) * 0.3;
        ionGlowRef.current.scale.setScalar(glowScale);
      }
      
      // Animate plasma particles
      if (plasmaParticlesRef.current && spacecraftRef.current) {
        plasmaParticlesRef.current.visible = true;
        plasmaParticlesRef.current.position.copy(spacecraftRef.current.position);
        plasmaParticlesRef.current.position.x += 1.2;
        
        const positions = plasmaGeometry.attributes.position.array as Float32Array;
        const velocities = plasmaGeometry.userData.velocities as Float32Array;
        
        for (let i = 0; i < positions.length; i += 3) {
          // Move particles along beam
          positions[i] += velocities[i];
          positions[i + 1] += velocities[i + 1];
          positions[i + 2] += velocities[i + 2];
          
          // Reset particles that have traveled too far
          if (positions[i + 2] > 8) {
            positions[i] = (Math.random() - 0.5) * 0.8;
            positions[i + 1] = (Math.random() - 0.5) * 0.8;
            positions[i + 2] = 0;
          }
          
          // Add some turbulence
          positions[i] += (Math.random() - 0.5) * 0.02;
          positions[i + 1] += (Math.random() - 0.5) * 0.02;
        }
        plasmaGeometry.attributes.position.needsUpdate = true;
        
        // Point particles toward asteroid
        const direction = asteroidPosition.clone().sub(spacecraftRef.current.position).normalize();
        plasmaParticlesRef.current.lookAt(asteroidPosition);
      }
      
      // Apply continuous deflection to asteroid (stronger than gravity tractor)
      if (elapsed - lastDeflectionTime.current > 0.05) { // Every 50ms for continuous push
        const deflectionStrength = 0.08 * (1 + shepherdProgress * 0.5); // Stronger, continuous force
        
        // Calculate deflection direction (away from spacecraft)
        const deflectionDirection = asteroidPosition.clone()
          .sub(spacecraftRef.current?.position || new THREE.Vector3())
          .normalize();
        
        const deflection = deflectionDirection.multiplyScalar(deflectionStrength);
        onDeflect?.(deflection);
        lastDeflectionTime.current = elapsed;
      }
    }

    // Complete the effect
    if (elapsed > totalDuration && !isComplete.current) {
      isComplete.current = true;
      onComplete?.();
    }
  });

  if (!isActive) return null;

  return (
    <group ref={groupRef}>
      {/* Ion Beam Shepherd Spacecraft */}
      <group ref={spacecraftRef}>
        {/* Main hull */}
        <mesh geometry={spacecraftGeometry} material={spacecraftMaterial} />
        
        {/* Ion drive */}
        <mesh position={[1.2, 0, 0]} geometry={ionDriveGeometry} material={ionDriveMaterial} rotation={[0, 0, Math.PI / 2]} />
        
        {/* Solar arrays */}
        <mesh position={[0, 1.5, 0]} geometry={solarPanelGeometry} material={solarPanelMaterial} />
        <mesh position={[0, -1.5, 0]} geometry={solarPanelGeometry} material={solarPanelMaterial} />
        
        {/* Communication array */}
        <mesh position={[-0.8, 0, 0.8]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
          <meshPhongMaterial color={0xaaaaaa} />
        </mesh>
        
        {/* Reaction control thrusters */}
        <mesh position={[-1, 0.5, 0]}>
          <boxGeometry args={[0.3, 0.2, 0.2]} />
          <meshPhongMaterial color={0x666688} />
        </mesh>
        <mesh position={[-1, -0.5, 0]}>
          <boxGeometry args={[0.3, 0.2, 0.2]} />
          <meshPhongMaterial color={0x666688} />
        </mesh>
        
        {/* Ion drive glow */}
        <mesh ref={ionGlowRef} visible={false}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial color={0x88bbff} transparent opacity={0.4} />
        </mesh>
        
        {/* Positioning thruster particles */}
        <points ref={thrusterRef} geometry={thrusterGeometry} material={thrusterMaterial} position={[-1.8, 0, 0]} />
        
        {/* Ion beam plasma particles */}
        <points ref={plasmaParticlesRef} geometry={plasmaGeometry} material={plasmaMaterial} visible={false} />
      </group>
      
      {/* Ion beam */}
      <mesh ref={ionBeamRef} material={ionBeamMaterial} visible={false}>
        <cylinderGeometry args={[0.2, 0.4, 2, 16]} />
      </mesh>
    </group>
  );
};

export default IonBeamShepherd;