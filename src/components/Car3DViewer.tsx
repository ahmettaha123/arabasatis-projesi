'use client';

import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useGLTF, Sky, Stars, Html, ContactShadows, Text, Float } from '@react-three/drei';
import { Group, MathUtils, Color, Vector3 } from 'three';

interface Car3DViewerProps {
  modelUrl?: string;
  color?: string;
  className?: string;
  backgroundColor?: string;
}

const fallbackModelUrl = '/models/car_default.glb';

function CarModel({ modelUrl, color = '#3c82f6' }: { modelUrl: string, color?: string }) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(modelUrl);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Model malzemelerini renklendir
  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh && 
          (child.name.toLowerCase().includes('body') || 
           child.name.toLowerCase().includes('kaporta') || 
           child.name.toLowerCase().includes('car'))) {
        if (child.material) {
          child.material.color = new Color(color);
          child.material.metalness = 0.8;
          child.material.roughness = 0.2;
          child.material.needsUpdate = true;
        }
      }
    });
  }, [scene, color]);
  
  useFrame((state) => {
    if (group.current) {
      // Tıklandığında daha hızlı dönüş
      const targetRotationY = clicked 
        ? state.clock.getElapsedTime() * 0.5
        : hovered 
          ? Math.sin(state.clock.getElapsedTime() * 0.5) * 0.3 
          : state.clock.getElapsedTime() * 0.1;
      
      group.current.rotation.y = MathUtils.lerp(
        group.current.rotation.y,
        targetRotationY,
        0.05
      );
      
      // Yavaş bir yükselme hareketi
      group.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1 - 0.8;
      
      // Tıklandığında eğilme efekti
      if (clicked) {
        group.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 2) * 0.02;
      } else {
        group.current.rotation.z = MathUtils.lerp(group.current.rotation.z, 0, 0.05);
      }
    }
  });

  return (
    <group 
      ref={group}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => setClicked(!clicked)}
    >
      <primitive 
        object={scene} 
        scale={0.01} 
        position={[0, -0.8, 0]} 
        castShadow
        receiveShadow
      />
      
      {/* Gölge efekti */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]} receiveShadow>
        <circleGeometry args={[2, 32]} />
        <meshBasicMaterial color="black" transparent opacity={0.3} />
      </mesh>
      
      {/* Far ışıkları */}
      <pointLight position={[1.5, -0.5, -1.5]} distance={4} intensity={hovered ? 2 : 0} color="#ffffff" />
      <pointLight position={[-1.5, -0.5, -1.5]} distance={4} intensity={hovered ? 2 : 0} color="#ffffff" />
      
      {/* Vurgulama spotları */}
      <spotLight 
        position={[3, 3, 3]} 
        angle={0.3} 
        penumbra={0.8} 
        intensity={hovered ? 3 : 1} 
        color={color} 
        castShadow 
      />
      
      {/* Hover durumunda alttan aydınlatma */}
      {hovered && (
        <>
          <pointLight position={[0, -0.5, 0]} distance={2.5} intensity={2} color={color} />
          {clicked && (
            <Html position={[0, 1, 0]} center>
              <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm">
                <span className="font-medium">360° Görünüm</span>
              </div>
            </Html>
          )}
        </>
      )}
    </group>
  );
}

