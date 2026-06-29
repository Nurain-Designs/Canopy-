document.addEventListener('DOMContentLoaded', () => {
  // Fade in sections on scroll
  const fadeElements = document.querySelectorAll('.fade-in-section');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  fadeElements.forEach(el => {
    fadeObserver.observe(el);
  });

  // Count up animation for stats
  const countUpElements = document.querySelectorAll('.count-up');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-target'));
        const format = el.getAttribute('data-format');
        const duration = 1500; // 1.5 seconds
        const startTime = performance.now();
        
        const animateCount = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function (easeOutExpo)
          const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const currentVal = target * easeProgress;
          
          if (format === 'number') {
            el.innerText = Math.floor(currentVal).toLocaleString();
          } else if (format === 'million') {
            el.innerText = '+' + currentVal.toFixed(1) + 'M';
          } else if (format === 'million-plain') {
            el.innerText = currentVal.toFixed(1);
          } else if (format === 'percent-change') {
            el.innerText = '+' + currentVal.toFixed(1) + '%';
          } else if (format === 'percent') {
            el.innerText = currentVal.toFixed(1) + '%';
          } else if (format === 'k') {
            el.innerText = currentVal.toFixed(1);
          } else if (format === 'currency_no_symbol') {
            el.innerText = currentVal.toFixed(2);
          } else {
            el.innerText = Math.floor(currentVal);
          }
          
          if (progress < 1) {
            requestAnimationFrame(animateCount);
          } else {
            // Final exact set
            if (format === 'number') el.innerText = target.toLocaleString();
            else if (format === 'million') el.innerText = '+' + target.toFixed(1) + 'M';
            else if (format === 'million-plain') el.innerText = target.toFixed(1);
            else if (format === 'percent-change') el.innerText = '+' + target.toFixed(1) + '%';
            else if (format === 'percent') el.innerText = target.toFixed(1) + '%';
            else if (format === 'k') el.innerText = target.toFixed(1);
            else if (format === 'currency_no_symbol') el.innerText = target.toFixed(2);
            else el.innerText = target;
          }
        };
        
        requestAnimationFrame(animateCount);
        countObserver.unobserve(el);
      }
    });
  }, { threshold: 0.1 });

  countUpElements.forEach(el => countObserver.observe(el));

  // Redirect to quantity.html for all impact calculator elements
  document.addEventListener('click', (e) => {
    const calcBtn = e.target.closest('.impact-calc');
    if (calcBtn) {
      e.preventDefault();
      window.location.href = './quantity.html';
    }
  });
});
