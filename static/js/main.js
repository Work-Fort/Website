/**
 * WorkFort - Main JavaScript
 * Tron Legacy + Cyberpunk Terminal Effects
 */

// ============================================
// TERMINAL TYPING ANIMATION
// ============================================

class TerminalTyper {
  constructor(element, options = {}) {
    this.element = element;
    this.lines = options.lines || [];
    this.typingSpeed = options.typingSpeed || 50;
    this.lineDelay = options.lineDelay || 800;
    this.currentLine = 0;
    this.currentChar = 0;
    this.isTyping = false;
  }

  async start() {
    if (this.isTyping) return;
    this.isTyping = true;
    this.element.innerHTML = '';
    
    for (let i = 0; i < this.lines.length; i++) {
      await this.typeLine(this.lines[i]);
      await this.delay(this.lineDelay);
    }
    
    this.isTyping = false;
  }

  async typeLine(lineData) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    
    if (lineData.type === 'command') {
      const prompt = document.createElement('span');
      prompt.className = 'terminal-prompt';
      prompt.textContent = '$';
      line.appendChild(prompt);
      
      const command = document.createElement('span');
      command.className = 'terminal-command';
      line.appendChild(command);
      
      this.element.appendChild(line);
      
      // Type the command
      for (let char of lineData.text) {
        command.textContent += char;
        await this.delay(this.typingSpeed);
      }
    } else if (lineData.type === 'output') {
      const output = document.createElement('div');
      output.className = 'terminal-output';
      
      if (lineData.isSuccess) {
        output.classList.add('terminal-success');
      }
      
      output.textContent = lineData.text;
      this.element.appendChild(output);
      await this.delay(100);
    }
    
    // Scroll to bottom
    this.element.scrollTop = this.element.scrollHeight;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================
// GLITCH EFFECT CONTROLLER
// ============================================

class GlitchEffect {
  constructor(element, options = {}) {
    this.element = element;
    this.originalText = element.textContent;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.isGlitching = false;

    // Read configuration from data attributes with defaults
    this.speed = parseInt(element.dataset.glitchSpeed || options.speed || '20', 10);
    this.iterationStep = parseFloat(element.dataset.glitchRounds || options.rounds || '0.556');
  }

  trigger() {
    if (this.isGlitching) return;
    this.isGlitching = true;

    // Fix width to prevent layout shift + GPU acceleration
    const currentWidth = this.element.offsetWidth;
    this.element.style.display = 'inline-block';
    this.element.style.minWidth = `${currentWidth}px`;
    this.element.style.willChange = 'contents';
    this.element.style.transform = 'translateZ(0)'; // Force GPU layer
    this.element.style.isolation = 'isolate'; // Create new stacking context without containment

    // Randomize direction: 50% left-to-right, 50% right-to-left
    const leftToRight = Math.random() < 0.5;
    let iterations = 0;
    const maxIterations = this.originalText.length;

    const animate = () => {
      if (iterations >= maxIterations) {
        this.element.textContent = this.originalText;
        this.element.style.minWidth = '';
        this.element.style.willChange = 'auto';
        this.element.style.transform = '';
        this.element.style.isolation = '';
        this.isGlitching = false;
        return;
      }

      this.element.textContent = this.originalText
        .split('')
        .map((char, index) => {
          const shouldReplace = leftToRight
            ? index >= maxIterations - iterations  // Right-to-left
            : index < iterations;                   // Left-to-right

          if (!shouldReplace) {
            return this.originalText[index];
          }
          if (char === ' ') return ' ';
          return this.chars[Math.floor(Math.random() * this.chars.length)];
        })
        .join('');

      iterations += this.iterationStep;
      setTimeout(() => requestAnimationFrame(animate), this.speed);
    };

    requestAnimationFrame(animate);
  }
}

// ============================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================

const observeElements = () => {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        entry.target.style.opacity = '1';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe cards and sections
  document.querySelectorAll('.card, .blog-card, .section-header').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
};

// ============================================
// NAVIGATION
// ============================================

const initNavigation = () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      
      // Animate hamburger
      const spans = navToggle.querySelectorAll('span');
      spans.forEach(span => span.classList.toggle('active'));
    });
    
    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }
  
  // Active nav link highlighting
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPath || 
        (currentPath.includes('/blog/') && link.getAttribute('href') === '/blog/')) {
      link.style.color = 'var(--cyan)';
    }
  });
};