// Geliştirilmiş basit araç modeli
function SimpleCarModel({ color = '#3c82f6' }) {
  const group = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const wheelPositions = [
    [-1.5, -0.5, -1], // sol ön
    [1.5, -0.5, -1],  // sağ ön
    [-1.5, -0.5, 1],  // sol arka
    [1.5, -0.5, 1]    // sağ arka
  ];
  
  // Tekerlek dönüşü animasyonu için ref
  const wheelsRef = useRef<Group[]>([]);

  useFrame((state) => {
    if (group.current) {
      // Etkileşimli dönüş hareketi
      const targetRotationY = clicked
        ? state.clock.getElapsedTime() * 0.5
        : hovered 
          ? state.pointer.x * Math.PI 
          : state.clock.getElapsedTime() * 0.2;
          
      group.current.rotation.y = MathUtils.lerp(
        group.current.rotation.y,
        targetRotationY,
        0.05
      );
      
      // Yavaş yukarı-aşağı hareketi
      group.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05;
      
      // Tekerlek dönüşü
      wheelsRef.current.forEach((wheel) => {
        if (wheel) {
          wheel.rotation.x = state.clock.getElapsedTime() * 3;
        }
      });
      
      // Zıplama efekti
      if (clicked) {
        group.current.position.y = Math.abs(Math.sin(state.clock.getElapsedTime() * 4)) * 0.1;
      }
    }
  });

  return (
    <group 
      ref={group}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => setClicked(!clicked)}
    >
      {/* Araba gövdesi - daha yumuşak kenarlı */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[4, 1, 2]} radius={0.2} />
        <meshStandardMaterial 
          color={color} 
          metalness={hovered ? 0.9 : 0.6} 
          roughness={hovered ? 0.1 : 0.3}
        />
      </mesh>
      
      {/* Kabin - daha modern tasarım */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[2, 0.8, 1.8]} radius={0.3} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.8} 
          roughness={0.2} 
          envMapIntensity={hovered ? 1.5 : 1}
        />
      </mesh>
      
      {/* Cam */}
      <mesh position={[0.2, 1, 0]} castShadow rotation={[0, 0, Math.PI * 0.06]}>
        <boxGeometry args={[0.8, 0.5, 1.7]} radius={0.1} />
        <meshPhysicalMaterial 
          color="#aaccff" 
          metalness={0.1} 
          roughness={0} 
          transmission={0.9} 
          transparent
          opacity={0.5}
        />
      </mesh>
      
      {/* Ön far ışıkları */}
      <pointLight position={[1.8, 0, -0.8]} distance={4} intensity={hovered ? 1 : 0} color="#ffffff" />
      <pointLight position={[-1.8, 0, -0.8]} distance={4} intensity={hovered ? 1 : 0} color="#ffffff" />
      
      {/* Arka stop lambası */}
      <pointLight position={[0, 0, 1]} distance={2} intensity={hovered ? 1 : 0} color="#ff0000" />
      
      {/* Tekerler - daha detaylı */}
      {wheelPositions.map((position, index) => (
        <group 
          key={index} 
          position={position} 
          ref={(el) => {
            if (el) wheelsRef.current[index] = el;
          }}
        >
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
            <meshStandardMaterial color="black" />
          </mesh>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.4, 0.05, 16, 100]} />
            <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Jant kapakları */}
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.16]}>
            <circleGeometry args={[0.3, 5]} />
            <meshStandardMaterial color="#cccccc" metalness={1} roughness={0.1} />
          </mesh>
        </group>
      ))}
      
      {/* Hover durumunda neon altı ışıklandırma */}
      {hovered && (
        <>
          <pointLight position={[0, -0.8, 0]} distance={2} intensity={2} color={color} />
          {clicked && (
            <Float speed={2} floatIntensity={0.5}>
              <Text
                position={[0, 1.5, 0]}
                color="white"
                fontSize={0.2}
                maxWidth={2}
                lineHeight={1}
                textAlign="center"
                font="/fonts/Inter-Bold.woff"
              >
                360° GÖRÜNÜM
              </Text>
            </Float>
          )}
        </>
      )}
    </group>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      <p className="text-white mt-4 text-sm animate-pulse">Model yükleniyor...</p>
    </div>
  );
}

