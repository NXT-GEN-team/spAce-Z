import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import HeroSection from './components/HeroSection';
import SolarSystem from './components/SolarSystem';
import Modules from './components/Modules';
import About from './components/About';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Orbitron', sans-serif;
    overflow-x: hidden;
    background: #000;
    color: #fff;
  }

  html {
    scroll-behavior: smooth;
  }
`;

const AppContainer = styled.div`
  width: 100%;
  min-height: 100vh;
`;

function App() {
  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <HeroSection />
        <SolarSystem />
        <Modules />
        <About />
      </AppContainer>
    </>
  );
}

export default App;
