import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

export default (function () {
  if (!ExecutionEnvironment.canUseDOM) {
    return null;
  }

  // Inject scanline CSS dynamically to prevent purging
  const injectScanlineCSS = () => {
    const styleId = 'homepage-scanline-style';
    if (document.getElementById(styleId)) {
      return; // Already injected
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      body[data-homepage="true"]::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: rgba(0, 240, 255, 0.1);
        animation: scanline 8s linear infinite;
        pointer-events: none;
        z-index: 9999;
      }

      @keyframes scanline {
        0% {
          transform: translateY(-100%);
        }
        100% {
          transform: translateY(100vh);
        }
      }
    `;
    document.head.appendChild(style);
    console.log('[Homepage Class] Scanline CSS injected');
  };

  // Add homepage data attribute to body when .homepage wrapper exists
  const addHomepageClass = () => {
    const homepageWrapper = document.querySelector('.homepage');
    console.log('[Homepage Class] Wrapper found:', !!homepageWrapper);
    if (homepageWrapper) {
      document.body.setAttribute('data-homepage', 'true');
      console.log('[Homepage Class] Added data-homepage to body');
    } else {
      document.body.removeAttribute('data-homepage');
      console.log('[Homepage Class] Removed data-homepage from body');
    }
  };

  console.log('[Homepage Class] Client module loaded');

  // Inject CSS first
  injectScanlineCSS();

  // Run on initial load
  addHomepageClass();

  // Re-run on route changes (Docusaurus is SPA)
  return {
    onRouteDidUpdate() {
      addHomepageClass();

      // Reinitialize animations if window.initAll exists (from main.js)
      if (typeof (window as any).initAll === 'function') {
        console.log('[Homepage Class] Reinitializing animations on route change');
        (window as any).initAll();
      }
    },
  };
})();