// Renk seçici bileşeni
function ColorPicker({ colors, activeColor, onChange }: { colors: string[], activeColor: string, onChange: (color: string) => void }) {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2 p-2 bg-white/10 backdrop-blur-md rounded-full">
      {colors.map((color) => (
        <button
          key={color}
          className={`w-6 h-6 rounded-full transition-transform duration-200 hover:scale-110 ${activeColor === color ? 'ring-2 ring-white scale-110' : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
          aria-label={`Renk seç: ${color}`}
        />
      ))}
    </div>
  );
}

export default function Car3DViewer({ 
  modelUrl, 
  color = '#3c82f6', 
  className = '',
  backgroundColor = 'dark'
}: Car3DViewerProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'rotate' | 'sky' | 'night'>('rotate');
  const [activeColor, setActiveColor] = useState(color);
  const [showControls, setShowControls] = useState(false);
  
  const availableColors = ['#3c82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#000000', '#ffffff'];

  const handleError = (error: any) => {
    console.error('3D model yüklenirken hata oluştu:', error);
    setHasError(true);
    setIsLoading(false);
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // En fazla 2 saniye yükleme gösterilir
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`relative w-full h-[400px] rounded-lg shadow-xl overflow-hidden glassmorphic ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {isLoading && (
        <div className="absolute inset-0 z-10 flex justify-center items-center bg-black/50">
          <LoadingSpinner />
        </div>
      )}
      
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[6, 3, 6]} />
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize-width={1024} 
            shadow-mapSize-height={1024} 
          />
          
          {/* Arka plan çevresi */}
          {viewMode === 'sky' && <Sky sunPosition={[100, 10, 100]} turbidity={0.3} />}
          {viewMode === 'night' && <Stars radius={50} depth={50} count={1000} factor={4} />}
          {viewMode !== 'night' && <Environment preset={viewMode === 'sky' ? 'sunset' : 'city'} />}
          
          {/* Gelişmiş gölgeler */}
          <ContactShadows 
            position={[0, -1.1, 0]}
            opacity={0.7}
            scale={10}
            blur={2}
            far={10}
            resolution={256}
            color="#000000"
          />
          
          {/* 3D Model */}
          {modelUrl && !hasError ? (
            <CarModel 
              modelUrl={modelUrl} 
              color={activeColor} 
            />
          ) : (
            <SimpleCarModel color={activeColor} />
          )}
          
          <OrbitControls 
            enableZoom={true} 
            enablePan={false} 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 2.2}
            autoRotate
            autoRotateSpeed={1}
            onStart={() => setIsLoading(false)}
          />
          
          {/* Yansıtıcı zemin */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]} receiveShadow>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial 
              color={viewMode === 'night' ? '#050505' : '#151515'} 
              metalness={0.9}
              roughness={0.2}
              envMapIntensity={0.8}
            />
          </mesh>
        </Suspense>
      </Canvas>
      
      {/* Renk Seçici */}
      {showControls && (
        <ColorPicker 
          colors={availableColors} 
          activeColor={activeColor} 
          onChange={setActiveColor} 
        />
      )}
      
      {/* Mod Butonları */}
      {showControls && (
        <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
          <button 
            className={`p-2 rounded-full transition-colors ${viewMode === 'rotate' ? 'bg-blue-500 text-white' : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20'}`}
            onClick={() => setViewMode('rotate')}
            aria-label="Normal Görünüm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button 
            className={`p-2 rounded-full transition-colors ${viewMode === 'sky' ? 'bg-blue-500 text-white' : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20'}`}
            onClick={() => setViewMode('sky')}
            aria-label="Gündüz Görünümü"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>
          <button 
            className={`p-2 rounded-full transition-colors ${viewMode === 'night' ? 'bg-blue-500 text-white' : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20'}`}
            onClick={() => setViewMode('night')}
            aria-label="Gece Görünümü"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Yardım İpucu */}
      {showControls && (
        <div className="absolute bottom-4 right-4 z-10 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-md text-white text-xs">
          <p>Döndürmek için sürükleyin</p>
          <p>Yakınlaştırmak için kaydırın</p>
          <p>Etkileşim için tıklayın</p>
        </div>
      )}
    </div>
  );
} 