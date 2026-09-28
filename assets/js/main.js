(() => {
    'use strict';

    const doc = document;
    const root = doc.documentElement;
    const body = doc.body;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const canAnimate = () => !reducedMotion.matches;
    const $ = (selector, context = doc) => context.querySelector(selector);
    const $$ = (selector, context = doc) => [...context.querySelectorAll(selector)];

    const loader = $('.page-loader');
    const loaderPercent = $('.page-loader-percent');
    const loaderFill = $('.page-loader-fill');
    let loaderValue = 0;
    let loaderTimer;

    const paintLoader = (value) => {
        loaderValue = Math.min(value, 100);
        if (loaderPercent) loaderPercent.textContent = `${loaderValue}%`;
        if (loaderFill) loaderFill.style.width = `${loaderValue}%`;
    };
    const dismissLoader = () => {
        window.clearInterval(loaderTimer);
        paintLoader(100);
        window.setTimeout(() => {
            body.classList.add('is-loaded');
            loader?.setAttribute('aria-hidden', 'true');
        }, canAnimate() ? 240 : 0);
    };
    if (canAnimate()) {
        loaderTimer = window.setInterval(() => paintLoader(Math.min(loaderValue + Math.floor(Math.random() * 13) + 5, 92)), 130);
    } else paintLoader(100);
    window.addEventListener('load', dismissLoader, { once: true });
    window.addEventListener('pageshow', (event) => { if (event.persisted) dismissLoader(); });
    window.setTimeout(dismissLoader, 4500);

    const menuToggle = $('.menu-toggle');
    const siteNav = $('.site-nav');
    const closeMenu = () => {
        siteNav?.classList.remove('is-open');
        body.classList.remove('menu-open');
        menuToggle?.setAttribute('aria-expanded', 'false');
    };
    menuToggle?.setAttribute('aria-label', 'Open navigation');
    menuToggle?.addEventListener('click', () => {
        const open = !siteNav?.classList.contains('is-open');
        siteNav?.classList.toggle('is-open', open);
        body.classList.toggle('menu-open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    $$('a', siteNav || doc).forEach((link) => link.addEventListener('click', closeMenu));
    doc.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') { closeMenu(); menuToggle?.focus(); }
    });
    doc.addEventListener('pointerdown', (event) => {
        if (siteNav?.classList.contains('is-open') && !siteNav.contains(event.target) && !menuToggle?.contains(event.target)) closeMenu();
    });

    const typedElement = $('.typed-text');
    if (typedElement && canAnimate()) {
        let words = [];
        try { words = JSON.parse(typedElement.dataset.words || '[]'); } catch { words = []; }
        if (words.length) {
            let wordIndex = 0;
            let charIndex = words[0].length;
            let deleting = true;
            const type = () => {
                const word = words[wordIndex];
                typedElement.textContent = word.slice(0, Math.max(charIndex, 0));
                let delay = deleting ? 46 : 82;
                if (!deleting && charIndex >= word.length) { deleting = true; delay = 1500; }
                else if (deleting && charIndex <= 0) { deleting = false; wordIndex = (wordIndex + 1) % words.length; delay = 260; }
                charIndex += deleting ? -1 : 1;
                window.setTimeout(type, delay);
            };
            window.setTimeout(type, 900);
        }
    }

    const reveals = $$('.reveal');
    reveals.forEach((element, index) => element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 70}ms`));
    if ('IntersectionObserver' in window && canAnimate()) {
        const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }), { threshold: 0.1, rootMargin: '0px 0px -7% 0px' });
        reveals.forEach((element) => observer.observe(element));
    } else reveals.forEach((element) => element.classList.add('is-visible'));

    const counters = $$('.counter');
    const animateCounter = (counter) => {
        const target = Number(counter.dataset.target || 0);
        if (!canAnimate()) { counter.textContent = String(target); return; }
        const start = performance.now();
        const step = (now) => {
            const progress = Math.min((now - start) / 1300, 1);
            counter.textContent = String(Math.round((1 - Math.pow(1 - progress, 4)) * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animateCounter(entry.target);
            observer.unobserve(entry.target);
        }), { threshold: 0.45 });
        counters.forEach((counter) => observer.observe(counter));
    } else counters.forEach(animateCounter);

    const header = $('.site-header');
    const progressBar = $('.scroll-progress span');
    const heroSection = $('.hero-section');
    const heroStoryProgress = $('.hero-story-progress');
    const orbs = $$('.hero-orb');
    let scrollTicking = false;
    const renderScroll = () => {
        const top = window.scrollY;
        const max = Math.max(root.scrollHeight - window.innerHeight, 1);
        if (progressBar) progressBar.style.transform = `scaleX(${Math.min(top / max, 1)})`;
        header?.classList.toggle('scrolled', top > 18);
        if (canAnimate()) orbs.forEach((orb, index) => {
            const offset = Math.min(top * 0.09, 120) * (index ? -1 : 1);
            orb.style.transform = `translate3d(0, ${offset}px, 0)`;
        });
        if (heroSection && heroStoryProgress) {
            const rect = heroSection.getBoundingClientRect();
            const total = Math.max(rect.height - window.innerHeight * 0.3, 1);
            const consumed = Math.min(Math.max(-rect.top, 0), total);
            heroStoryProgress.style.transform = `scaleY(${0.18 + (consumed / total) * 0.82})`;
        }
        scrollTicking = false;
    };
    window.addEventListener('scroll', () => {
        if (!scrollTicking) { requestAnimationFrame(renderScroll); scrollTicking = true; }
    }, { passive: true });
    renderScroll();

    const sections = $$('main section[id]');
    const navLinks = $$('.site-nav a[href^="#"]');
    if ('IntersectionObserver' in window && sections.length) {
        const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinks.forEach((link) => {
                const active = link.getAttribute('href') === `#${entry.target.id}`;
                link.classList.toggle('is-active', active);
                if (active) link.setAttribute('aria-current', 'page');
                else link.removeAttribute('aria-current');
            });
        }), { rootMargin: '-30% 0px -60% 0px' });
        sections.forEach((section) => observer.observe(section));
    }

    const depthElements = $$('[data-depth]');
    const heroCursorLight = $('.hero-cursor-light');
    if (finePointer.matches && canAnimate()) {
        $$('.spotlight-card').forEach((card) => card.addEventListener('pointermove', (event) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--spot-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
            card.style.setProperty('--spot-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
        }, { passive: true }));
        heroSection?.addEventListener('pointermove', (event) => {
            const rect = heroSection.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            if (heroCursorLight) heroCursorLight.style.transform = `translate3d(${x - 170}px, ${y - 170}px, 0)`;
            const px = x / rect.width - 0.5;
            const py = y / rect.height - 0.5;
            depthElements.forEach((element) => {
                const depth = Number(element.dataset.depth || 0);
                element.style.transform = `translate3d(${px * depth * 28}px, ${py * depth * 28}px, 0)`;
            });
        }, { passive: true });
        heroSection?.addEventListener('pointerleave', () => depthElements.forEach((element) => { element.style.transform = ''; }));
        $$('.magnetic-btn').forEach((button) => {
            button.addEventListener('pointermove', (event) => {
                const rect = button.getBoundingClientRect();
                const x = event.clientX - rect.left - rect.width / 2;
                const y = event.clientY - rect.top - rect.height / 2;
                button.style.transform = `translate3d(${x * 0.11}px, ${y * 0.11}px, 0)`;
                const inner = $('span', button);
                if (inner) inner.style.transform = `translate3d(${x * 0.05}px, ${y * 0.05}px, 0)`;
            });
            button.addEventListener('pointerleave', () => {
                button.style.transform = '';
                const inner = $('span', button);
                if (inner) inner.style.transform = '';
            });
        });
    }

    const contactForm = $('.contact-form');
    const formAlert = $('.form-alert');
    contactForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!contactForm.reportValidity()) return;
        const data = new FormData(contactForm);
        const message = ['Portfolio Inquiry', '', `Name: ${data.get('name')}`, `Email: ${data.get('email')}`, `Subject: ${data.get('subject')}`, '', 'Project brief:', String(data.get('message') || '')].join('\n');
        const url = `https://wa.me/${contactForm.dataset.whatsappNumber}?text=${encodeURIComponent(message)}`;
        if (formAlert) {
            formAlert.hidden = false;
            formAlert.className = 'form-alert success';
            formAlert.textContent = 'Your brief is ready. WhatsApp is opening so you can review and send it.';
        }
        window.open(url, '_blank', 'noopener,noreferrer');
    });

    reducedMotion.addEventListener?.('change', () => {
        if (reducedMotion.matches) {
            reveals.forEach((element) => element.classList.add('is-visible'));
            depthElements.forEach((element) => { element.style.transform = ''; });
        }
    });
    root.classList.add('enhanced');
})();
