import React, { useState } from 'react';
import styled from 'styled-components';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

const SolarSystemContainer = styled.div`
  height: 100vh;
  width: 100%;
  position: relative;
  background: #000;
`;

const PlanetInfo = styled(motion.div)`
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 8px;
  color: white;
  pointer-events: none;
  z-index: 10;
`;

const Planet = ({ position, color, name, description, onHover, onLeave }) => {
  return (
    <mesh
      position={position}
      onPointerOver={onHover}
      onPointerOut={onLeave}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const SolarSystem = () => {
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const planets = [
    {
      name: 'Mercury',
      color: '#A9A9A9',
      position: [5, 0, 0],
      description: 'The smallest and innermost planet in the Solar System.'
    },
    {
      name: 'Venus',
      color: '#E6E6FA',
      position: [8, 0, 0],
      description: 'The second planet from the Sun, known for its thick atmosphere.'
    },
    {
      name: 'Earth',
      color: '#4169E1',
      position: [11, 0, 0],
      description: 'Our home planet, the only known planet to harbor life.'
    },
    {
      name: 'Mars',
      color: '#CD5C5C',
      position: [14, 0, 0],
      description: 'The Red Planet, known for its iron oxide surface.'
    },
    {
      name: 'Jupiter',
      color: '#DEB887',
      position: [17, 0, 0],
      description: 'The largest planet in our Solar System.'
    }
  ];

  const handleMouseMove = (e) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY
    });
  };

  return (
    <SolarSystemContainer onMouseMove={handleMouseMove}>
      <Canvas camera={{ position: [0, 0, 30], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={1} />
        <OrbitControls enableZoom={false} />
        
        {planets.map((planet, index) => (
          <Planet
            key={planet.name}
            position={planet.position}
            color={planet.color}
            name={planet.name}
            description={planet.description}
            onHover={() => setHoveredPlanet(planet)}
            onLeave={() => setHoveredPlanet(null)}
          />
        ))}
      </Canvas>

      <AnimatePresence>
        {hoveredPlanet && (
          <PlanetInfo
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: mousePosition.x + 20,
              y: mousePosition.y - 20
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <h3>{hoveredPlanet.name}</h3>
            <p>{hoveredPlanet.description}</p>
          </PlanetInfo>
        )}
      </AnimatePresence>
    </SolarSystemContainer>
  );
};

export default SolarSystem; 