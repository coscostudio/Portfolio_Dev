export const globalStyles = `
.barba-container {
    position: relative;
    overflow-x: hidden;
  }
  .barba-container.is-entering,
  .barba-container.is-leaving {
    transform: translateX(100%);
  }
  .barba-container.is-entering.from-left {
    transform: translateX(-100%);
  }
  .navbar-global {
    position: fixed !important;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%) !important;
    z-index: 1000;
  }
    

  @media screen and (max-width: 479px) {
    .navbar-global {
      transform: translateX(-50%) !important;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    
    .navbar-container {
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
    }
  }
    
`;
