// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    if (window.NewsUtils) {
        NewsUtils.setupPageChrome();
    }

    loadJson('data/news.json')
        .then(data => renderNews(data))
        .catch(() => renderError('news-container', '新闻加载失败，请稍后再试'));

    loadJson('data/publications.json')
        .then(data => renderPublications(data))
        .catch(() => renderError('pubs-container', '成果加载失败，请稍后再试'));

    loadJson('data/research.json')
        .then(data => renderResearch(data))
        .catch(() => renderError('research-container', '研究方向加载失败，请稍后再试'));

    loadJson('data/intro.json')
        .then(data => renderHome(data))
        .catch(() => renderError('intro', '简介加载失败，请稍后再试'));
});

function loadJson(path) {
    const normalizedPath = path.replace(/^\/+/, '');
    const url = new URL(normalizedPath, document.baseURI);

    return fetch(url)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Failed to fetch ${url}`);
            }

            return res.json();
        });
}

function renderNews(news) {
    const container = document.getElementById('news-container');
    if (!container) {
        return;
    }

    const sortedNews = news
        .map((item, index) => normalizeHomepageNewsItem(item, index))
        .filter(item => item && item.title)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = sortedNews.slice(0, 3).map(item => {
        const imageSrc = resolvePathForCurrentPage(item.image);

        return `
            <article class="index-news-item" data-news-id="${item.id}" tabindex="0" role="button" aria-label="查看新闻：${item.title}">
                <div class="index-news-content">
                    <h3>${item.title}</h3>
                    <time>${item.date}</time>
                    <p class="news-summary">${item.summary || '暂无摘要'}</p>
                </div>  
                <div class="index-news-img">
                    <img src="${imageSrc}" alt="${item.title}" loading="lazy" />
                </div>
            </article>
        `;
    }).join('');

    if (!container.innerHTML) {
        renderError('news-container', '暂无新闻内容');
        return;
    }

    container.querySelectorAll('.index-news-item[data-news-id]').forEach(card => {
        card.addEventListener('click', () => {
            const newsItem = sortedNews.find(item => item.id === card.dataset.newsId);

            if (newsItem && window.NewsUtils) {
                NewsUtils.openNewsModal(newsItem);
            }
        });

        card.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                const newsItem = sortedNews.find(item => item.id === card.dataset.newsId);

                if (newsItem && window.NewsUtils) {
                    NewsUtils.openNewsModal(newsItem);
                }
            }
        });
    });
}

function renderPublications(pubs) {
    const container = document.getElementById('pubs-container');
    if (!container) {
        return;
    }

    const sortedPublications = [...pubs]
        .filter(pub => pub && pub.title)
        .sort((a, b) => Number(b.year || 0) - Number(a.year || 0));

    container.innerHTML = sortedPublications.slice(0, 4).map(pub => `
        <div class="pub-item">
            <div class="pub-content">
                <div class="pub-header">
                    <span class="journal">${pub.journal}</span>
                    <span class="date">${pub.year}</span>
                </div>
                <h3>${pub.title}</h3>
                ${renderPublicationLink(pub.doi)}
            </div>
        </div>
    `).join('');

    if (!container.innerHTML) {
        renderError('pubs-container', '暂无成果内容');
    }
}

function renderResearch(researchs) {
    const container = document.getElementById('research-container');
    if (!container) {
        return;
    }

    container.innerHTML = researchs.map(item => `
        <div class="research-card">
            <div class="research-content">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            </div>
            <div class="research-image-frame">
                <img src="${item.image}" class="research-img" alt="${item.title}" loading="lazy" />
            </div>
        </div>
    `).join('');

    if (!container.innerHTML) {
        renderError('research-container', '暂无研究方向内容');
    }
}

function renderHome(intro) {
    const container = document.getElementById('intro');
    if (!container) {
        return;
    }

    container.innerHTML = intro.map(item => `<p>${item.content}</p>`).join('');
}

function renderPublicationLink(doi) {
    if (!doi) {
        return '<span class="doi-link disabled" aria-disabled="true">敬请期待</span>';
    }

    return `<a href="${doi}" class="doi-link" target="_blank" rel="noopener noreferrer">查看全文</a>`;
}

function normalizeHomepageNewsItem(item, index) {
    const summary = typeof item?.summary === 'string' ? item.summary.trim() : '';
    const generatedId = `news-${item?.date || 'undated'}-${index + 1}`;

    return {
        ...item,
        id: item?.id || generatedId,
        summary
    };
}

function resolvePathForCurrentPage(path) {
    if (!path) {
        return '';
    }

    if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) {
        return path;
    }

    if (window.NewsUtils) {
        return NewsUtils.resolveSitePath(path);
    }

    return path.replace(/\\/g, '/').replace(/^\.?\//, '');
}

function renderError(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) {
        return;
    }

    container.innerHTML = `<p class="empty-state">${message}</p>`;
}

window.addEventListener('scroll', () => {
    if (window.NewsUtils) {
        return;
    }

    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 100);
    }
});

const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', (e) => {
        if (window.NewsUtils) {
            return;
        }

        e.preventDefault();
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (window.NewsUtils) {
            return;
        }

        if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}
