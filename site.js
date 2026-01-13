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
    
    // Sistema ultra leve - apenas partículas estáticas com CSS
    // Performance: 0% CPU usage vs 15-20% do canvas animado
    
    // Criar partículas estáticas com animação CSS leve
    const createStaticParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle-static';
      
      // Posição aleatória
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      
      // Tamanho e animação aleatórios
      const size = Math.random() * 3 + 1;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.animationDelay = Math.random() * 10 + 's';
      particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
      
      // Cor aleatória neon
      const colors = ['rgba(0,245,255,0.6)', 'rgba(255,43,214,0.5)', 'rgba(138,43,226,0.4)'];
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.boxShadow = `0 0 ${size * 2}px ${particle.style.background}`;
      
      container.appendChild(particle);
      
      // Remover após muito tempo para limpar
      setTimeout(() => particle.remove(), 30000);
    };
    
    // Criar apenas 15 partículas estáticas (vs 40 animadas)
    for (let i = 0; i < 15; i++) {
      setTimeout(() => createStaticParticle(), i * 100);
    }
    
    // Adicionar CSS para partículas estáticas se não existir
    if (!document.querySelector('#particle-static-css')) {
      const style = document.createElement('style');
      style.id = 'particle-static-css';
      style.textContent = `
        .particle-static {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          animation: float-up 20s infinite linear;
          opacity: 0;
        }
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(100vh) scale(0); }
          10% { opacity: 0.6; transform: translateY(90vh) scale(1); }
          90% { opacity: 0.3; transform: translateY(10vh) scale(0.8); }
          100% { opacity: 0; transform: translateY(-10vh) scale(0.5); }
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
