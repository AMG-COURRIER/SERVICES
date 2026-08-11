// AMG Courrier Service - Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const toggle = document.querySelector('.mobile-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.classList.toggle('active');
    });
  }

  // Sticky header effect
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // Quote / Contact form demo
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you! Your message has been received. An AMG Courrier specialist will contact you within 30 minutes during business hours.');
      contactForm.reset();
    });
  }

  const quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Quote request submitted successfully!\n\nYou will receive a detailed quote via email within 15-30 minutes. For urgent needs, call +1 (800) 264-2674.');
      quoteForm.reset();
    });
  }

  // Animate stats on scroll
  const stats = document.querySelectorAll('.stat-item h3');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target || el.textContent);
        if (!isNaN(target) && !el.dataset.animated) {
          el.dataset.animated = 'true';
          animateNumber(el, target);
        }
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(stat => observer.observe(stat));

  function animateNumber(el, target) {
    const duration = 1800;
    const start = 0;
    const startTime = performance.now();
    const suffix = el.dataset.suffix || '';
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * ease);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // Active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
});