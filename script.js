/* ==========================================================================
   INTERACTIVE LOGIC FOR ABDUL MANAN MERZAI & BROTHERS
   Security-Hardened Static Frontend
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. NAVIGATION BAR EFFECTS
  // ==========================================================================
  const navbar = document.querySelector('.navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky Navbar style change on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('active');
    } else {
      navbar.classList.remove('active');
    }
  });

  // Mobile menu toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('active');
    });
  }

  // Close mobile menu on clicking any navigation link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navMenu.classList.remove('active');
    });
  });


  // ==========================================================================
  // 2. CANVAS HERO PARTICLES (DUST/SPARK EFFECT)
  // ==========================================================================
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    const numberOfParticles = 50;

    // Resize canvas
    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle Blueprint
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height + canvas.height; // Start below or at various heights
        this.size = Math.random() * 2 + 1; // Small elegant dust particles
        this.speedY = -(Math.random() * 0.8 + 0.3); // Floating upwards
        this.speedX = (Math.random() * 0.4 - 0.2); // Gentle drift
        this.opacity = Math.random() * 0.5 + 0.1;
        this.fadeSpeed = Math.random() * 0.002 + 0.001;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        
        // Float out of view reset
        if (this.y < 0) {
          this.y = canvas.height + Math.random() * 20;
          this.x = Math.random() * canvas.width;
          this.opacity = Math.random() * 0.5 + 0.1;
        }
      }

      draw() {
        ctx.fillStyle = `rgba(201, 168, 76, ${this.opacity})`; // Accent gold tint
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize particles
    function init() {
      particlesArray = [];
      for (let i = 0; i < numberOfParticles; i++) {
        const p = new Particle();
        p.y = Math.random() * canvas.height; // Distribute across initial height
        particlesArray.push(p);
      }
    }
    init();

    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      requestAnimationFrame(animate);
    }
    animate();

    // Redraw particles nicely if window layout updates
    window.addEventListener('resize', () => {
      init();
    });
  }


  // ==========================================================================
  // 3. SCROLL REVEAL (FADE IN UP) ANIMATIONS
  // ==========================================================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });


  // ==========================================================================
  // 4. STATS COUNT-UP ANIMATION
  // ==========================================================================
  const statNumbers = document.querySelectorAll('.stat-number');

  function countUp(element) {
    const target = parseInt(element.getAttribute('data-target'), 10);
    const duration = 1500; // 1.5 seconds duration
    let startTimestamp = null;

    function step(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing out quadratic function
      const easeProgress = progress * (2 - progress);
      const currentValue = Math.floor(easeProgress * target);
      
      // Format number with commas if needed (e.g. 1,000)
      element.innerText = currentValue.toLocaleString('en-US');

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.innerText = target.toLocaleString('en-US'); // Ensure exact target is set at the end
      }
    }
    window.requestAnimationFrame(step);
  }

  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const targetElement = entry.target;
        countUp(targetElement);
        observer.unobserve(targetElement); // Trigger only once
      }
    });
  }, {
    threshold: 0.5
  });

  statNumbers.forEach(stat => {
    statsObserver.observe(stat);
  });


  // ==========================================================================
  // 5. SECURITY: INPUT SANITIZATION UTILITY
  // ==========================================================================
  /**
   * Strips dangerous HTML characters and event handler patterns from input.
   * Prevents XSS injection in any client-side rendered content.
   */
  function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/script/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }


  // ==========================================================================
  // 6. CONTACT FORM VALIDATION & HANDLING (SECURITY HARDENED)
  // ==========================================================================
  const contactForm = document.getElementById('contact-form');
  const successBanner = document.getElementById('success-banner');

  // Rate limiting: track last submission time
  let lastSubmitTime = 0;
  const RATE_LIMIT_MS = 10000; // 10 seconds cooldown

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault(); // Intercept initial submit to perform validations

      // --- SECURITY: Honeypot check ---
      const honeypotField = document.getElementById('website');
      if (honeypotField && honeypotField.value.trim() !== '') {
        // Bot detected — silently block submission
        return;
      }

      // --- SECURITY: Rate limiting ---
      const now = Date.now();
      if (now - lastSubmitTime < RATE_LIMIT_MS) {
        const remainingSec = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitTime)) / 1000);
        showError(
          document.getElementById('btn-submit').parentElement.querySelector('.form-group:last-of-type textarea') || document.getElementById('message'),
          'Please wait ' + remainingSec + ' seconds before submitting again.'
        );
        return;
      }

      // Grab elements
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const phoneInput = document.getElementById('phone');
      const messageInput = document.getElementById('message');

      let isFormValid = true;

      // --- Sanitize all inputs before validation ---
      const nameVal = sanitizeInput(nameInput.value.trim());
      const emailVal = sanitizeInput(emailInput.value.trim());
      const phoneVal = sanitizeInput(phoneInput.value.trim());
      const messageVal = sanitizeInput(messageInput.value.trim());

      // 1. Validation for Name (required, min 3 chars, max 50)
      if (!nameVal || nameVal.length < 3) {
        showError(nameInput, 'Name is required and must be at least 3 characters.');
        isFormValid = false;
      } else if (nameVal.length > 50) {
        showError(nameInput, 'Name must not exceed 50 characters.');
        isFormValid = false;
      } else {
        clearError(nameInput);
      }

      // 2. Validation for Email (valid format, max 100)
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailVal || !emailRegex.test(emailVal)) {
        showError(emailInput, 'Please enter a valid email address.');
        isFormValid = false;
      } else if (emailVal.length > 100) {
        showError(emailInput, 'Email must not exceed 100 characters.');
        isFormValid = false;
      } else {
        clearError(emailInput);
      }

      // 3. Validation for Phone (digits only, min 10, max 15)
      const phoneDigits = phoneVal.replace(/\D/g, ''); // strip non-digits
      const phoneClean = phoneVal.replace(/[+() \-]/g, '');
      
      if (!phoneVal || phoneDigits.length < 10 || !/^[0-9]+$/.test(phoneClean)) {
        showError(phoneInput, 'Phone number must contain only digits and be at least 10 digits long.');
        isFormValid = false;
      } else if (phoneDigits.length > 15) {
        showError(phoneInput, 'Phone number must not exceed 15 digits.');
        isFormValid = false;
      } else {
        clearError(phoneInput);
      }

      // 4. Validation for Message (required, min 20 chars, max 1000)
      if (!messageVal || messageVal.length < 20) {
        showError(messageInput, 'Message is required and must be at least 20 characters.');
        isFormValid = false;
      } else if (messageVal.length > 1000) {
        showError(messageInput, 'Message must not exceed 1000 characters.');
        isFormValid = false;
      } else {
        clearError(messageInput);
      }

      // If valid, submit via AJAX with sanitized data
      if (isFormValid) {
        lastSubmitTime = Date.now();

        const submitBtn = document.getElementById('btn-submit');
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = 'Sending...';
        submitBtn.disabled = true;

        // Build sanitized FormData
        const formData = new FormData();
        formData.append('Name', nameVal);
        formData.append('Email', emailVal);
        formData.append('Phone', phoneVal);
        formData.append('ProjectType', document.getElementById('project-type').value);
        formData.append('Message', messageVal);

        fetch('https://formsubmit.co/ajax/abdulmanankakar777@gmail.com', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            // Display Success Banner
            if (successBanner) {
              successBanner.style.display = 'block';
              successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            contactForm.reset();
        })
        .catch(() => {
            alert("There was an error sending your message. Please try again or contact us directly on WhatsApp.");
        })
        .finally(() => {
            submitBtn.innerText = originalBtnText;
            // Keep button disabled for rate limit period
            setTimeout(() => {
              submitBtn.disabled = false;
            }, RATE_LIMIT_MS);
        });
      }
    });

    // Helper functions for showing/clearing error indicators
    function showError(inputElement, errorMessage) {
      inputElement.classList.add('invalid');
      
      // Check if an error label already exists below this element
      let errorLabel = inputElement.parentElement.querySelector('.error-msg');
      if (!errorLabel) {
        errorLabel = document.createElement('span');
        errorLabel.className = 'error-msg';
        inputElement.parentElement.appendChild(errorLabel);
      }
      errorLabel.innerText = errorMessage;
    }

    function clearError(inputElement) {
      inputElement.classList.remove('invalid');
      const errorLabel = inputElement.parentElement.querySelector('.error-msg');
      if (errorLabel) {
        errorLabel.remove();
      }
    }

    // Dynamic input check (clear errors as user types)
    const inputs = contactForm.querySelectorAll('.form-control');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        if (input.classList.contains('invalid')) {
          // Re-evaluate on input
          if (input.id === 'name' && input.value.trim().length >= 3) {
            clearError(input);
          } else if (input.id === 'email') {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (emailRegex.test(input.value.trim())) clearError(input);
          } else if (input.id === 'phone') {
            const phoneDigits = input.value.trim().replace(/\D/g, '');
            if (phoneDigits.length >= 10 && /^[0-9]+$/.test(input.value.trim().replace(/[+() \-]/g, ''))) clearError(input);
          } else if (input.id === 'message' && input.value.trim().length >= 20) {
            clearError(input);
          }
        }
      });
    });
  }

  // ==========================================================================
  // 7. PROJECT IMAGE SLIDER
  // ==========================================================================
  const projectsData = [
    {
      title: "Jinnah International Airport Runway",
      category: "INFRASTRUCTURE",
      images: [
        "projects-images/Jinnah-international-airport-runway-construction1.png",
        "projects-images/Jinnah-international-airport-runway-construction2.png",
        "projects-images/Jinnah-international-airport-runway-construction3.png",
        "projects-images/Jinnah-international-airport-runway-construction4.png"
      ]
    },
    {
      title: "Panjgur - Ghichak - Awaran Highway",
      category: "ROADS & HIGHWAYS",
      images: [
        "projects-images/Panjgur-ghichak-awaran-highway1.png",
        "projects-images/Panjgur-ghichak-awaran-highway2.png",
        "projects-images/Panjgur-ghichak-awaran-highway3.png",
        "projects-images/Panjgur-ghichak-awaran-highway4.png"
      ]
    },
    {
      title: "Ormara Road Navy Project",
      category: "GOVERNMENT & DEFENCE",
      images: [
        "projects-images/Ormara-road-navy-project1.png",
        "projects-images/Ormara-road-navy-project2.png",
        "projects-images/Ormara-road-navy-project3.png",
        "projects-images/Ormara-road-navy-project4.png"
      ]
    }
  ];

  const sliderBgImg = document.getElementById('slider-bg-img');
  const sliderMainImg = document.getElementById('slider-main-img');
  const sliderCategory = document.getElementById('slider-category');
  const sliderTitle = document.getElementById('slider-title');
  const sliderThumbnails = document.getElementById('slider-thumbnails');
  const sliderDots = document.getElementById('slider-dots');
  const btnPrev = document.getElementById('slider-prev');
  const btnNext = document.getElementById('slider-next');

  if (sliderMainImg) {
    let currentProjectIndex = 0;
    let cycleInterval;

    function renderProject(index) {
      const project = projectsData[index];
      
      // Update text
      sliderCategory.textContent = project.category;
      sliderTitle.textContent = project.title;
      
      // Generate dots if needed
      if (sliderDots.children.length === 0) {
        projectsData.forEach((_, i) => {
          const dot = document.createElement('div');
          dot.className = 'slider-dot' + (i === index ? ' active' : '');
          dot.addEventListener('click', () => {
            currentProjectIndex = i;
            renderProject(currentProjectIndex);
            resetCycle();
          });
          sliderDots.appendChild(dot);
        });
      } else {
        Array.from(sliderDots.children).forEach((dot, i) => {
          dot.className = 'slider-dot' + (i === index ? ' active' : '');
        });
      }
      
      // Update main image
      changeMainImage(project.images[0]);
      
      // Render thumbnails — clear safely without innerHTML
      while (sliderThumbnails.firstChild) {
        sliderThumbnails.removeChild(sliderThumbnails.firstChild);
      }
      project.images.forEach((imgSrc, i) => {
        const thumb = document.createElement('img');
        thumb.src = imgSrc;
        thumb.className = 'slider-thumbnail' + (i === 0 ? ' active' : '');
        thumb.draggable = false; // SECURITY: Prevent drag
        thumb.addEventListener('click', () => {
          // Update active thumbnail styling
          Array.from(sliderThumbnails.children).forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
          changeMainImage(imgSrc);
          resetCycle();
        });
        sliderThumbnails.appendChild(thumb);
      });
    }

    function changeMainImage(src) {
      sliderMainImg.classList.add('fade-out');
      if (sliderBgImg) sliderBgImg.style.opacity = '0';
      
      setTimeout(() => {
        sliderMainImg.src = src;
        if (sliderBgImg) sliderBgImg.src = src;
        
        sliderMainImg.classList.remove('fade-out');
        if (sliderBgImg) sliderBgImg.style.opacity = '1';
      }, 250);
    }

    function showNextProject() {
      currentProjectIndex = (currentProjectIndex + 1) % projectsData.length;
      renderProject(currentProjectIndex);
    }

    function showPrevProject() {
      currentProjectIndex = (currentProjectIndex - 1 + projectsData.length) % projectsData.length;
      renderProject(currentProjectIndex);
    }

    function resetCycle() {
      clearInterval(cycleInterval);
      cycleInterval = setInterval(showNextProject, 5000);
    }

    btnPrev.addEventListener('click', () => {
      showPrevProject();
      resetCycle();
    });

    btnNext.addEventListener('click', () => {
      showNextProject();
      resetCycle();
    });

    // Initialize
    renderProject(currentProjectIndex);
    resetCycle();
  }


  // ==========================================================================
  // 8. SECURITY: IMAGE PROTECTION (Right-click & Drag Prevention)
  // ==========================================================================
  const sliderContainer = document.getElementById('project-slider');
  if (sliderContainer) {
    // Disable right-click context menu on the entire slider
    sliderContainer.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Disable drag on all images within the slider
    sliderContainer.addEventListener('dragstart', (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    });
  }


  // Also protect the logo image
  const logoImg = document.querySelector('.logo-img');
  if (logoImg) {
    logoImg.draggable = false;
    logoImg.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }


  // ==========================================================================
  // 9. SECURITY: EMAIL OBFUSCATION (Anti-Harvesting)
  // ==========================================================================
  const emailSpan = document.getElementById('obfuscated-email');
  if (emailSpan) {
    const user = emailSpan.getAttribute('data-user');
    const domain = emailSpan.getAttribute('data-domain');
    if (user && domain) {
      const fullEmail = user + '@' + domain;
      emailSpan.textContent = fullEmail;
      // Remove data attributes so they're no longer in DOM
      emailSpan.removeAttribute('data-user');
      emailSpan.removeAttribute('data-domain');
    }
  }


  // ==========================================================================
  // 10. SECURITY: KEYBOARD SHORTCUT PROTECTION
  // ==========================================================================
  document.addEventListener('keydown', (e) => {
    // Block Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
    }
    // Block Ctrl+S (Save Page)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
    }
    // Block F12 (DevTools)
    if (e.key === 'F12') {
      e.preventDefault();
    }
    // Block Ctrl+Shift+I (DevTools Inspector)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
    }
    // Block Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
    }
    // Block Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
    }
  });

});

// Page preloader
window.addEventListener('load', () => {
  document.body.style.opacity = '1';
});
