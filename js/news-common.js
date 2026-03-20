(function() {
    let modalElements;
    let lastActiveElement;

    function getSiteRootUrl() {
        const baseUrl = new URL(document.baseURI);
        let path = baseUrl.pathname;

        if (!path.endsWith('/')) {
            path = path.replace(/[^/]+$/, '');
        }

        if (path.endsWith('/pages/')) {
            path = path.slice(0, -'pages/'.length);
        }

        return new URL(path, baseUrl);
    }

    function setupPageChrome() {
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        const navbar = document.querySelector('.navbar');
        const syncMenuState = () => {
            if (navbar && navLinks) {
                navbar.classList.toggle('menu-open', navLinks.classList.contains('active'));
            }
        };
        const syncNavbarState = () => {
            if (navbar) {
                navbar.classList.toggle('scrolled', window.scrollY > 50);
            }
        };

        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                hamburger.classList.toggle('active');
                syncMenuState();
            });

            document.addEventListener('click', event => {
                if (!navLinks.contains(event.target) && !hamburger.contains(event.target)) {
                    navLinks.classList.remove('active');
                    hamburger.classList.remove('active');
                    syncMenuState();
                }
            });

            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    navLinks.classList.remove('active');
                    hamburger.classList.remove('active');
                    syncMenuState();
                }
            });
        }

        window.addEventListener('scroll', syncNavbarState, { passive: true });
        syncNavbarState();
        syncMenuState();
    }

    async function loadNewsData() {
        const response = await fetch(new URL('data/news.json', getSiteRootUrl()));

        if (!response.ok) {
            throw new Error(`Failed to load news data: ${response.status}`);
        }

        const data = await response.json();

        return data
            .map((item, index) => normalizeNewsItem(item, index))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    function normalizeNewsItem(item, index) {
        const summary = typeof item?.summary === 'string' ? item.summary.trim() : '';

        return {
            ...item,
            id: item?.id || `news-${item?.date || 'undated'}-${index + 1}`,
            summary,
            contentBlocks: normalizeContentBlocks(item?.content, summary)
        };
    }

    function normalizeContentBlocks(content, summary) {
        if (!Array.isArray(content) || !content.length) {
            return summary ? [{ type: 'paragraph', text: summary }] : [];
        }

        const blocks = content.flatMap(block => {
            if (typeof block === 'string') {
                return block.trim() ? [{ type: 'paragraph', text: block.trim() }] : [];
            }

            if (!block || typeof block !== 'object' || !block.type) {
                return [];
            }

            if (block.type === 'paragraph' && typeof block.text === 'string' && block.text.trim()) {
                return [{ type: 'paragraph', text: block.text.trim() }];
            }

            if (block.type === 'heading' && typeof block.text === 'string' && block.text.trim()) {
                return [{ type: 'heading', text: block.text.trim() }];
            }

            if (block.type === 'image' && typeof block.src === 'string' && block.src.trim()) {
                return [{
                    type: 'image',
                    src: block.src.trim(),
                    alt: typeof block.alt === 'string' ? block.alt.trim() : '',
                    caption: typeof block.caption === 'string' ? block.caption.trim() : ''
                }];
            }

            if (block.type === 'gallery' && Array.isArray(block.images)) {
                const images = block.images
                    .filter(image => image && typeof image.src === 'string' && image.src.trim())
                    .map(image => ({
                        src: image.src.trim(),
                        alt: typeof image.alt === 'string' ? image.alt.trim() : '',
                        caption: typeof image.caption === 'string' ? image.caption.trim() : ''
                    }));

                return images.length ? [{ type: 'gallery', images }] : [];
            }

            return [];
        });

        return blocks.length ? blocks : (summary ? [{ type: 'paragraph', text: summary }] : []);
    }

    function resolveSitePath(path) {
        if (!path) {
            return '';
        }

        if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) {
            return path;
        }

        return new URL(path.replace(/\\/g, '/').replace(/^\.?\//, ''), getSiteRootUrl()).href;
    }

    function resolveArticleAssetPath(path, articleUrl) {
        if (!path || path.startsWith('#') || /^(https?:)?\/\//.test(path) || path.startsWith('data:')) {
            return path;
        }

        const normalizedPath = path
            .replace(/\\/g, '/')
            .replace(/^\.\.\/news\//, '../');

        return new URL(normalizedPath, articleUrl).href;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }

    function getCategoryName(category) {
        const categories = {
            research: '研究成果',
            event: '组内活动'
        };

        return categories[category] || category;
    }

    function ensureNewsModal() {
        if (modalElements) {
            return modalElements;
        }

        const modal = document.createElement('div');
        modal.className = 'news-modal';
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = `
            <div class="news-modal__backdrop"></div>
            <div class="news-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="newsModalTitle">
                <button class="news-modal__close" type="button" aria-label="关闭新闻详情">×</button>
                <div class="news-modal__body">
                    <div class="news-modal__loading">加载中...</div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeButton = modal.querySelector('.news-modal__close');
        const backdrop = modal.querySelector('.news-modal__backdrop');
        const body = modal.querySelector('.news-modal__body');

        const close = () => closeNewsModal();
        closeButton.addEventListener('click', close);
        backdrop.addEventListener('click', close);

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && modal.classList.contains('is-open')) {
                close();
            }
        });

        modalElements = { modal, body, closeButton };
        return modalElements;
    }

    async function openNewsModal(news) {
        const { modal, body, closeButton } = ensureNewsModal();

        lastActiveElement = document.activeElement;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('news-modal-open');
        body.innerHTML = '<div class="news-modal__loading">加载中...</div>';

        try {
            const articleMarkup = await loadArticleMarkup(news);
            const linksMarkup = Array.isArray(news.links) && news.links.length
                ? `
                    <section class="news-article__links">
                        <h2>相关链接</h2>
                        <ul>
                            ${news.links.map(link => `
                                <li><a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label}</a></li>
                            `).join('')}
                        </ul>
                    </section>
                `
                : '';

            body.innerHTML = `
                <article class="news-article">
                    <div class="news-article__content">
                        <div class="news-article__meta">
                            <span>${formatDate(news.date)}</span>
                            <span class="news-article__category">${getCategoryName(news.category)}</span>
                        </div>
                        <h1 class="news-article__title" id="newsModalTitle">${news.title}</h1>
                        <div class="news-article__summary">${news.summary || '暂无摘要'}</div>
                        <div class="news-article__body">
                            ${articleMarkup}
                        </div>
                        ${linksMarkup}
                    </div>
                </article>
            `;
            closeButton.focus();
        } catch (error) {
            console.error('加载新闻详情失败:', error);
            body.innerHTML = '<div class="news-modal__loading">新闻详情加载失败，请稍后再试。</div>';
            closeButton.focus();
        }
    }

    function closeNewsModal() {
        const elements = ensureNewsModal();
        elements.modal.classList.remove('is-open');
        elements.modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('news-modal-open');

        if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
            lastActiveElement.focus();
        }
    }

    async function loadArticleMarkup(news) {
        if (news.articlePath) {
            const articleUrl = resolveSitePath(news.articlePath);
            const response = await fetch(articleUrl);

            if (!response.ok) {
                throw new Error(`Failed to load article content: ${response.status}`);
            }

            const html = await response.text();
            return normalizeArticleMarkup(html, articleUrl);
        }

        return renderContentBlocks(news.contentBlocks);
    }

    function normalizeArticleMarkup(html, articleUrl) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;

        wrapper.querySelectorAll('img[src], source[src]').forEach(node => {
            node.setAttribute('src', resolveArticleAssetPath(node.getAttribute('src'), articleUrl));
        });

        wrapper.querySelectorAll('a[href]').forEach(node => {
            const href = node.getAttribute('href');

            if (href && !href.startsWith('#')) {
                node.setAttribute('href', resolveArticleAssetPath(href, articleUrl));
            }
        });

        return wrapper.innerHTML;
    }

    function renderContentBlocks(blocks) {
        return blocks.map(block => {
            if (block.type === 'paragraph') {
                return `<p>${block.text}</p>`;
            }

            if (block.type === 'heading') {
                return `<h2>${block.text}</h2>`;
            }

            if (block.type === 'image') {
                return renderFigure(block);
            }

            if (block.type === 'gallery') {
                return `
                    <div class="detail-gallery">
                        ${block.images.map(image => renderFigure(image)).join('')}
                    </div>
                `;
            }

            return '';
        }).join('');
    }

    function renderFigure(image) {
        const alt = image.alt || '';
        const caption = image.caption ? `<figcaption>${image.caption}</figcaption>` : '';

        return `
            <figure class="detail-figure">
                <img src="${resolveSitePath(image.src)}" alt="${alt}">
                ${caption}
            </figure>
        `;
    }

    window.NewsUtils = {
        closeNewsModal,
        formatDate,
        getCategoryName,
        loadNewsData,
        loadArticleMarkup,
        openNewsModal,
        resolveSitePath,
        setupPageChrome
    };
})();
