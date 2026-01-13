(function () {
  const Site = {};

  // Performance utilities
  Site.debounce = function(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
      const context = this;
      const args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  Site.throttle = function(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  Site.onReady = function (fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
      return;
    }
    fn();
  };

  Site.initStickyNavbar = function () {
    // Navbar sempre visível
    const navbar = document.querySelector('.sticky-navbar');
    if (!navbar) return;

    const links = navbar.querySelectorAll('.sticky-nav-link');
    if (!links || links.length === 0) return;

    const current = (window.location.pathname || '').split('/').pop() || 'index.html';

    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      const normalizedHref = href.split('/').pop();

      const isActive = normalizedHref === current;
      link.classList.toggle('is-active', isActive);

      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  Site.initScrollProgress = function (selector) {
    const scrollProgress = document.querySelector(selector || '.scroll-progress');
    if (!scrollProgress) return;

    const updateScrollProgress = Site.throttle(function() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
      scrollProgress.style.width = scrolled + '%';
    }, 16); // ~60fps

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();
  };

  Site.observeVisible = function (elements, options) {
    const opts = options || {};
    const threshold = typeof opts.threshold === 'number' ? opts.threshold : 0.1;
    const visibleClass = opts.visibleClass || 'visible';
    const once = opts.once !== false;
    const onEnter = typeof opts.onEnter === 'function' ? opts.onEnter : null;

    const list = Array.from(elements || []);
    if (list.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          if (visibleClass) {
            entry.target.classList.add(visibleClass);
          }

          if (onEnter) {
            onEnter(entry.target);
          }

          if (once) {
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    list.forEach((el) => observer.observe(el));
  };

  Site.staggerReveal = function (elements, options) {
    const opts = options || {};
    const baseDelay = typeof opts.baseDelay === 'number' ? opts.baseDelay : 100;
    const step = typeof opts.step === 'number' ? opts.step : 150;
    const from = opts.from || 'translateY(30px)';
    const durationMs = typeof opts.durationMs === 'number' ? opts.durationMs : 600;

    const list = Array.from(elements || []);
    if (list.length === 0) return;

    list.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = from;

      setTimeout(() => {
        el.style.transition = 'all ' + durationMs + 'ms ease-out';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, baseDelay + index * step);
    });
  };

  Site.initParticles = function (containerId) {
    const container = document.getElementById(containerId || 'particles');
    if (!container) return;
    
    // Sistema avançado de partículas com múltiplos tipos e animações
    // Performance otimizada com CSS animations e requestAnimationFrame
    
    const particleTypes = {
      // Partículas flutuantes leves
      light: {
        class: 'particle-light',
        size: [2, 4],
        duration: [15, 25],
        opacity: [0.3, 0.7],
        colors: ['rgba(240, 93, 251, 0.8)', 'rgba(168, 85, 247, 0.6)', 'rgba(59, 130, 246, 0.7)'],
        animation: 'float-diagonal'
      },
      // Partículas de brilho/pulsar
      glow: {
        class: 'particle-glow',
        size: [4, 8],
        duration: [20, 35],
        opacity: [0.2, 0.5],
        colors: ['rgba(168, 85, 247, 0.6)', 'rgba(236, 72, 153, 0.5)', 'rgba(34, 211, 238, 0.6)'],
        animation: 'float-wave'
      },
      // Partículas de conexão (linhas)
      connection: {
        class: 'particle-connection',
        size: [1, 2],
        duration: [25, 40],
        opacity: [0.1, 0.3],
        colors: ['rgba(0, 245, 255, 0.4)', 'rgba(255, 43, 214, 0.3)'],
        animation: 'float-connection'
      },
      // Partículas de explosão/estrela
      star: {
        class: 'particle-star',
        size: [1, 3],
        duration: [10, 20],
        opacity: [0.4, 0.8],
        colors: ['rgba(255, 255, 255, 0.9)', 'rgba(0, 245, 255, 0.8)', 'rgba(255, 43, 214, 0.7)'],
        animation: 'twinkle-star'
      }
    };
    
    // Sistema de interação com mouse
    let mouseX = 0;
    let mouseY = 0;
    let isMouseMoving = false;
    let mouseTimeout;
    let lastScrollY = 0;
    let isScrolling = false;
    let scrollTimeout;
    
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMouseMoving = true;
      
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        isMouseMoving = false;
      }, 150);
      
      // Criar partículas interativas perto do mouse
      if (Math.random() > 0.8) {
        createInteractiveParticle(mouseX, mouseY);
      }
    };
    
    // Sistema de reação ao scroll
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = Math.abs(currentScrollY - lastScrollY);
      
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150);
      
      // Criar partículas de scroll baseadas na velocidade
      if (scrollDelta > 5 && Math.random() > 0.7) {
        createScrollParticle(scrollDelta);
      }
      
      lastScrollY = currentScrollY;
    };
    
    // Criar partícula reativa ao scroll
    const createScrollParticle = (velocity) => {
      const particle = document.createElement('div');
      particle.className = 'particle-scroll';
      
      // Posição aleatória na tela
      particle.style.left = Math.random() * window.innerWidth + 'px';
      particle.style.top = Math.random() * window.innerHeight + 'px';
      
      // Propriedades baseadas na velocidade do scroll
      const size = Math.min(Math.random() * velocity * 0.1 + 1, 6);
      const intensity = Math.min(velocity / 100, 1);
      const color = `rgba(${Math.floor(0 + intensity * 255)}, ${Math.floor(245 - intensity * 100)}, 255, ${0.3 + intensity * 0.4})`;
      
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.background = color;
      particle.style.boxShadow = `0 0 ${size * 3}px ${color}`;
      
      container.appendChild(particle);
      
      // Animação de reação ao scroll
      const direction = Math.random() > 0.5 ? 1 : -1;
      const lifetime = Math.random() * 800 + 400;
      
      let startTime = Date.now();
      const animateScroll = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / lifetime;
        
        if (progress >= 1) {
          particle.remove();
          return;
        }
        
        const currentY = parseFloat(particle.style.top) + (direction * velocity * 0.1 * (1 - progress));
        const opacity = 1 - progress;
        
        particle.style.top = currentY + 'px';
        particle.style.opacity = opacity;
        
        requestAnimationFrame(animateScroll);
      };
      
      requestAnimationFrame(animateScroll);
    };
    
    // Criar partícula interativa que segue o mouse
    const createInteractiveParticle = (x, y) => {
      const particle = document.createElement('div');
      particle.className = 'particle-interactive';
      
      // Posição baseada no mouse
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      
      // Propriedades aleatórias
      const size = Math.random() * 3 + 1;
      const color = ['rgba(0, 245, 255, 0.8)', 'rgba(255, 43, 214, 0.7)', 'rgba(168, 85, 247, 0.6)'][Math.floor(Math.random() * 3)];
      
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.background = color;
      particle.style.boxShadow = `0 0 ${size * 4}px ${color}`;
      
      container.appendChild(particle);
      
      // Animação de dispersão
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 100 + 50;
      const lifetime = Math.random() * 1000 + 500;
      
      let startTime = Date.now();
      const animateInteractive = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / lifetime;
        
        if (progress >= 1) {
          particle.remove();
          return;
        }
        
        const currentX = x + Math.cos(angle) * velocity * progress;
        const currentY = y + Math.sin(angle) * velocity * progress;
        const opacity = 1 - progress;
        
        particle.style.left = currentX + 'px';
        particle.style.top = currentY + 'px';
        particle.style.opacity = opacity;
        particle.style.transform = `scale(${1 + progress * 0.5})`;
        
        requestAnimationFrame(animateInteractive);
      };
      
      requestAnimationFrame(animateInteractive);
    };
    
    // Adicionar listener de mouse e scroll
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Criar partícula baseada no tipo
    const createParticle = (typeKey) => {
      const type = particleTypes[typeKey];
      if (!type) return;
      
      const particle = document.createElement('div');
      particle.className = type.class;
      
      // Posição aleatória
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      
      // Propriedades aleatórias baseadas no tipo
      const size = Math.random() * (type.size[1] - type.size[0]) + type.size[0];
      const duration = Math.random() * (type.duration[1] - type.duration[0]) + type.duration[0];
      const opacity = Math.random() * (type.opacity[1] - type.opacity[0]) + type.opacity[0];
      const color = type.colors[Math.floor(Math.random() * type.colors.length)];
      
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.background = color;
      particle.style.opacity = opacity;
      particle.style.animationDelay = Math.random() * 10 + 's';
      particle.style.animationDuration = duration + 's';
      
      // Efeito de brilho
      if (typeKey === 'glow' || typeKey === 'star') {
        particle.style.boxShadow = `0 0 ${size * 3}px ${color}, 0 0 ${size * 6}px ${color}`;
      } else {
        particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
      }
      
      container.appendChild(particle);
      
      // Remover após o tempo para limpar memória
      setTimeout(() => {
        if (particle.parentNode) {
          particle.remove();
        }
      }, duration * 1000);
    };
    
    // Criar partículas em lotes para melhor performance
    const createParticleBatch = () => {
      // Distribuição balanceada de tipos
      const distribution = [
        { type: 'light', count: 3 },
        { type: 'glow', count: 2 },
        { type: 'connection', count: 2 },
        { type: 'star', count: 1 }
      ];
      
      distribution.forEach(({ type, count }) => {
        for (let i = 0; i < count; i++) {
          setTimeout(() => createParticle(type), Math.random() * 2000);
        }
      });
    };
    
    // Criar partículas iniciais
    createParticleBatch();
    
    // Adicionar novas partículas periodicamente
    const particleInterval = setInterval(() => {
      // Verificar se o container ainda existe
      if (!document.getElementById(containerId || 'particles')) {
        clearInterval(particleInterval);
        document.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('scroll', handleScroll);
        return;
      }
      
      // Limitar número total de partículas para performance
      const currentParticles = container.children.length;
      if (currentParticles < 35) {
        createParticleBatch();
      }
    }, 8000);
    
    // Adicionar CSS para novos tipos de partículas
    if (!document.querySelector('#particle-advanced-css')) {
      const style = document.createElement('style');
      style.id = 'particle-advanced-css';
      style.textContent = `
        .particle-light {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          animation: float-diagonal 20s infinite ease-in-out;
        }
        
        .particle-glow {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          animation: float-wave 30s infinite ease-in-out, pulse-glow 3s infinite;
        }
        
        .particle-connection {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          animation: float-connection 35s infinite linear;
          width: 2px !important;
          height: 20px !important;
          border-radius: 1px;
        }
        
        .particle-star {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          animation: twinkle-star 15s infinite ease-in-out;
        }
        
        .particle-interactive {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
          transform: translate(-50%, -50%);
        }
        
        .particle-scroll {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        
        @keyframes float-diagonal {
          0% { opacity: 0; transform: translateY(100vh) translateX(-50px) scale(0); }
          10% { opacity: 0.6; transform: translateY(90vh) translateX(-40px) scale(1); }
          50% { opacity: 0.4; transform: translateY(50vh) translateX(20px) scale(0.8); }
          90% { opacity: 0.2; transform: translateY(10vh) translateX(40px) scale(0.6); }
          100% { opacity: 0; transform: translateY(-10vh) translateX(50px) scale(0.3); }
        }
        
        @keyframes float-wave {
          0% { opacity: 0; transform: translateY(100vh) translateX(0) scale(0); }
          10% { opacity: 0.5; transform: translateY(90vh) translateX(10px) scale(1); }
          30% { opacity: 0.3; transform: translateY(70vh) translateX(30px) scale(0.9); }
          50% { opacity: 0.4; transform: translateY(50vh) translateX(50px) scale(0.8); }
          70% { opacity: 0.3; transform: translateY(30vh) translateX(30px) scale(0.9); }
          90% { opacity: 0.2; transform: translateY(10vh) translateX(10px) scale(0.7); }
          100% { opacity: 0; transform: translateY(-10vh) translateX(0) scale(0.5); }
        }
        
        @keyframes float-connection {
          0% { opacity: 0; transform: translateY(100vh) translateX(0) rotate(45deg); }
          10% { opacity: 0.3; transform: translateY(90vh) translateX(5px) rotate(45deg); }
          50% { opacity: 0.2; transform: translateY(50vh) translateX(15px) rotate(45deg); }
          90% { opacity: 0.1; transform: translateY(10vh) translateX(25px) rotate(45deg); }
          100% { opacity: 0; transform: translateY(-10vh) translateX(30px) rotate(45deg); }
        }
        
        @keyframes twinkle-star {
          0% { opacity: 0; transform: translateY(100vh) translateX(0) scale(0) rotate(0deg); }
          10% { opacity: 0.8; transform: translateY(90vh) translateX(-10px) scale(1) rotate(90deg); }
          25% { opacity: 0.3; transform: translateY(75vh) translateX(10px) scale(0.5) rotate(180deg); }
          40% { opacity: 0.7; transform: translateY(60vh) translateX(-15px) scale(0.8) rotate(270deg); }
          55% { opacity: 0.2; transform: translateY(45vh) translateX(20px) scale(0.4) rotate(360deg); }
          70% { opacity: 0.6; transform: translateY(30vh) translateX(-25px) scale(0.7) rotate(450deg); }
          85% { opacity: 0.3; transform: translateY(15vh) translateX(30px) scale(0.5) rotate(540deg); }
          100% { opacity: 0; transform: translateY(-10vh) translateX(35px) scale(0.2) rotate(630deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 8px rgba(168, 85, 247, 0.4);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.8);
            transform: scale(1.2);
          }
        }
      `;
      document.head.appendChild(style);
    }
  };

    // Mover para site.js: filtros de projetos (antes em index.html)
    Site.initFilters = function () {
      const filterButtons = document.querySelectorAll('.filter-btn');
      const projectCards = document.querySelectorAll('#projetos-container .card');

      if (filterButtons.length === 0 || projectCards.length === 0) return;

      filterButtons.forEach((button) => {
        button.addEventListener('click', function (e) {
          e.preventDefault();

          filterButtons.forEach(btn => btn.classList.remove('active'));
          this.classList.add('active');

          const filter = this.getAttribute('data-filter');

          projectCards.forEach((card) => {
            const categories = card.getAttribute('data-category');
            if (filter === 'all' || (categories && categories.includes(filter))) {
              card.classList.remove('hidden');
            } else {
              card.classList.add('hidden');
            }
          });
        });
      });
    };

    // Mover para site.js: carrossel otimizado (antes em index.html)
    Site.initCarousels = function () {
      const carousels = document.querySelectorAll('.project-carousel');
      if (!carousels || carousels.length === 0) return;

      const raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

      carousels.forEach(carousel => {
        const slides = carousel.querySelectorAll('.carousel-slide');
        if (slides.length === 0) return;

        let currentSlide = 0;
        let interval;
        let loadedImages = new Set();
        let isTransitioning = false;
        let isIntersecting = false;

        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            isIntersecting = entry.isIntersecting;
            if (isIntersecting) {
              loadInitialImages();
              startAutoPlay();
            } else {
              stopAutoPlay();
            }
          });
        }, { threshold: 0.1 });

        observer.observe(carousel);

        function loadImage(slide) {
          const dataSrc = slide.getAttribute('data-src');
          if (dataSrc && !loadedImages.has(dataSrc)) {
            loadedImages.add(dataSrc);
            const img = new Image();
            img.onload = () => {
              slide.src = dataSrc;
              slide.style.opacity = '1';
            };
            img.onerror = () => {
              loadedImages.delete(dataSrc);
            };
            img.src = dataSrc;
          }
        }

        function loadInitialImages() {
          loadImage(slides[0]);
          if (slides.length > 1) loadImage(slides[1]);
        }

        function showSlide(index) {
          if (isTransitioning || index === currentSlide || !isIntersecting) return;
          isTransitioning = true;

          raf(() => {
            const currentSlideEl = slides[currentSlide];
            const nextSlideEl = slides[index];

            if (currentSlideEl) currentSlideEl.classList.remove('active');
            if (nextSlideEl) nextSlideEl.classList.add('active');

            currentSlide = index;

            const nextIndex = (index + 1) % slides.length;
            loadImage(slides[nextIndex]);

            setTimeout(() => { isTransitioning = false; }, 300);
          });
        }

        function startAutoPlay() {
          if (interval) return;
          interval = setInterval(() => {
            const nextSlide = (currentSlide + 1) % slides.length;
            showSlide(nextSlide);
          }, 4000);
        }

        function stopAutoPlay() {
          if (interval) { clearInterval(interval); interval = null; }
        }

        let touchStartX = 0;
        let touchEndX = 0;

        const handleTouchStart = (e) => { touchStartX = e.touches[0].clientX; };
        const handleTouchEnd = (e) => { touchEndX = e.changedTouches[0].clientX; handleSwipe(); };
        const handleSwipe = () => {
          const swipeThreshold = 50;
          const diff = touchStartX - touchEndX;
          if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) showSlide((currentSlide + 1) % slides.length);
            else showSlide((currentSlide - 1 + slides.length) % slides.length);
            stopAutoPlay(); startAutoPlay();
          }
        };

        carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
        carousel.addEventListener('touchend', handleTouchEnd, { passive: true });
        carousel.addEventListener('mouseenter', stopAutoPlay, { passive: true });
        carousel.addEventListener('mouseleave', () => { if (isIntersecting) startAutoPlay(); }, { passive: true });

        slides[0].classList.add('active');
        slides[0].style.opacity = '0';
      });
    };

    // Inicialização global centralizada
    Site.initAll = function () {
      Site.initStickyNavbar();
      Site.initFilters();
      Site.initCarousels();
      Site.initParticles('particles');
    };

  window.Site = Site;

  // Auto-init quando o DOM estiver pronto
  Site.onReady(function() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Evitar animações pesadas em prefer-reduced-motion
      return;
    }
    Site.initAll();
  });
})();
