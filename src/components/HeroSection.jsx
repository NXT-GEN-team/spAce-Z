import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HeroContainer = styled.div`
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  background: #000;
`;

const TitleContainer = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 2;
  color: white;
`;

const Title = styled(motion.h1)`
  font-size: 5rem;
  margin: 0;
  background: linear-gradient(45deg, #00f2fe, #4facfe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'Orbitron', sans-serif;
`;

const Quote = styled(motion.p)`
  font-size: 1.5rem;
  margin-top: 1rem;
  color: #fff;
  opacity: 0.8;
`;

const HeroSection = () => {
  const titleRef = useRef(null);
  const quoteRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });

    tl.to([titleRef.current, quoteRef.current], {
      x: '-100vw',
      opacity: 0,
      duration: 1,
    });
  }, []);

  return (
    <HeroContainer className="hero-section">
      <Canvas>
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
      <TitleContainer>
        <Title
          ref={titleRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          spAce-Z
        </Title>
        <Quote
          ref={quoteRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Exploring the Cosmos, One Module at a Time
        </Quote>
      </TitleContainer>
    </HeroContainer>
  );
};

export default HeroSection; 