// ============================================
// TERMINAL INITIALIZATION
// ============================================

const initTerminal = () => {
  const terminalBody = document.querySelector('.terminal-body[data-terminal]');

  if (terminalBody) {
    // Skip if already initialized
    if (terminalBody.dataset.terminalInitialized === 'true') {
      return;
    }
    terminalBody.dataset.terminalInitialized = 'true';

    const demoLines = [
      { type: 'command', text: 'nexusctl vm from-rootfs alpine 3.23 --name alpine-vm' },
      { type: 'output', text: 'Downloading alpine-3.23-x86_64.tar.gz...', isSuccess: false },
      { type: 'output', text: '✓ Downloaded 4.0 MiB', isSuccess: true },
      { type: 'output', text: 'Verifying checksums...', isSuccess: false },
      { type: 'output', text: '✓ Checksums verified', isSuccess: true },
      { type: 'output', text: 'Building rootfs image...', isSuccess: false },
      { type: 'output', text: '✓ Image built', isSuccess: true },
      { type: 'output', text: 'Creating drive from image...', isSuccess: false },
      { type: 'output', text: '✓ Drive created (btrfs snapshot)', isSuccess: true },
      { type: 'output', text: 'Creating VM and attaching drive...', isSuccess: false },
      { type: 'output', text: '✓ VM alpine-vm ready in 130ms', isSuccess: true },
      { type: 'command', text: '' }
    ];

    const typer = new TerminalTyper(terminalBody, {
      lines: demoLines,
      typingSpeed: 40,
      lineDelay: 600
    });

    // Start typing when terminal is visible
    const terminalObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          typer.start();
          terminalObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    terminalObserver.observe(terminalBody);
  }
};

// ============================================
// SCANLINE POSITION TRACKER
// ============================================

let scanlineY = -4; // Start above viewport
const SCANLINE_DURATION = 8000; // 8 seconds
let scanlineStartTime = Date.now();
const scanlineGlitchElements = []; // Elements that react to scanline

// Update scanline position and trigger glitches
const updateScanlinePosition = () => {
  const elapsed = Date.now() - scanlineStartTime;
  const progress = (elapsed % SCANLINE_DURATION) / SCANLINE_DURATION;
  const viewportHeight = window.innerHeight;

  // Scanline moves from -4px (above viewport) to viewportHeight (below viewport)
  scanlineY = -4 + (progress * (viewportHeight + 4));

  // Check each registered element and trigger glitch when scanline passes
  scanlineGlitchElements.forEach(({ element, glitcher, lastTriggered }) => {
    const rect = element.getBoundingClientRect();
    const scanlineBottom = scanlineY + 4; // Trailing edge of scanline
    const elementBottom = rect.bottom;

    // Trigger when scanline trailing edge is 2/3 through the element
    const triggerPoint = rect.top + (rect.height * 0.66);
    const isAtTriggerPoint = Math.abs(scanlineBottom - triggerPoint) < 5; // 5px threshold

    // Trigger glitch at 2/3 point
    if (isAtTriggerPoint && !lastTriggered.current) {
      glitcher.trigger();
      lastTriggered.current = true;
    } else if (scanlineBottom > elementBottom + 10) {
      // Reset after scanline fully passes
      lastTriggered.current = false;
    }
  });
};

// ============================================
// GLITCH EFFECTS INITIALIZATION
// ============================================

// Track if scanline interval is running
let scanlineIntervalId = null;

