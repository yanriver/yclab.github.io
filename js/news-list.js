document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.news-tab-btn');
    const newsContent = document.getElementById('newsContent');
    const pageSize = 6;
    let allNews = [];
    let currentTab = 'all';
    let currentPage = 1;

    NewsUtils.setupPageChrome();
    loadNews();

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(item => item.classList.remove('active'));
            button.classList.add('active');
            currentTab = button.dataset.tab;
            currentPage = 1;
            renderCurrentView();
        });
    });

    async function loadNews() {
        try {
            allNews = await NewsUtils.loadNewsData();
            renderCurrentView();
        } catch (error) {
            console.error('加载新闻数据失败:', error);
            newsContent.innerHTML = '<div class="no-news">无法加载新闻数据，请稍后再试。</div>';
        }
    }

    function renderCurrentView() {
        const filteredNews = currentTab === 'all'
            ? allNews
            : allNews.filter(news => news.category === currentTab);

        renderNewsList(filteredNews, currentPage);
    }

    function renderNewsList(newsItems, page) {
        if (!newsItems.length) {
            newsContent.innerHTML = '<div class="no-news">当前分类下暂无新闻。</div>';
            return;
        }

        const totalPages = Math.max(1, Math.ceil(newsItems.length / pageSize));
        const safePage = Math.min(Math.max(1, page), totalPages);
        currentPage = safePage;
        const startIndex = (safePage - 1) * pageSize;
        const pagedNews = newsItems.slice(startIndex, startIndex + pageSize);

        newsContent.innerHTML = `
            <div class="news-list">
                ${pagedNews.map(news => `
                    <article class="news-item" data-news-id="${news.id}" tabindex="0" role="button" aria-label="查看新闻：${news.title}">
                        <div class="news-item-content">
                            <div class="news-date">📅 ${NewsUtils.formatDate(news.date)}</div>
                            <h2 class="news-title">${news.title}</h2>
                            <div class="news-summary">${news.summary || '暂无摘要'}</div>
                            <div class="news-meta">
                                <span class="news-category">${NewsUtils.getCategoryName(news.category)}</span>
                            </div>
                        </div>
                        ${news.image ? `
                            <div class="news-image">
                                <img src="${NewsUtils.resolveSitePath(news.image)}" alt="${news.title}" loading="lazy">
                            </div>
                        ` : ''}
                    </article>
                `).join('')}
            </div>
            ${renderPagination(totalPages, safePage)}
        `;

        newsContent.querySelectorAll('.news-item[data-news-id]').forEach(card => {
            card.addEventListener('click', () => {
                const news = allNews.find(item => item.id === card.dataset.newsId);

                if (news) {
                    NewsUtils.openNewsModal(news);
                }
            });

            card.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    const news = allNews.find(item => item.id === card.dataset.newsId);

                    if (news) {
                        NewsUtils.openNewsModal(news);
                    }
                }
            });
        });

        newsContent.querySelectorAll('.pagination-btn[data-page]').forEach(button => {
            button.addEventListener('click', () => {
                const nextPage = Number(button.dataset.page);

                if (!Number.isNaN(nextPage) && nextPage !== currentPage) {
                    currentPage = nextPage;
                    renderCurrentView();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    }

    function renderPagination(totalPages, activePage) {
        if (totalPages <= 1) {
            return '';
        }

        return `
            <div class="news-pagination" aria-label="新闻分页">
                <button class="pagination-btn" data-page="${activePage - 1}" ${activePage === 1 ? 'disabled' : ''}>上一页</button>
                ${Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;

                    return `
                        <button class="pagination-btn ${page === activePage ? 'active' : ''}" data-page="${page}">
                            ${page}
                        </button>
                    `;
                }).join('')}
                <button class="pagination-btn" data-page="${activePage + 1}" ${activePage === totalPages ? 'disabled' : ''}>下一页</button>
            </div>
        `;
    }
});
