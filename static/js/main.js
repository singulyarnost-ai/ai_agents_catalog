document.addEventListener('DOMContentLoaded', () => {
    // 1. ПАРСИНГ ДАННЫХ ИЗ ТЕГА SCRIPT
    const agentsRawData = document.getElementById('agentsData').textContent;
    const agentsData = JSON.parse(agentsRawData);
    const agentsMap = new Map(agentsData.map(a => [a.id, a]));

    // 2. ИНТЕРАКТИВНЫЙ ХАОС ЧАСТИЦ (CANVAS)
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 85;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }

        class StarParticle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2.2 + 0.8;
                this.speedX = (Math.random() - 0.5) * 0.45;
                this.speedY = (Math.random() - 0.5) * 0.35;
                this.opacity = Math.random() * 0.6 + 0.2;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 195, 216, ${this.opacity})`;
                ctx.shadowBlur = 8;
                ctx.shadowColor = 'rgba(0, 195, 216, 0.8)';
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        function initStars() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new StarParticle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', () => {
            resize();
            initStars();
        });

        resize();
        initStars();
        animate();
    }

    // 3. ФИЛЬТРАЦИЯ И ЖИВОЙ ПОИСК
    const searchInput = document.getElementById('searchInput');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const cards = document.querySelectorAll('.agent-card');
    const counter = document.getElementById('counter');
    const noResults = document.getElementById('noResults');

    let currentCategory = 'all';
    let searchQuery = '';

    function filterCards() {
        let visibleCount = 0;

        cards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const title = card.getAttribute('data-title').toLowerCase();
            const desc = card.getAttribute('data-short').toLowerCase();
            const tags = card.getAttribute('data-tags').toLowerCase();

            const matchesCategory = (currentCategory === 'all' || cardCategory === currentCategory);
            const matchesSearch = !searchQuery || 
                                  title.includes(searchQuery) || 
                                  desc.includes(searchQuery) || 
                                  tags.includes(searchQuery);

            if (matchesCategory && matchesSearch) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        counter.textContent = `Показано агентов: ${visibleCount} из ${cards.length}`;
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category');
            filterCards();
        });
    });

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        filterCards();
    });

    // 4. МОДАЛЬНОЕ ОКНО СПЕЦИФИКАЦИИ АГЕНТА
    const modal = document.getElementById('agentModal');
    const modalClose = document.getElementById('modalClose');
    const modalBackBtn = document.getElementById('modalBackBtn');
    const modalBadge = document.getElementById('modalBadge');
    const modalCategory = document.getElementById('modalCategory');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalBenefits = document.getElementById('modalBenefits');
    const modalFeatures = document.getElementById('modalFeatures');
    const modalPayback = document.getElementById('modalPayback');
    const modalCtaText = document.getElementById('modalCtaText');

    function openModal(agentId) {
        const agent = agentsMap.get(agentId);
        if (!agent) return;

        modalBadge.textContent = agent.badge;
        modalCategory.textContent = agent.category;
        modalTitle.textContent = agent.title;
        modalDesc.textContent = agent.modal_desc;
        modalBenefits.textContent = agent.business_benefits;
        modalPayback.textContent = agent.payback_period;
        modalCtaText.textContent = agent.cta_text;

        modalFeatures.innerHTML = '';
        agent.features.forEach(feat => {
            const li = document.createElement('li');
            li.textContent = feat;
            modalFeatures.appendChild(li);
        });

        modal.style.display = 'flex';
        // Сброс прокрутки модалки наверх при открытии
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) modalContent.scrollTop = 0;
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    // Закрытие по крестику
    modalClose.addEventListener('click', closeModal);

    // Закрытие по кнопке "Возврат в список"
    if (modalBackBtn) {
        modalBackBtn.addEventListener('click', closeModal);
    }

    // Закрытие по клику вне окна
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Закрытие по клавише Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });

    // Делегирование кликов по карточкам и кнопкам внутри карточек
    document.getElementById('agentsGrid').addEventListener('click', (e) => {
        const card = e.target.closest('.agent-card');
        if (card) {
            const agentId = card.getAttribute('data-id');
            openModal(agentId);
        }
    });
});