const initGlitchEffects = () => {
  // Logo glitch on hover
  const logo = document.querySelector('.nav-logo.glitch');
  if (logo && !logo.dataset.glitchInitialized) {
    logo.dataset.glitchInitialized = 'true';
    logo.addEventListener('mouseenter', () => {
      logo.classList.add('glitching');
    });
    logo.addEventListener('mouseleave', () => {
      logo.classList.remove('glitching');
    });
  }

  // Start scanline position tracking (only once)
  if (!scanlineIntervalId) {
    scanlineIntervalId = setInterval(updateScanlinePosition, 16); // ~60fps
  }

  // Random glitch effect - use dedicated data attribute for robustness
  // This selector won't break when copy changes
  const initGlitchElement = (element) => {
    // Skip if already initialized
    if (element.dataset.glitchInitialized === 'true') {
      return;
    }
    element.dataset.glitchInitialized = 'true';

    const glitcher = new GlitchEffect(element);

    // Read frequency from data attribute (no defaults - must be explicitly set)
    const frequency = element.dataset.glitchFrequency ? parseInt(element.dataset.glitchFrequency, 10) : null;
    const probability = element.dataset.glitchProbability ? parseFloat(element.dataset.glitchProbability) : null;
    const scanlineTrigger = element.dataset.glitchScanlineTrigger === 'true';

    // Register element for scanline triggering if enabled
    if (scanlineTrigger) {
      scanlineGlitchElements.push({
        element,
        glitcher,
        lastTriggered: { current: false }
      });
    }

    // Trigger glitch periodically (only if frequency and probability are specified)
    if (frequency !== null && probability !== null) {
      setInterval(() => {
        if (Math.random() < probability) {
          glitcher.trigger();
        }
      }, frequency);
    }

    // Trigger on hover
    element.addEventListener('mouseenter', () => {
      glitcher.trigger();
    });
  };

  // Initialize all elements marked for glitch effect
  document.querySelectorAll('[data-glitch-effect="true"]').forEach(initGlitchElement);

  // Post title glitch
  document.querySelectorAll('.post-title.glitch').forEach(title => {
    if (title.dataset.glitchInitialized !== 'true') {
      title.dataset.glitchInitialized = 'true';
      const glitcher = new GlitchEffect(title);
      title.addEventListener('mouseenter', () => {
        glitcher.trigger();
      });
    }
  });
};

// ============================================
// CARD HOVER EFFECTS
// ============================================

const initCardEffects = () => {
  document.querySelectorAll('.card, .blog-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'all 0.3s ease';
    });
  });
};

// ============================================
// PARALLAX GRID BACKGROUND
// ============================================

const initParallax = () => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const rate = scrollY * 0.3;
        hero.style.backgroundPosition = `0 ${rate}px`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
};

// ============================================
// COPY TO CLIPBOARD
// ============================================

const initCopyButtons = () => {
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy');
      try {
        await navigator.clipboard.writeText(text);
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    });
  });
};

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================

const initNavbarScroll = () => {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let ticking = false;

  const updateNavbar = () => {
    const scrolled = window.scrollY > 50;
    navbar.classList.toggle('navbar--scrolled', scrolled);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  // Initial check
  updateNavbar();
};

// ============================================
// KEYBOARD NAVIGATION
// ============================================

const initKeyboardNav = () => {
  document.addEventListener('keydown', (e) => {
    // Escape to close mobile menu
    if (e.key === 'Escape') {
      const navLinks = document.querySelector('.nav-links');
      if (navLinks) {
        navLinks.classList.remove('active');
      }
    }
  });
};

// ============================================
// HOMEPAGE BODY CLASS
// ============================================

const initHomepageClass = () => {
  // Add homepage class to body if wrapper has it
  const homepageWrapper = document.querySelector('.homepage');
  if (homepageWrapper) {
    document.body.classList.add('homepage');
  }
};

// ============================================
// INITIALIZE EVERYTHING
// ============================================

function initAll() {
  initHomepageClass();
  initNavigation();
  initTerminal();
  initGlitchEffects();
  initCardEffects();
  observeElements();
  initParallax();
  initCopyButtons();
  initNavbarScroll();
  initKeyboardNav();

  // Add loaded class to body for CSS transitions
  document.body.classList.add('loaded');
}

// Expose to window for Docusaurus client module to call on route changes
window.initAll = initAll;

// Try multiple times to ensure React has hydrated
document.addEventListener('DOMContentLoaded', () => {
  initAll();

  // Retry after a short delay in case React hasn't hydrated yet
  setTimeout(() => {
    initGlitchEffects();
    initTerminal();
  }, 100);

  setTimeout(() => {
    initGlitchEffects();
    initTerminal();
  }, 500);
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll events
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
