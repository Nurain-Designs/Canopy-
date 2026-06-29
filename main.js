// Navbar background on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

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

fadeElements.forEach(el => fadeObserver.observe(el));

// Zigzag Timeline Animation
const timelineSvg = document.querySelector('.timeline-svg');
const timelineProgress = document.getElementById('timeline-progress');
const timelineContainer = document.querySelector('.timeline-container');

if (timelineProgress && timelineContainer) {
  // Get the total length of the SVG path
  const pathLength = timelineProgress.getTotalLength();
  
  // Setup initial stroke dash array and offset
  timelineProgress.style.strokeDasharray = pathLength;
  timelineProgress.style.strokeDashoffset = pathLength;
  
  // Listen for scroll events to animate the path
  window.addEventListener('scroll', () => {
    // Calculate scroll percentage within the container
    const rect = timelineContainer.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // We want the animation to start when the top of the container enters the middle of the screen
    // and finish when the bottom of the container leaves the middle of the screen.
    const startOffset = windowHeight * 0.8; 
    const endOffset = windowHeight * 0.2;
    
    // Total distance the scroll has to cover
    const scrollDistance = rect.height + startOffset - endOffset;
    
    // Current scroll position relative to start
    let scrollPosition = startOffset - rect.top;
    
    // Clamp between 0 and 1
    let scrollPercentage = scrollPosition / scrollDistance;
    scrollPercentage = Math.max(0, Math.min(1, scrollPercentage));
    
    // Calculate offset based on percentage
    const drawLength = pathLength * scrollPercentage;
    timelineProgress.style.strokeDashoffset = pathLength - drawLength;
  });
}

// Region list active state toggling
const regionItems = document.querySelectorAll('.region-list li');
regionItems.forEach(item => {
  item.addEventListener('mouseenter', () => {
    // Remove active class from all
    regionItems.forEach(i => i.classList.remove('active'));
    // Add to current
    item.classList.add('active');
  });
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
          el.innerText = currentVal.toFixed(1) + 'M';
        } else if (format === 'percent') {
          el.innerText = '+' + currentVal.toFixed(1) + '%';
        }
        
        if (progress < 1) {
          requestAnimationFrame(animateCount);
        } else {
          // Final exact set
          if (format === 'number') el.innerText = target.toLocaleString();
          else if (format === 'million') el.innerText = target.toFixed(1) + 'M';
          else if (format === 'percent') el.innerText = '+' + target.toFixed(1) + '%';
        }
      };
      
      requestAnimationFrame(animateCount);
      countObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

countUpElements.forEach(el => countObserver.observe(el));

// Redirect to quantity.html for all impact calculator elements
document.addEventListener('click', (e) => {
  const calcBtn = e.target.closest('.impact-calc');
  if (calcBtn) {
    e.preventDefault();
    window.location.href = './quantity.html';
  }
});
