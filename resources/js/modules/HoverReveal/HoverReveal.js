import gsap from 'gsap';
import { isEditMode } from '../../core/env';

/**
 * Hover Reveal — image follows cursor inside Container.
 */
export default class HoverReveal {
    constructor(container, config) {
        this.container = container;
        this.config = config;
        // default true for backward compat (legacy configs without key)
        if (this.config.disableOnMobile === undefined) this.config.disableOnMobile = true;
        this.imageEl = null;
        this.fullImg = null;
        this.fallbackEl = null;
        this.tiles = [];
        this.xTo = null;
        this.yTo = null;
        this.isVisible = false;
        this.triggerEl = null;
    }

    shouldInit() {
        // Respect live preview toggle in editor
        if (isEditMode() && this.config.livePreview === false) {
            return false;
        }

        // In editor preview, allow even with reduced-motion / touch when live is On
        if (!isEditMode()) {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                return false;
            }
            if (this.config.disableOnMobile && (window.matchMedia('(hover: none)').matches
                || window.matchMedia('(pointer: coarse)').matches)) {
                return false;
            }
        }

        if (!this.config.imageUrl) {
            return false;
        }

        return true;
    }

    createElements() {
        this.imageEl = document.createElement('div');
        this.imageEl.className = 'emje-hover-reveal__image';
        if (this.config.animation === 'clip') {
            this.imageEl.classList.add('emje-hover-reveal__image--clip');
            var dir = this.config.clipDirection || 'left';
            if (['left', 'right', 'top', 'bottom'].indexOf(dir) === -1) dir = 'left';
            this.imageEl.classList.add('emje-hover-reveal__image--clip-' + dir);
            // Durasi wipe mengikuti kontrol Reveal Duration.
            var wipeDur = parseFloat(this.config.duration);
            if (isNaN(wipeDur)) wipeDur = 0.4;
            wipeDur = Math.max(0.1, Math.min(1, wipeDur));
            this.imageEl.style.transitionDuration = wipeDur + 's';
        }

        // Apply Image Size for quality + display (thumbnail 150, medium 280, large 400, full 600)
        var sizeMap = {
            thumbnail: { w: 150, h: 150 },
            medium: { w: 280, h: 200 },
            large: { w: 400, h: 300 },
            full: { w: 600, h: 400 },
        };
        var sz = sizeMap[this.config.imageSize] || sizeMap.medium;
        this.imageEl.style.width = sz.w + 'px';
        this.imageEl.style.height = sz.h + 'px';

        // Blocks: gambar dipecah jadi kotak-kotak (5x7 = 35).
        // Tiap kotak = potongan gambar itu sendiri, bukan penutup.
        // Awalnya bolong (opacity 0), muncul acak sampai gambar full.
        // Semua ukuran DIBULATKAN ke pixel bulat: pecahan (misal 200/7)
        // bikin browser potong tiap kotak beda-beda = garis potongan.
        if (this.config.animation === 'blocks') {
            this.imageEl.classList.add('emje-hover-reveal__image--blocks');
            this.tiles = [];
            // Grid dinamis dari kontrol (default 5x7 = perilaku lama).
            var cols = parseInt(this.config.cols, 10);
            var rows = parseInt(this.config.rows, 10);
            if (isNaN(cols)) cols = 5;
            if (isNaN(rows)) rows = 7;
            cols = Math.max(2, Math.min(10, cols));
            rows = Math.max(2, Math.min(12, rows));
            var tileW = Math.max(1, Math.round(sz.w / cols));
            var tileH = Math.max(1, Math.round(sz.h / rows));
            var fullW = tileW * cols;
            var fullH = tileH * rows;
            this.imageEl.style.width = fullW + 'px';
            this.imageEl.style.height = fullH + 'px';
            this.imageEl.style.gridTemplateColumns = 'repeat(' + cols + ', ' + tileW + 'px)';
            this.imageEl.style.gridTemplateRows = 'repeat(' + rows + ', ' + tileH + 'px)';
            for (var r = 0; r < rows; r++) {
                for (var c = 0; c < cols; c++) {
                    var tile = document.createElement('div');
                    tile.className = 'emje-hover-reveal__tile';
                    // +1px overlap: jaga-jaga retak raster saat wrapper
                    // digeser pecahan pixel oleh follow. Kelebihan di tepi
                    // dipotong oleh overflow:hidden. Isi overlap = pixel
                    // gambar yang sama persis, jadi tidak kelihatan.
                    tile.style.width = (tileW + 1) + 'px';
                    tile.style.height = (tileH + 1) + 'px';
                    // Isi tile = <img> asli (bukan background + hitungan
                    // manual): browser yang mengerjakan cover untuk semua
                    // kotak + gambar belakang dengan cara yang sama persis,
                    // jadi tidak bisa dobel/geser.
                    var timg = document.createElement('img');
                    timg.className = 'emje-hover-reveal__slice';
                    timg.src = this.config.imageUrl;
                    timg.alt = '';
                    timg.loading = 'lazy';
                    timg.draggable = false;
                    timg.style.width = fullW + 'px';
                    timg.style.height = fullH + 'px';
                    timg.style.left = (-c * tileW) + 'px';
                    timg.style.top = (-r * tileH) + 'px';
                    tile.appendChild(timg);
                    tile.style.opacity = '0';
                    this.imageEl.appendChild(tile);
                    this.tiles.push(tile);
                }
            }
            // Pengaman garis: gambar utuh di BELAKANG tiles, sejajar persis.
            // Celah antar kotak (kalau masih ada) memperlihatkan pixel
            // gambar yang sama = garis tidak kelihatan.
            this.fullImg = document.createElement('img');
            this.fullImg.className = 'emje-hover-reveal__full';
            this.fullImg.src = this.config.imageUrl;
            this.fullImg.alt = '';
            this.fullImg.loading = 'lazy';
            this.fullImg.style.opacity = '0';
            this.imageEl.insertBefore(this.fullImg, this.imageEl.firstChild);
        } else {
            const img = document.createElement('img');
            img.src = this.config.imageUrl;
            img.alt = '';
            img.loading = 'lazy';
            this.imageEl.appendChild(img);
        }
        document.body.appendChild(this.imageEl);

        // Mobile fallback element inside container (only shown on touch via CSS media).
        this.fallbackEl = document.createElement('div');
        this.fallbackEl.className = 'emje-hover-reveal__fallback';
        const fallbackImg = document.createElement('img');
        fallbackImg.src = this.config.imageUrl;
        fallbackImg.alt = '';
        fallbackImg.loading = 'lazy';
        this.fallbackEl.appendChild(fallbackImg);
        this.container.appendChild(this.fallbackEl);
        if (window.matchMedia('(hover: none), (pointer: coarse)').matches) {
            this.container.classList.add('emje-hover-reveal--mobile-fallback');
        }

        // Initial GSAP set for position, scale and rotate (avoid CSS transform conflict)
        gsap.set(this.imageEl, {
            xPercent: -50,
            yPercent: -50,
            scale: 0.9,
            rotation: this.config.rotate ?? 0,
            opacity: 0,
        });

        // GSAP quickTo for smooth follow.
        this.xTo = gsap.quickTo(this.imageEl, 'x', {
            duration: this.config.followSpeed ?? 0.12,
            ease: 'power3',
        });

        this.yTo = gsap.quickTo(this.imageEl, 'y', {
            duration: this.config.followSpeed ?? 0.12,
            ease: 'power3',
        });
    }

    getTriggerElement() {
        if (this.config.triggerArea === 'heading') {
            const heading = this.container.querySelector('h1, h2, h3, h4, h5, h6, .elementor-heading-title');
            return heading || this.container;
        }
        return this.container;
    }

    bindEvents() {
        this.triggerEl = this.getTriggerElement();

        this._onEnter = this.onEnter.bind(this);
        this._onLeave = this.onLeave.bind(this);
        this._onMove = this.onMove.bind(this);
        this.triggerEl.addEventListener('mouseenter', this._onEnter);
        this.triggerEl.addEventListener('mouseleave', this._onLeave);
        this.triggerEl.addEventListener('mousemove', this._onMove);
    }

    onEnter() {
        if (!this.imageEl) {
            return;
        }
        this.isVisible = true;
        this.imageEl.classList.add('emje-hover-reveal__image--visible');

        // Tiap animasi beda jelas.
        // - fade: hanya opacity (ukuran langsung ke target).
        // - clip: tirai terbuka via CSS + opacity (ukuran langsung ke target).
        // - blocks: kotak potongan gambar muncul acak sampai full.
        // Scale on Hover tetap jadi ukuran akhir untuk semua animasi.
        var targetScale = this.config.scale ?? 1;
        var targetRotate = (this.config.rotateHover !== undefined ? this.config.rotateHover : this.config.rotate) ?? 0;
        var anim = this.config.animation || 'fade';
        // Reveal Duration: bawaan = perilaku lama (fade 0.25, clip 0.4).
        var revealDur = parseFloat(this.config.duration);
        if (isNaN(revealDur)) revealDur = anim === 'clip' ? 0.4 : 0.25;
        revealDur = Math.max(0.1, Math.min(1, revealDur));
        if (anim === 'blocks') {
            gsap.set(this.imageEl, { scale: targetScale });
            gsap.to(this.imageEl, {
                rotation: targetRotate,
                opacity: 1,
                duration: 0.2,
                ease: 'power2.out',
                overwrite: 'auto',
            });
            // Blocks = fade saja (tanpa scale): kotak selalu sejajar
            // gambar belakang sejak awal, jadi tidak ada momen dobel.
            // Urutan + kecepatan dari kontrol. Rows = baris per baris
            // dari atas, Random = acak kayak glitch.
            var order = this.config.blockOrder || 'random';
            if (['random', 'rows'].indexOf(order) === -1) order = 'random';
            var step = parseFloat(this.config.blockSpeed);
            if (isNaN(step)) step = 0.02;
            step = Math.max(0.005, Math.min(0.06, step));
            gsap.fromTo(this.tiles,
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: 0.3,
                    ease: 'power1.out',
                    overwrite: true,
                    stagger: { each: step, from: order === 'rows' ? 'start' : 'random' },
                });
            // Gambar pengaman: muncul belakangan, pas kotak terakhir
            // hampir mendarat. Jeda mengikuti jumlah kotak (bukan angka
            // tetap) supaya pas di grid besar maupun kecil.
            if (this.fullImg) {
                var backDelay = Math.max(0.2, step * this.tiles.length * 0.75);
                gsap.fromTo(this.fullImg,
                    { opacity: 0 },
                    { opacity: 1, duration: 0.3, delay: backDelay, ease: 'power1.out', overwrite: 'auto' });
            }
        } else if (anim === 'clip') {
            gsap.set(this.imageEl, { scale: targetScale });
            gsap.to(this.imageEl, {
                rotation: targetRotate,
                opacity: 1,
                duration: revealDur,
                ease: 'power2.out',
            });
        } else {
            gsap.set(this.imageEl, { scale: targetScale });
            gsap.to(this.imageEl, {
                rotation: targetRotate,
                opacity: 1,
                duration: revealDur,
                ease: 'power2.out',
            });
        }
    }

    onLeave() {
        if (!this.imageEl) {
            return;
        }
        this.isVisible = false;
        var anim = this.config.animation || 'fade';
        var revealDur = parseFloat(this.config.duration);
        if (isNaN(revealDur)) revealDur = anim === 'clip' ? 0.4 : 0.25;
        revealDur = Math.max(0.1, Math.min(1, revealDur));
        // Blocks: keluar langsung hilang (tanpa animasi tutup).
        if (anim === 'blocks') {
            try {
                if (this.tiles && this.tiles.length) gsap.killTweensOf(this.tiles);
                if (this.fullImg) gsap.killTweensOf(this.fullImg);
            } catch (e) {}
            gsap.to(this.imageEl, {
                rotation: this.config.rotate ?? 0,
                opacity: 0,
                duration: 0.15,
                ease: 'power2.in',
                overwrite: 'auto',
                onComplete: function() {
                    if (this.imageEl) {
                        this.imageEl.classList.remove('emje-hover-reveal__image--visible');
                        try { gsap.set(this.tiles, { opacity: 0 }); } catch (e) {}
                        try { gsap.set(this.fullImg, { opacity: 0 }); } catch (e) {}
                        try { gsap.set(this.imageEl, { scale: 0.9 }); } catch (e) {}
                    }
                }.bind(this),
            });
        } else {
            gsap.to(this.imageEl, {
                rotation: this.config.rotate ?? 0,
                opacity: 0,
                duration: revealDur,
                ease: 'power2.in',
                onComplete: function() {
                    if (this.imageEl) {
                        this.imageEl.classList.remove('emje-hover-reveal__image--visible');
                        try { gsap.set(this.imageEl, { scale: 0.9 }); } catch (e) {}
                    }
                }.bind(this),
            });
        }
    }

    onMove(e) {
        if (!this.isVisible || !this.xTo || !this.yTo) {
            return;
        }

        var offsetX = this.config.offsetX || 0;
        var offsetY = this.config.offsetY || 0;
        this.xTo(e.clientX + offsetX);
        this.yTo(e.clientY + offsetY);
    }

    init() {
        if (!this.shouldInit()) {
            return false;
        }

        this.createElements();
        this.bindEvents();
        // Mirror PHP render parity (class="emje-hover-reveal"); idempotent.
        try { this.container.classList.add('emje-hover-reveal'); } catch (e) {}
        return true;
    }

    destroy() {
        if (this.triggerEl) {
            try {
                if (this._onEnter) this.triggerEl.removeEventListener('mouseenter', this._onEnter);
                if (this._onLeave) this.triggerEl.removeEventListener('mouseleave', this._onLeave);
                if (this._onMove) this.triggerEl.removeEventListener('mousemove', this._onMove);
            } catch (e) {}
        }
        if (this.xTo && typeof this.xTo.kill === 'function') {
            try { this.xTo.kill(); } catch (e) {}
        }
        if (this.yTo && typeof this.yTo.kill === 'function') {
            try { this.yTo.kill(); } catch (e) {}
        }
        if (this.imageEl) {
            try { gsap.killTweensOf(this.imageEl); } catch (e) {}
        }
        if (this.tiles && this.tiles.length) {
            try { gsap.killTweensOf(this.tiles); } catch (e) {}
        }
        if (this.imageEl && this.imageEl.parentNode) {
            this.imageEl.parentNode.removeChild(this.imageEl);
        }
        if (this.fallbackEl && this.fallbackEl.parentNode) {
            this.fallbackEl.parentNode.removeChild(this.fallbackEl);
        }
        try { this.container.classList.remove('emje-hover-reveal--mobile-fallback'); } catch (e) {}
        this.imageEl = null;
        this.fullImg = null;
        this.tiles = [];
        this.fallbackEl = null;
        this.triggerEl = null;
    }

    static initAll() {
        const containers = document.querySelectorAll('[data-emje-hover-reveal]');
        containers.forEach((el) => {
            if (el.dataset.emjeHoverRevealInitialized === 'true') {
                return;
            }

            let config;
            try {
                config = JSON.parse(el.getAttribute('data-emje-hover-reveal'));
            } catch (e) {
                return;
            }

            const instance = new HoverReveal(el, config);
            if (instance.init()) {
                el.dataset.emjeHoverRevealInitialized = 'true';
                HoverReveal._instances.set(el, instance);
            }
        });
    }

    static reInit(el) {
        const old = HoverReveal._instances.get(el);
        if (old) {
            old.destroy();
            HoverReveal._instances.delete(el);
            delete el.dataset.emjeHoverRevealInitialized;
        }
        let config;
        try {
            config = JSON.parse(el.getAttribute('data-emje-hover-reveal'));
        } catch (e) {
            return;
        }
        const instance = new HoverReveal(el, config);
        if (instance.init()) {
            el.dataset.emjeHoverRevealInitialized = 'true';
            HoverReveal._instances.set(el, instance);
        }
    }
}

HoverReveal._instances = new WeakMap();
if (typeof window !== 'undefined') {
    window.EmjeMotionHoverReveal = HoverReveal;
}
