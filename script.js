/**
 * Portfolio Application Controller
 * - Night / Day theme controller with automatic CSS media query browser detection
 * - Left vertical sidebar navigation & responsive mobile drawer
 * - ScrollSpy for active section highlighting
 * - Interactive portfolio assistant chat simulation
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. THEME CONTROLLER (NIGHT / DAY MODE)
     ========================================================================== */
  const themeButtons = [
    document.getElementById('sidebar-theme-toggle'),
    document.getElementById('mobile-theme-toggle')
  ].filter(Boolean);

  const themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const STORAGE_KEY = 'portfolio-theme-preference';

  function getEffectiveTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    return themeQuery.matches ? 'dark' : 'light';
  }

  function applyTheme(theme, isUserManual = false) {
    if (isUserManual) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(STORAGE_KEY, theme);
    } else {
      const savedTheme = localStorage.getItem(STORAGE_KEY);
      if (!savedTheme) {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
    }

    const isDark = (document.documentElement.getAttribute('data-theme') || (themeQuery.matches ? 'dark' : 'light')) === 'dark';

    themeButtons.forEach((btn) => {
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
      
      const label = btn.querySelector('.theme-toggle-label');
      if (label) {
        if (btn.id === 'mobile-theme-toggle') {
          label.textContent = isDark ? '☀️' : '🌙';
        } else {
          label.textContent = isDark ? 'Dark 🌙' : 'Light ☀️';
        }
      }
    });
  }

  // Initial load
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    applyTheme(saved, true);
  } else {
    applyTheme(themeQuery.matches ? 'dark' : 'light', false);
  }

  // React to OS/Browser default theme preference changes
  if (themeQuery.addEventListener) {
    themeQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light', false);
      }
    });
  }

  // Toggle button click handlers
  themeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const current = getEffectiveTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
    });
  });

  /* ==========================================================================
     2. VERTICAL SIDEBAR NAVIGATION & MOBILE DRAWER
     ========================================================================== */
  const sidebar = document.getElementById('sidebar-nav');
  const backdrop = document.getElementById('sidebar-backdrop');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.querySelectorAll('.sidebar-link');

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
    if (mobileToggle) {
      mobileToggle.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
    if (mobileToggle) {
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = sidebar && sidebar.classList.contains('open');
      if (isOpen) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeSidebar);
  }

  // Escape key closes mobile drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
      closeSidebar();
      if (mobileToggle) mobileToggle.focus();
    }
  });

  // Clicking any link in mobile drawer closes it smoothly
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1024) {
        closeSidebar();
      }
    });
  });

  /* ==========================================================================
     3. SCROLLSPY (ACTIVE SECTION HIGHLIGHTING)
     ========================================================================== */
  const sectionIds = [
    'hero',
    'about',
    'skills',
    'timeline',
    'projects',
    'testimonials',
    'chat',
    'contact'
  ];

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function setActiveLink(activeId) {
    navLinks.forEach((link) => {
      const target = link.getAttribute('data-nav-target') || link.getAttribute('href').replace('#', '');
      if (target === activeId) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  if ('IntersectionObserver' in window && sections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((sec) => sectionObserver.observe(sec));
  }

  /* ==========================================================================
     4. INTERACTIVE ASSISTANT CHAT CONSOLE
     ========================================================================== */
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');

  const assistantAnswers = [
    "Chinmayi is proficient in Java, C, Python, Object-Oriented Programming (OOP), Data Structures, and MySQL.",
    "Her featured projects include CropShield AI (AI/IoT agriculture monitoring), Smart Parking System (Arduino/ESP32 sensor dashboard), and Problems Faced by Banks (FinTech systems research).",
    "She also works with Web Technologies (HTML, CSS, JavaScript) and specialized tools like AI Agents, GIS, and Satellite Data.",
    "You can get in touch directly via email at chinmayimallikarjunn@gmail.com or connect on LinkedIn and GitHub!"
  ];

  let answerIndex = 0;

  if (chatForm && chatInput && chatMessages) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = chatInput.value.trim();
      if (!message) return;

      // Add user message
      const userDiv = document.createElement('div');
      userDiv.className = 'chat-msg user-msg';
      userDiv.innerHTML = `
        <span class="chat-sender">You:</span>
        <p>${escapeHTML(message)}</p>
      `;
      chatMessages.appendChild(userDiv);
      chatInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Simulate Assistant Response
      setTimeout(() => {
        const reply = assistantAnswers[answerIndex % assistantAnswers.length];
        answerIndex++;

        const botDiv = document.createElement('div');
        botDiv.className = 'chat-msg bot-msg';
        botDiv.innerHTML = `
          <span class="chat-sender">Assistant:</span>
          <p>${reply}</p>
        `;
        chatMessages.appendChild(botDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 500);
    });
  }

  function escapeHTML(str) {
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
  }
})();
