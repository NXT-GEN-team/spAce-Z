import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ModulesContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #000;
  padding: 4rem 2rem;
  position: relative;
`;

const ModuleCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  width: 300px;
  margin: 2rem 0;
  color: white;
  position: relative;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const DescriptionBox = styled(motion.div)`
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 10px;
  width: 300px;
  color: white;
  z-index: 2;
`;

const Modules = () => {
  const [hoveredModule, setHoveredModule] = useState(null);

  const modules = [
    {
      id: 1,
      title: 'Space Basics',
      description: 'Learn the fundamental concepts of space exploration and astronomy.',
      position: 'left'
    },
    {
      id: 2,
      title: 'Solar System',
      description: 'Explore our cosmic neighborhood and understand the planets that orbit our Sun.',
      position: 'right'
    },
    {
      id: 3,
      title: 'Space Technology',
      description: 'Discover the cutting-edge technology that powers space exploration.',
      position: 'left'
    },
    {
      id: 4,
      title: 'Future of Space',
      description: 'Look ahead to the future of space exploration and human colonization.',
      position: 'right'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <ModulesContainer>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem'
        }}
      >
        {modules.map((module) => (
          <div
            key={module.id}
            style={{
              alignSelf: module.position === 'left' ? 'flex-start' : 'flex-end',
              position: 'relative'
            }}
          >
            <ModuleCard
              variants={cardVariants}
              whileHover={{ scale: 1.05 }}
              onHoverStart={() => setHoveredModule(module)}
              onHoverEnd={() => setHoveredModule(null)}
            >
              <h2>{module.title}</h2>
            </ModuleCard>
            {hoveredModule?.id === module.id && (
              <DescriptionBox
                initial={{ opacity: 0, x: module.position === 'left' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  left: module.position === 'left' ? '100%' : 'auto',
                  right: module.position === 'right' ? '100%' : 'auto',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              >
                <p>{module.description}</p>
              </DescriptionBox>
            )}
          </div>
        ))}
      </motion.div>
    </ModulesContainer>
  );
};

export default Modules; 