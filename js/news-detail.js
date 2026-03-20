document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const newsId = params.get('id');
    const newsDetail = document.getElementById('newsDetail');

    NewsUtils.setupPageChrome();

    if (!newsId) {
        renderEmpty('缺少新闻编号，无法显示详情页。');
        return;
    }

    loadDetail(newsId);

    async function loadDetail(id) {
        try {
            const newsList = await NewsUtils.loadNewsData();
            const news = newsList.find(item => item.id === id);

            if (!news) {
                renderEmpty('没有找到对应的新闻内容。');
                return;
            }

            renderDetail(news);
        } catch (error) {
            console.error('加载新闻详情失败:', error);
            renderEmpty('新闻详情加载失败，请稍后再试。');
        }
    }

    async function renderDetail(news) {
        document.title = `${news.title} | YCLab`;

        const articleMarkup = await NewsUtils.loadArticleMarkup(news);
        const linksMarkup = Array.isArray(news.links) && news.links.length
            ? `
                <section class="detail-links">
                    <h2>相关链接</h2>
                    <ul>
                        ${news.links.map(link => `
                            <li><a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label}</a></li>
                        `).join('')}
                    </ul>
                </section>
            `
            : '';

        newsDetail.innerHTML = `
            <article class="detail-card">
                <div class="detail-body">
                    <div class="detail-meta">
                        <span>${NewsUtils.formatDate(news.date)}</span>
                        <span class="detail-category">${NewsUtils.getCategoryName(news.category)}</span>
                    </div>
                    <h1 class="detail-title">${news.title}</h1>
                    <div class="detail-summary">${news.summary || '暂无摘要'}</div>
                    <div class="detail-content">
                        ${articleMarkup}
                    </div>
                    ${linksMarkup}
                </div>
            </article>
        `;
    }

    function renderEmpty(message) {
        newsDetail.innerHTML = `<div class="detail-empty">${message}</div>`;
    }
});
