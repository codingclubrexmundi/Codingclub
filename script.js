document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. Navigation and Header Shadows
     ========================================================================== */
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu');
  const navLinksList = document.getElementById('nav-links-list');

  mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    navLinksList.classList.toggle('active');
  });

  // Custom eased smooth scroll utility
  const smoothScrollTo = (targetEl, duration = 850) => {
    if (!targetEl) return;
    const headerHeight = document.getElementById('main-header').offsetHeight || 70;
    const startPosition = window.pageYOffset;
    const targetPosition = targetEl.getBoundingClientRect().top + startPosition - headerHeight;
    const distance = targetPosition - startPosition;
    let startTime = null;

    // Cubic-bezier easeInOut transition
    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutCubic(Math.min(timeElapsed / duration, 1));
      
      window.scrollTo(0, startPosition + distance * run);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        window.scrollTo(0, targetPosition);
      }
    };

    requestAnimationFrame(animation);
  };

  // Close mobile menu when clicking nav links & setup sliding indicator
  const navLinks = document.querySelectorAll('.nav-links a');
  
  // Dynamic sliding indicator pill
  const indicator = document.createElement('div');
  indicator.className = 'nav-pill-indicator';
  navLinksList.appendChild(indicator);

  const indicatorColors = {
    '#hero': 'rgba(66, 133, 244, 0.08)',     // Blue
    '#intro': 'rgba(234, 67, 53, 0.08)',    // Red
    '#learn': 'rgba(251, 188, 5, 0.1)',     // Yellow
    '#divisions': 'rgba(52, 168, 83, 0.08)', // Green
    '#timeline': 'rgba(66, 133, 244, 0.08)'  // Blue
  };

  // Bind custom eased smooth scroll to all local page anchor links (nav, CTAs, and cards)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return; // skip default top-jump anchors
      
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        
        // Collapse mobile menu if open
        mobileMenuBtn.classList.remove('active');
        navLinksList.classList.remove('active');
        indicator.classList.remove('active');
        
        smoothScrollTo(targetEl);
        
        // Sync url hash smoothly without native jump
        history.pushState(null, null, targetId);
      }
    });
  });

  navLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
      // Disable hover pill indicators on mobile vertical menu
      if (window.innerWidth <= 768) return;

      const href = this.getAttribute('href');
      indicator.style.left = `${this.offsetLeft}px`;
      indicator.style.width = `${this.offsetWidth}px`;
      indicator.style.top = `${this.offsetTop}px`;
      indicator.style.height = `${this.offsetHeight}px`;
      const themeColor = indicatorColors[href] || indicatorColors['#hero'];
      indicator.style.backgroundColor = themeColor;
      indicator.style.setProperty('--indicator-shadow', themeColor.replace('0.08', '0.25').replace('0.1', '0.3'));
      indicator.classList.add('active');

      // Trigger dropping gravity dot animation
      spawnDropDot(this);
    });
  });

  navLinksList.addEventListener('mouseleave', () => {
    indicator.classList.remove('active');
  });


  /* ==========================================================================
     2. Intersection Observer: Scroll Animations & Stat Counters
     ========================================================================== */
  // Reveal animations
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Once animated, no need to track it anymore
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px' // triggers slightly before entering viewport
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Stat Counter Animation
  const statNumbers = document.querySelectorAll('.stat-number');
  const countUp = (element) => {
    const target = parseInt(element.getAttribute('data-target'), 10);
    const duration = 2000; // 2 seconds animation
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Ease out quad formula
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.floor(easeProgress * target);
      
      // Format number (display exact counts)
      element.textContent = currentVal;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        element.textContent = target;
      }
    };

    requestAnimationFrame(updateCount);
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(num => statsObserver.observe(num));


  /* ==========================================================================
     3. Hero Showcase Carousel: Setup & Slide Control
     ========================================================================== */
  const slides = {
    web: document.getElementById('slide-web'),
    game: document.getElementById('slide-game'),
    python: document.getElementById('slide-python')
  };
  const tabTitle = document.getElementById('browser-tab-title');
  let startCarousel;

  if (tabTitle && slides.web && slides.game && slides.python) {
    const slideKeys = ['web', 'game', 'python'];
    const tabTitles = {
      web: 'webdev_module.js',
      game: 'game_runner.js',
      python: 'matrix_calc.py'
    };
    let currentSlideIndex = 0;
    let carouselInterval;

    const switchSlide = (slideKey) => {
      // Deactivate all slides
      slideKeys.forEach(key => {
        if (slides[key]) slides[key].classList.remove('active');
      });
      
      // Activate target slide
      slides[slideKey].classList.add('active');
      tabTitle.textContent = tabTitles[slideKey];

      // Trigger animations depending on which slide is visible
      if (slideKey === 'web') {
        startWebTyping();
        stopGameLoop();
        stopPythonTerminal();
      } else if (slideKey === 'game') {
        stopWebTyping();
        startGameLoop();
        stopPythonTerminal();
      } else if (slideKey === 'python') {
        stopWebTyping();
        stopGameLoop();
        startPythonTerminal();
      }
    };

    const autoRotateSlides = () => {
      currentSlideIndex = (currentSlideIndex + 1) % slideKeys.length;
      switchSlide(slideKeys[currentSlideIndex]);
    };

    // Start the slide rotation loop (every 7 seconds)
    startCarousel = () => {
      switchSlide(slideKeys[currentSlideIndex]);
      carouselInterval = setInterval(autoRotateSlides, 7000);
    };

    // Setup tab click interaction if users want to click the tab directly
    tabTitle.addEventListener('click', () => {
      clearInterval(carouselInterval);
      currentSlideIndex = (currentSlideIndex + 1) % slideKeys.length;
      switchSlide(slideKeys[currentSlideIndex]);
      // restart auto rotate after manual click
      carouselInterval = setInterval(autoRotateSlides, 7000);
    });
  }


  /* ==========================================================================
     3A. Visual 1: Web Dev Typing Code Animation
     ========================================================================== */
  const codeBox = document.getElementById('typing-code-box');
  const codeHtmlContent = 
    `<span class="code-comment">// Web Dev division entry</span>\n` +
    `<span class="code-keyword">const</span> <span class="code-function">initWebLayout</span> = (<span class="code-class">root</span>) => {\n` +
    `  <span class="code-keyword">const</span> <span class="code-tag">container</span> = document.<span class="code-function">createElement</span>(<span class="code-string">'main'</span>);\n` +
    `  <span class="code-tag">container</span>.<span class="code-class">className</span> = <span class="code-string">"google-grid"</span>;\n` +
    `  \n` +
    `  <span class="code-comment">// Render component tree</span>\n` +
    `  ReactDOM.<span class="code-function">render</span>(&lt;<span class="code-class">App</span> /&gt;, <span class="code-tag">container</span>);\n` +
    `  root.<span class="code-function">appendChild</span>(<span class="code-tag">container</span>);\n` +
    `  console.<span class="code-function">log</span>(<span class="code-string">"App mounted successfully! 🚀"</span>);\n` +
    `};`;

  let typingTimeout;
  
  const startWebTyping = () => {
    if (!codeBox) return;
    codeBox.innerHTML = '';
    let idx = 0;
    
    // Typing script that respects HTML tags
    const typeNextChar = () => {
      if (!codeBox) return;
      if (idx < codeHtmlContent.length) {
        const char = codeHtmlContent[idx];
        if (char === '<') {
          // If we hit an HTML tag, find the closing angle bracket and inject it at once
          const endIdx = codeHtmlContent.indexOf('>', idx);
          if (endIdx !== -1) {
            codeBox.innerHTML += codeHtmlContent.substring(idx, endIdx + 1);
            idx = endIdx + 1;
          } else {
            codeBox.innerHTML += char;
            idx++;
          }
        } else {
          codeBox.innerHTML += char;
          idx++;
        }
        typingTimeout = setTimeout(typeNextChar, 18);
      } else {
        // Add a blinking cursor at the end
        codeBox.innerHTML += '<span class="cursor-blink"></span>';
      }
    };
    
    typeNextChar();
  };

  const stopWebTyping = () => {
    clearTimeout(typingTimeout);
    if (codeBox) codeBox.innerHTML = '';
  };


  /* ==========================================================================
     3B. Visual 2: Game Dev Canvas Game (Autonomous Retro Breakout)
     ========================================================================== */
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let gameAnimationFrame;
  let ball, paddle, bricks;
  const brickRowCount = 3;
  const brickColumnCount = 6;
  const colorsList = ['#4285F4', '#EA4335', '#FBBC05', '#34A853']; // Google colors

  let startGameLoop = () => {};
  let stopGameLoop = () => {};

  if (canvas && ctx) {
    // Set logical size for game coordinates (independent of CSS responsive sizes)
    canvas.width = 480;
    canvas.height = 300;

    const initGameEntities = () => {
      ball = {
        x: canvas.width / 2,
        y: canvas.height - 50,
        dx: 2.2,
        dy: -2.2,
        radius: 6,
        color: '#EA4335' // Red ball
      };

      paddle = {
        x: (canvas.width - 75) / 2,
        y: canvas.height - 18,
        width: 75,
        height: 8,
        color: '#4285F4' // Blue paddle
      };

      bricks = [];
      const brickWidth = 65;
      const brickHeight = 14;
      const brickPadding = 8;
      const brickOffsetTop = 35;
      const brickOffsetLeft = 24;

      for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
          bricks[c][r] = { x: 0, y: 0, status: 1, color: colorsList[(c + r) % colorsList.length] };
        }
      }
    };

    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = ball.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = ball.color;
      ctx.fill();
      ctx.closePath();
      // reset shadow for other elements
      ctx.shadowBlur = 0;
    };

    const drawPaddle = () => {
      ctx.beginPath();
      ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
      ctx.fillStyle = paddle.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = paddle.color;
      ctx.fill();
      ctx.closePath();
      ctx.shadowBlur = 0;
    };

    const drawBricks = () => {
      const brickWidth = 65;
      const brickHeight = 14;
      const brickPadding = 8;
      const brickOffsetTop = 35;
      const brickOffsetLeft = 24;

      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
            const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.rect(brickX, brickY, brickWidth, brickHeight);
            ctx.fillStyle = bricks[c][r].color;
            ctx.fill();
            ctx.closePath();
          }
        }
      }
    };

    const collisionDetection = () => {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const b = bricks[c][r];
          if (b.status === 1) {
            // Ball hits brick
            if (ball.x > b.x && ball.x < b.x + 65 && ball.y > b.y && ball.y < b.y + 14) {
              ball.dy = -ball.dy;
              b.status = 0;
            }
          }
        }
      }
    };

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBricks();
      drawBall();
      drawPaddle();
      collisionDetection();

      // Bounce off side walls
      if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
      }
      
      // Bounce off top wall
      if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
      } 
      // Handle bottom collision
      else if (ball.y + ball.dy > canvas.height - ball.radius) {
        // Simple AI: paddle follows the ball automatically to play autonomously
        const targetPaddleX = ball.x - paddle.width / 2;
        paddle.x += (targetPaddleX - paddle.x) * 0.92; // smooth chase
        
        // Keep paddle inside bounds
        if (paddle.x < 0) paddle.x = 0;
        if (paddle.x > canvas.width - paddle.width) paddle.x = canvas.width - paddle.width;

        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
          // Bounce off paddle, randomize angle slightly depending on where it hits
          const hitPos = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
          ball.dx = hitPos * 3;
          ball.dy = -Math.abs(ball.dy); // guarantee vertical bounce upwards
        } else {
          // Reset ball if it falls out
          initGameEntities();
        }
      } else {
        // Slow paddle follow-drift when ball is high
        const targetPaddleX = ball.x - paddle.width / 2;
        paddle.x += (targetPaddleX - paddle.x) * 0.08;
        if (paddle.x < 0) paddle.x = 0;
        if (paddle.x > canvas.width - paddle.width) paddle.x = canvas.width - paddle.width;
      }

      ball.x += ball.dx;
      ball.y += ball.dy;

      // Check if all bricks destroyed, if so, reset
      let activeBricks = 0;
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          activeBricks += bricks[c][r].status;
        }
      }
      if (activeBricks === 0) {
        initGameEntities();
      }

      gameAnimationFrame = requestAnimationFrame(gameLoop);
    };

    startGameLoop = () => {
      initGameEntities();
      cancelAnimationFrame(gameAnimationFrame);
      gameLoop();
    };

    stopGameLoop = () => {
      cancelAnimationFrame(gameAnimationFrame);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }


  /* ==========================================================================
     3C. Visual 3: Python Terminal Animation
     ========================================================================== */
  const terminalBox = document.getElementById('terminal-box');
  const terminalCommands = [
    { type: 'input', text: 'import numpy as np' },
    { type: 'input', text: 'from math_fractal import generate' },
    { type: 'input', text: 'data_points = np.linspace(-2.0, 0.5, 30)' },
    { type: 'input', text: 'generate.render(data_points, iterations=100)' },
    { type: 'output', text: 'Drawing mandelbrot row matrix...', delay: 400 },
    { type: 'output-graph', text: 
      ' [==============================] 100%\n' +
      '  * * . . . . . . . * * * * *\n' +
      '  * . . . . . . . . . . * * *\n' +
      '  . . . . . . # . . . . . . *\n' +
      '  . . . . . # # # . . . . . *\n' +
      '  . . . . . . # . . . . . . *\n' +
      '  * . . . . . . . . . . * * *\n' +
      '  * * . . . . . . . * * * * *', delay: 800 },
    { type: 'output-success', text: 'Process finished with exit code 0.' }
  ];

  let pythonIntervals = [];

  const startPythonTerminal = () => {
    if (!terminalBox) return;
    terminalBox.innerHTML = '';
    let lineIdx = 0;

    const printLine = () => {
      if (!terminalBox) return;
      if (lineIdx < terminalCommands.length) {
        const cmd = terminalCommands[lineIdx];
        const lineEl = document.createElement('div');
        lineEl.className = 'terminal-line';

        if (cmd.type === 'input') {
          // Type out the input command
          const promptSpan = document.createElement('span');
          promptSpan.className = 'terminal-prompt';
          promptSpan.textContent = '>>> ';
          lineEl.appendChild(promptSpan);

          const commandTextSpan = document.createElement('span');
          lineEl.appendChild(commandTextSpan);
          terminalBox.appendChild(lineEl);

          let charIdx = 0;
          const typeChar = () => {
            if (!terminalBox) return;
            if (charIdx < cmd.text.length) {
              commandTextSpan.textContent += cmd.text[charIdx];
              charIdx++;
              pythonIntervals.push(setTimeout(typeChar, 25));
            } else {
              lineIdx++;
              pythonIntervals.push(setTimeout(printLine, 500));
            }
          };
          typeChar();

        } else {
          // Render terminal output directly
          if (cmd.type === 'output-success') {
            lineEl.className += ' terminal-success';
          } else if (cmd.type === 'output-graph') {
            lineEl.className += ' terminal-accent';
          }
          lineEl.textContent = cmd.text;
          terminalBox.appendChild(lineEl);
          
          lineIdx++;
          pythonIntervals.push(setTimeout(printLine, cmd.delay || 700));
        }

        // Scroll terminal to bottom
        terminalBox.scrollTop = terminalBox.scrollHeight;
      } else {
        // Blinking terminal cursor at the end
        const cursorLine = document.createElement('div');
        cursorLine.className = 'terminal-line';
        const promptSpan = document.createElement('span');
        promptSpan.className = 'terminal-prompt';
        promptSpan.textContent = '>>> ';
        cursorLine.appendChild(promptSpan);
        const blinkSpan = document.createElement('span');
        blinkSpan.className = 'cursor-blink';
        cursorLine.appendChild(blinkSpan);
        terminalBox.appendChild(cursorLine);
      }
    };

    printLine();
  };

  const stopPythonTerminal = () => {
    pythonIntervals.forEach(clearTimeout);
    pythonIntervals = [];
    if (terminalBox) terminalBox.innerHTML = '';
  };


  /* ==========================================================================
     4. Material Design: Button Ripple Animation
     ========================================================================== */
  const joinButton = document.getElementById('btn-join-ripple');

  if (joinButton) {
    joinButton.addEventListener('click', function(e) {
      // Create ripple element
      const ripple = document.createElement('span');
      ripple.className = 'hover-ripple-material';
      
      // Calculate coordinates relative to parent button
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      this.appendChild(ripple);
      
      // Remove ripple after animation finishes
      setTimeout(() => {
        ripple.remove();
      }, 600);

      // Smooth scroll to register section
      const targetSection = document.getElementById('intro'); // Let's scroll to introduction or a join popup.
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }


  /* ==========================================================================
     4B. Logo Animation & Physics Coordinates
     ========================================================================== */
  const logoEl = document.querySelector('.logo');
  const dotEl = document.querySelector('.i-dot');
  const stemEl = document.querySelector('.logo-i');
  const cEl = document.querySelector('.club-c');
  const lEl = document.querySelector('.club-l');
  const uEl = document.querySelector('.club-u');
  const bEl = document.querySelector('.club-b');

  const triggerLetterHit = (el, className) => {
    el.classList.add(className);
    setTimeout(() => el.classList.remove(className), 500);
  };

  const animateJump = (targetEl, duration, arcHeight, onHit, callback) => {
    if (!dotEl || !stemEl || !targetEl) return;
    
    const startX = parseFloat(dotEl.dataset.currentX) || 0;
    const startY = parseFloat(dotEl.dataset.currentY) || 0;

    const stemRect = stemEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    // Calculate destination horizontal & vertical offsets relative to the dot's origin
    const targetX = (targetRect.left + targetRect.width / 2) - (stemRect.left + stemRect.width / 2);
    // Land exactly sitting on top of the letter
    const targetY = targetRect.top - stemRect.top - 4;

    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Ease-in-out progress curve
      const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      const currentX = startX + easeT * (targetX - startX);
      const currentY = startY + easeT * (targetY - startY) + Math.sin(t * Math.PI) * (-arcHeight);

      dotEl.style.transform = `translateX(-50%) translate(${currentX}px, ${currentY}px)`;
      dotEl.dataset.currentX = currentX;
      dotEl.dataset.currentY = currentY;

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        if (onHit) onHit();
        if (callback) callback();
      }
    };

    requestAnimationFrame(step);
  };

  const runLogoAnimation = () => {
    if (!dotEl || !stemEl || !cEl || !lEl || !uEl || !bEl) return;
    
    // Jump 1: ı -> c
    animateJump(cEl, 500, 24, () => {
      triggerLetterHit(cEl, 'hit');
      dotEl.style.backgroundColor = 'var(--google-red)';
    }, () => {
      // Jump 2: c -> l
      setTimeout(() => {
        animateJump(lEl, 400, 18, () => {
          triggerLetterHit(lEl, 'hit');
          dotEl.style.backgroundColor = 'var(--google-yellow)';
        }, () => {
          // Jump 3: l -> u
          setTimeout(() => {
            animateJump(uEl, 400, 18, () => {
              triggerLetterHit(uEl, 'hit');
              dotEl.style.backgroundColor = 'var(--google-green)';
            }, () => {
              // Jump 4: u -> b
              setTimeout(() => {
                animateJump(bEl, 400, 18, () => {
                  triggerLetterHit(bEl, 'hit');
                  dotEl.style.backgroundColor = 'var(--google-blue)';
                }, () => {
                  // Wait at 'b' then fly back to 'ı' smoothly with a high parabolic loop
                  setTimeout(() => {
                    animateJump(stemEl, 950, 60, () => {
                      // Landed back home
                      stemEl.classList.add('squash');
                      setTimeout(() => stemEl.classList.remove('squash'), 250);
                      dotEl.style.backgroundColor = 'var(--google-blue)';
                    }, () => {
                      // Loop again after 4.5 seconds resting
                      setTimeout(runLogoAnimation, 4500);
                    });
                  }, 650);
                });
              }, 300);
            });
          }, 300);
        });
      }, 300);
    });
  };

  /* ==========================================================================
     4C. Navbar Falling Drop-Dot Gravity Simulation
     ========================================================================== */
  const spawnDropDot = (link) => {
    const rect = link.getBoundingClientRect();
    const href = link.getAttribute('href');
    
    const colors = {
      '#hero': 'var(--google-blue)',
      '#intro': 'var(--google-red)',
      '#learn': 'var(--google-yellow)',
      '#divisions': 'var(--google-green)',
      '#timeline': 'var(--google-blue)'
    };
    const themeColor = colors[href] || 'var(--google-blue)';

    // Create the gravity falling dot
    const dot = document.createElement('div');
    dot.className = 'nav-drop-dot';
    dot.style.position = 'fixed';
    dot.style.left = `${rect.left + rect.width / 2}px`;
    dot.style.backgroundColor = themeColor;
    document.body.appendChild(dot);

    let y = 3; // start height (navbar top)
    let vy = 0;
    const g = 0.55; // gravity velocity increase
    const targetY = rect.top + 2; // target collision line
    let bounces = 0;
    let animFrame;

    const runSimulation = () => {
      vy += g;
      y += vy;

      if (y >= targetY) {
        y = targetY;
        if (bounces < 2) {
          vy = -vy * 0.35; // bounce back with energy loss
          bounces++;
          
          // Spawn particle sparkle at collision
          createSparkle(rect.left + rect.width / 2, targetY, themeColor);
          
          // Spring wiggle displacement on link text
          link.style.transform = `translateY(${bounces === 1 ? '4px' : '2px'}) scaleX(1.02)`;
          setTimeout(() => {
            link.style.transform = 'none';
          }, 120);
        } else {
          // Finished bouncing, fade and clear dot
          dot.style.transform = 'translate(-50%, -50%) scale(0)';
          dot.style.opacity = '0';
          setTimeout(() => dot.remove(), 150);
          cancelAnimationFrame(animFrame);
          return;
        }
      }

      dot.style.top = `${y}px`;
      dot.style.transform = `translate(-50%, -50%) scale(1)`;
      animFrame = requestAnimationFrame(runSimulation);
    };

    runSimulation();
  };

  const createSparkle = (x, y, color) => {
    const sparkle = document.createElement('div');
    sparkle.className = 'nav-drop-ripple';
    sparkle.style.position = 'fixed';
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.color = color;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 400);
  };


  /* ==========================================================================
     4D. Blueprint Coordinate Margin Rulers
     ========================================================================== */
  const renderMarginRulers = () => {
    const leftRulerBox = document.querySelector('.bg-ruler-left');
    const rightRulerBox = document.querySelector('.bg-ruler-right');
    
    if (!leftRulerBox || !rightRulerBox) return;

    const rulerLength = 4000; // fits the page scroll length
    const step = 100;         // tick spacing

    // Left margin ruler drawing
    let leftHtml = `<svg width="60" height="${rulerLength}" style="height:${rulerLength}px;">`;
    leftHtml += `<line x1="50" y1="0" x2="50" y2="${rulerLength}" stroke="#dadce0" stroke-width="1.5" stroke-dasharray="4 4"/>`;
    for (let y = 100; y < rulerLength; y += step) {
      leftHtml += `<line x1="42" y1="${y}" x2="50" y2="${y}" stroke="#dadce0" stroke-width="1.5"/>`;
      const label = String(y).padStart(4, '0');
      leftHtml += `<text x="5" y="${y + 3}" fill="#9aa0a6" font-size="9" font-family="monospace" letter-spacing="0.5">${label}</text>`;
    }
    leftHtml += '</svg>';
    leftRulerBox.innerHTML = leftHtml;

    // Right margin ruler drawing
    let rightHtml = `<svg width="60" height="${rulerLength}" style="height:${rulerLength}px;">`;
    rightHtml += `<line x1="10" y1="0" x2="10" y2="${rulerLength}" stroke="#dadce0" stroke-width="1.5" stroke-dasharray="4 4"/>`;
    for (let y = 100; y < rulerLength; y += step) {
      rightHtml += `<line x1="10" y1="${y}" x2="18" y2="${y}" stroke="#dadce0" stroke-width="1.5"/>`;
      const label = String(y).padStart(4, '0');
      rightHtml += `<text x="24" y="${y + 3}" fill="#9aa0a6" font-size="9" font-family="monospace" letter-spacing="0.5">${label}</text>`;
    }
    rightHtml += '</svg>';
    rightRulerBox.innerHTML = rightHtml;
  };


  /* ==========================================================================
     4E. Layered Background Interaction (Cursor Spotlight & Glows)
     ========================================================================== */
  const cursorGlow = document.getElementById('cursor-glow');
  const bgGrid = document.querySelector('.bg-grid-overlay');

  let mouseX = -500;
  let mouseY = -500;
  let glowX = -500;
  let glowY = -500;

  // Track cursor position
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Keep cursor glow in screen space, and feed coordinates relative to body for grid lighting mask
  const updateCursorGlow = () => {
    // Easing/Lag: interpolate target position
    const dx = mouseX - glowX;
    const dy = mouseY - glowY;
    glowX += dx * 0.08;
    glowY += dy * 0.08;

    if (cursorGlow) {
      cursorGlow.style.left = `${glowX}px`;
      cursorGlow.style.top = `${glowY}px`;
    }

    if (bgGrid) {
      // Calculate absolute scroll position of spotlight for the grid overlay mask
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      bgGrid.style.setProperty('--cursor-x', `${glowX + scrollX}px`);
      bgGrid.style.setProperty('--cursor-y', `${glowY + scrollY}px`);
    }

    requestAnimationFrame(updateCursorGlow);
  };

  // Start tracking loop
  requestAnimationFrame(updateCursorGlow);

  // Glow color coordinates shift matching division page sections
  const sectionColors = {
    'hero': '#4285F4',      // Blue
    'intro': '#EA4335',     // Red
    'learn': '#FBBC05',     // Yellow
    'divisions': '#34A853', // Green
    'timeline': '#4285F4',  // Blue
    'join': '#EA4335'       // Red
  };

  const glowObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;
        const color = sectionColors[sectionId] || '#4285F4';
        
        // Update variables for highlight dot layer and mouse spotlight glow
        if (bgGrid) {
          bgGrid.style.setProperty('--glow-color', color);
        }
        if (cursorGlow) {
          cursorGlow.style.background = `radial-gradient(circle, ${color}2B 0%, ${color}00 70%)`;
        }
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('section').forEach(sec => glowObserver.observe(sec));


  /* ==========================================================================
     4F. Hover Ripple Feedback System (Layer 5)
     ========================================================================== */
  const bindTactileRipples = () => {
    const targets = document.querySelectorAll('.division-card, .btn');

    targets.forEach(target => {
      // Helper to identify theme color accent mapping
      let color = 'var(--google-blue)';
      if (target.classList.contains('div-web')) color = 'var(--google-blue)';
      else if (target.classList.contains('div-game')) color = 'var(--google-red)';
      else if (target.classList.contains('div-python')) color = 'var(--google-green)';
      else if (target.id === 'join' || target.href && target.href.endsWith('#join')) color = 'var(--google-red)';

      const triggerRipple = (e) => {
        // Respect prefers-reduced-motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.className = 'hover-ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.color = color;

        target.appendChild(ripple);

        setTimeout(() => ripple.remove(), 650);
      };

      target.addEventListener('mouseenter', triggerRipple);
      target.addEventListener('click', triggerRipple);
    });
  };

  /* ==========================================================================
     4G. Web Dev Division Page Typewriter Loop
     ========================================================================== */
  const divisionTypewriter = document.getElementById('typewriter-code-box');
  if (divisionTypewriter) {
    const snippets = [
      `<span class="code-keyword">const</span> <span class="code-function">WebDevCrew</span> = () =&gt; {\n` +
      `  <span class="code-keyword">const</span> [shipped] = <span class="code-function">useState</span>(<span class="code-keyword">true</span>);\n` +
      `  <span class="code-keyword">return</span> (\n` +
      `    &lt;<span class="code-tag">div</span> <span class="code-class">className</span>=<span class="code-string">"crew"</span>&gt;\n` +
      `      &lt;<span class="code-tag">h2</span>&gt;Web Dev Crew&lt;/<span class="code-tag">h2</span>&gt;\n` +
      `      &lt;<span class="code-tag">p</span>&gt;Shipping real sites together&lt;/<span class="code-tag">p</span>&gt;\n` +
      `    &lt;/<span class="code-tag">div</span>&gt;\n` +
      `  );\n` +
      `};`,

      `<span class="code-keyword">async</span> <span class="code-keyword">function</span> <span class="code-function">fetchProjects</span>() {\n` +
      `  <span class="code-keyword">const</span> <span class="code-class">res</span> = <span class="code-keyword">await</span> <span class="code-function">fetch</span>(<span class="code-string">'/api/projects'</span>);\n` +
      `  <span class="code-keyword">const</span> <span class="code-class">data</span> = <span class="code-keyword">await</span> <span class="code-class">res</span>.<span class="code-function">json</span>();\n` +
      `  <span class="code-keyword">if</span> (<span class="code-class">data</span>.success) {\n` +
      `    <span class="code-function">renderShowcase</span>(<span class="code-class">data</span>.projects);\n` +
      `  }\n` +
      `}`
    ];

    let snippetIdx = 0;
    let typeTimeout;

    const runTypewriterCycle = () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        divisionTypewriter.innerHTML = snippets[snippetIdx] + '<span class="cursor-blink"></span>';
        typeTimeout = setTimeout(() => {
          snippetIdx = (snippetIdx + 1) % snippets.length;
          runTypewriterCycle();
        }, 6000);
        return;
      }

      divisionTypewriter.innerHTML = '';
      const htmlContent = snippets[snippetIdx];
      let charIdx = 0;

      const typeChar = () => {
        if (charIdx < htmlContent.length) {
          const char = htmlContent[charIdx];
          if (char === '<') {
            const closingIdx = htmlContent.indexOf('>', charIdx);
            if (closingIdx !== -1) {
              divisionTypewriter.innerHTML += htmlContent.substring(charIdx, closingIdx + 1);
              charIdx = closingIdx + 1;
            } else {
              divisionTypewriter.innerHTML += char;
              charIdx++;
            }
          } else {
            divisionTypewriter.innerHTML += char;
            charIdx++;
          }
          typeTimeout = setTimeout(typeChar, 25);
        } else {
          divisionTypewriter.innerHTML += '<span class="cursor-blink"></span>';
          typeTimeout = setTimeout(() => {
            snippetIdx = (snippetIdx + 1) % snippets.length;
            runTypewriterCycle();
          }, 5000);
        }
      };

      typeChar();
    };

    runTypewriterCycle();
  }

  /* ==========================================================================
     4H. Web Dev Division Page Showcase Tabs Filtering
     ========================================================================== */
  const filterTabs = document.querySelectorAll('.filter-tab');
  const projectCards = document.querySelectorAll('.project-card-wrapper');

  if (filterTabs.length > 0 && projectCards.length > 0) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filterVal = tab.getAttribute('data-filter');

        projectCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filterVal === 'all' || category === filterVal) {
            card.classList.remove('hide-project');
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          } else {
            card.classList.add('hide-project');
          }
        });
      });
    });
  }

  /* ==========================================================================
     4I. Game Dev Division Page Bouncing Physics Loop
     ========================================================================== */
  const gdCanvas = document.getElementById('gamedev-canvas');
  if (gdCanvas) {
    const gdCtx = gdCanvas.getContext('2d');
    let w = gdCanvas.width = 400;
    let h = gdCanvas.height = 200;
    
    let ball = { x: w/2, y: h/2, radius: 10, dx: 3, dy: -3, color: '#EA4335' };
    let trail = [];
    let gdAnimFrame;
    
    const animateGameDevHero = () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        gdCtx.clearRect(0, 0, w, h);
        gdCtx.beginPath();
        gdCtx.arc(w/2, h/2, ball.radius, 0, Math.PI*2);
        gdCtx.fillStyle = ball.color;
        gdCtx.fill();
        gdCtx.closePath();
        gdAnimFrame = requestAnimationFrame(animateGameDevHero);
        return;
      }

      gdCtx.fillStyle = 'rgba(17, 8, 8, 0.25)'; // trail blend backdrop
      gdCtx.fillRect(0, 0, w, h);
      
      // Draw trails
      trail.forEach((p, idx) => {
        gdCtx.beginPath();
        gdCtx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
        gdCtx.fillStyle = `rgba(234, 67, 53, ${p.alpha})`;
        gdCtx.fill();
        gdCtx.closePath();
        p.alpha -= 0.03;
        if (p.alpha <= 0) trail.splice(idx, 1);
      });
      
      trail.push({ x: ball.x, y: ball.y, radius: ball.radius * 0.8, alpha: 0.5 });
      
      // Bouncing boundary logic
      if (ball.x + ball.dx > w - ball.radius || ball.x + ball.dx < ball.radius) ball.dx = -ball.dx;
      if (ball.y + ball.dy > h - ball.radius || ball.y + ball.dy < ball.radius) ball.dy = -ball.dy;
      
      ball.x += ball.dx;
      ball.y += ball.dy;
      
      gdCtx.beginPath();
      gdCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
      gdCtx.fillStyle = ball.color;
      gdCtx.shadowBlur = 8;
      gdCtx.shadowColor = ball.color;
      gdCtx.fill();
      gdCtx.closePath();
      gdCtx.shadowBlur = 0;
      
      gdAnimFrame = requestAnimationFrame(animateGameDevHero);
    };
    
    animateGameDevHero();
  }

  /* ==========================================================================
     4J. Python Division Page Terminal REPL Typer Loop
     ========================================================================== */
  const pyRepl = document.getElementById('python-repl-typewriter');
  if (pyRepl) {
    const lines = [
      { type: 'input', text: 'import pandas as pd' },
      { type: 'input', text: "df = pd.read_csv('metrics.csv')" },
      { type: 'input', text: 'print(df.describe())' },
      { type: 'output', text: '      records  uptime_pct\ncount    35.0        99.9\nmean     10.4        99.8\nstd       2.1         0.1' },
      { type: 'input', text: '# Automation successful! 🚀' }
    ];
    
    let lineIdx = 0;
    let charIdx = 0;
    let pyReplTimeout;
    
    const runReplCycle = () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        pyRepl.innerHTML = lines.map(l => {
          if (l.type === 'input') return `&gt;&gt;&gt; ${l.text}`;
          return l.text;
        }).join('\n') + '\n<span class="cursor-blink"></span>';
        return;
      }
      
      pyRepl.innerHTML = '';
      lineIdx = 0;
      charIdx = 0;
      
      const printNextLine = () => {
        if (lineIdx < lines.length) {
          const cmd = lines[lineIdx];
          if (cmd.type === 'input') {
            if (charIdx === 0) {
              pyRepl.innerHTML += '&gt;&gt;&gt; ';
            }
            
            if (charIdx < cmd.text.length) {
              pyRepl.innerHTML += cmd.text[charIdx];
              charIdx++;
              pyReplTimeout = setTimeout(printNextLine, 30);
            } else {
              pyRepl.innerHTML += '\n';
              charIdx = 0;
              lineIdx++;
              pyReplTimeout = setTimeout(printNextLine, 600);
            }
          } else {
            pyRepl.innerHTML += `<span style="color: var(--google-green); opacity: 0.85;">${cmd.text}</span>\n`;
            lineIdx++;
            pyReplTimeout = setTimeout(printNextLine, 1000);
          }
        } else {
          pyRepl.innerHTML += '&gt;&gt;&gt; <span class="cursor-blink"></span>';
          pyReplTimeout = setTimeout(runReplCycle, 6000);
        }
      };
      
      printNextLine();
    };
    
    runReplCycle();
  }


  /* ==========================================================================
     4K. Division Interactive Flagship Sandboxes
     ========================================================================== */
  
  // 1. Web Dev: Interactive Lavalamp
  const glass = document.querySelector('.lavalamp-glass');
  const webdevBtn = document.getElementById('webdev-flagship-btn');
  if (glass && webdevBtn) {
    glass.style.cursor = 'pointer';
    glass.addEventListener('click', (e) => {
      const rect = glass.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      const newBlob = document.createElement('div');
      newBlob.className = 'lavalamp-blob';
      newBlob.style.left = `${clickX - 12}px`;
      newBlob.style.top = `${clickY - 12}px`;
      newBlob.style.width = '24px';
      newBlob.style.height = '24px';
      newBlob.style.animation = 'float-blob 6s infinite ease-in-out alternate';
      
      glass.appendChild(newBlob);
      setTimeout(() => newBlob.remove(), 7000);
    });

    let colorPaletteIdx = 0;
    const palettes = [
      { start: '#4285f4', end: '#34a853' }, // Blue/Green
      { start: '#ea4335', end: '#fbbc05' }, // Red/Yellow
      { start: '#e91e63', end: '#9c27b0' }, // Pink/Purple
      { start: '#00bcd4', end: '#009688' }  // Teal
    ];
    webdevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      colorPaletteIdx = (colorPaletteIdx + 1) % palettes.length;
      const pal = palettes[colorPaletteIdx];
      const blobs = document.querySelectorAll('.lavalamp-blob');
      blobs.forEach(b => {
        b.style.background = `linear-gradient(135deg, ${pal.start}, ${pal.end})`;
        b.style.boxShadow = `0 0 10px ${pal.start}`;
      });
    });
  }

  // 2. Game Dev: ASCII Gravity Runner Game
  const gdFlagBtn = document.getElementById('gamedev-flagship-btn');
  const gdGameScreen = document.getElementById('gamedev-game-screen');
  const gdGameHud = document.getElementById('gamedev-game-hud');
  const gdInstruction = document.getElementById('gamedev-game-instruction');

  if (gdFlagBtn && gdGameScreen) {
    let gameInterval;
    let gameActive = false;
    let score = 0;
    let playerY = 1; // 1 = floor, 0 = ceiling
    let playerX = 4;
    let obstacles = [];
    let frameCount = 0;
    
    const gameWidth = 28;
    
    const startGame = () => {
      if (gameActive) return;
      gameActive = true;
      score = 0;
      playerY = 1;
      obstacles = [
        { x: 16, y: 1 },
        { x: 26, y: 0 }
      ];
      frameCount = 0;
      gdInstruction.innerHTML = '[CLICK VIEWPORT TO INVERT GRAVITY]';
      
      if (gameInterval) clearInterval(gameInterval);
      gameInterval = setInterval(updateGame, 150);
    };
    
    const updateGame = () => {
      frameCount++;
      score += 10;
      
      gdGameHud.innerHTML = `<span>SCORE: ${String(score).padStart(5, '0')}</span><span>HI-SCORE: 01420</span>`;
      
      obstacles.forEach(o => o.x--);
      obstacles = obstacles.filter(o => o.x >= 0);
      
      if (frameCount % 10 === 0) {
        const obsFloor = Math.random() > 0.5 ? 1 : 0;
        obstacles.push({ x: gameWidth - 1, y: obsFloor });
      }
      
      const collision = obstacles.some(o => o.x === playerX && o.y === playerY);
      if (collision) {
        endGame();
        return;
      }
      
      renderFrame();
    };
    
    const renderFrame = () => {
      let lines = [];
      lines.push('=' .repeat(gameWidth));
      
      let r1 = '';
      for (let x = 0; x < gameWidth; x++) {
        if (x === playerX && playerY === 0) {
          r1 += 'O';
        } else if (obstacles.some(o => o.x === x && o.y === 0)) {
          r1 += 'X';
        } else {
          r1 += ' ';
        }
      }
      lines.push(r1);
      
      let r2 = '';
      for (let x = 0; x < gameWidth; x++) {
        if (x === playerX && playerY === 1) {
          r2 += 'O';
        } else if (obstacles.some(o => o.x === x && o.y === 1)) {
          r2 += 'X';
        } else {
          r2 += ' ';
        }
      }
      lines.push(r2);
      
      lines.push('=' .repeat(gameWidth));
      
      gdGameScreen.innerHTML = `<pre style="font-family: monospace; font-size: 0.8rem; line-height: 1.2; color: var(--google-red); text-align: left; margin: 0; background-color: transparent;">${lines.join('\n')}</pre>`;
    };
    
    const endGame = () => {
      gameActive = false;
      clearInterval(gameInterval);
      gdInstruction.innerHTML = '[CLICK "PLAY GRAVITY RUNNER" TO RETRY]';
      gdGameScreen.innerHTML = `<div style="color: var(--google-red); font-family: monospace; font-size: 0.9rem; font-weight: bold; text-align: center;">CRASHED!</div>`;
    };
    
    const flipGravity = () => {
      if (!gameActive) return;
      playerY = playerY === 0 ? 1 : 0;
      renderFrame();
    };
    
    gdFlagBtn.addEventListener('click', (e) => {
      e.preventDefault();
      startGame();
    });
    
    gdGameScreen.addEventListener('click', () => {
      flipGravity();
    });
  }

  // 3. Python: Real Mandelbrot Fractal Generator
  const pyFlagBtn = document.getElementById('python-flagship-btn');
  const pyOutput = document.getElementById('python-fractal-output');
  if (pyFlagBtn && pyOutput) {
    let zoomLevel = 0;
    
    const generateMandelbrotASCII = (zoom) => {
      const width = 36;
      const height = 7;
      let result = '';
      
      let x_min, x_max, y_min, y_max;
      if (zoom === 0) {
        x_min = -2.0; x_max = 0.5;
        y_min = -1.2; y_max = 1.2;
      } else if (zoom === 1) {
        x_min = -0.85; x_max = -0.7;
        y_min = 0.1; y_max = 0.25;
      } else {
        x_min = -0.22; x_max = -0.05;
        y_min = 0.62; y_max = 0.78;
      }
      
      for (let y = 0; y < height; y++) {
        let row = '';
        for (let x = 0; x < width; x++) {
          const cx = x_min + (x / width) * (x_max - x_min);
          const cy = y_min + (y / height) * (y_max - y_min);
          
          let zx = 0;
          let zy = 0;
          let iter = 0;
          const max_iter = 30;
          
          while (zx * zx + zy * zy < 4 && iter < max_iter) {
            const xtemp = zx * zx - zy * zy + cx;
            zy = 2 * zx * zy + cy;
            zx = xtemp;
            iter++;
          }
          
          if (iter === max_iter) {
            row += '#';
          } else if (iter > 15) {
            row += '*';
          } else if (iter > 8) {
            row += '.';
          } else {
            row += ' ';
          }
        }
        result += row + '\n';
      }
      return result.trim();
    };

    pyFlagBtn.addEventListener('click', (e) => {
      e.preventDefault();
      zoomLevel = (zoomLevel + 1) % 3;
      
      pyOutput.innerHTML = '[RUNNING] numpy.broadcast(c)...\n[RUNNING] plotting ASCII complex array...';
      
      setTimeout(() => {
        const ascii = generateMandelbrotASCII(zoomLevel);
        pyOutput.innerHTML = ascii;
      }, 350);
    });
  }


  /* ==========================================================================
     5. Kickoff
     ========================================================================== */
  if (typeof startCarousel === 'function') {
    startCarousel();
  }
  
  // Render blueprint rulers in viewport margins
  renderMarginRulers();
  
  // Start logo bounce sequence after a brief load delay
  setTimeout(runLogoAnimation, 1200);

  // Bind hover ripple listeners
  bindTactileRipples();
});
