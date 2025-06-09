import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const AboutContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #fff;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ContentWrapper = styled(motion.div)`
  max-width: 800px;
  text-align: center;
`;

const Title = styled(motion.h2)`
  font-size: 3rem;
  color: #000;
  margin-bottom: 2rem;
  font-family: 'Orbitron', sans-serif;
`;

const Description = styled(motion.p)`
  font-size: 1.2rem;
  line-height: 1.8;
  color: #333;
  margin-bottom: 2rem;
`;

const About = () => {
  return (
    <AboutContainer>
      <ContentWrapper
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Title>About Us</Title>
        <Description>
          At spAce-Z, we're passionate about making space exploration accessible to everyone. 
          Our team of dedicated educators, scientists, and space enthusiasts work together to 
          create engaging and informative content that brings the wonders of the cosmos to life.
        </Description>
        <Description>
          Our mission is to inspire the next generation of space explorers and scientists by 
          providing high-quality educational resources and interactive experiences that make 
          learning about space both fun and meaningful.
        </Description>
      </ContentWrapper>
    </AboutContainer>
  );
};

export default About; 