// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    // 加载新闻数据
    fetch('../data/news.json')
        .then(res => res.json())
        .then(data => renderNews(data));

    // 加载发表数据
    fetch('../data/publications.json')
        .then(res => res.json())
        .then(data => renderPublications(data));

    //加载研究方向
    fetch('../data/research.json')
        .then(res => res.json())
        .then(data => renderResearch(data));

    fetch('../data/intro.json')
        .then(res => res.json())
        .then(data => renderhome(data))
});

function renderNews(news) {
    const container = document.getElementById('news-container');
    container.innerHTML = news.slice(0, 3).map(item => {
        return `
            <article class="index-news-item">
                <div class="index-news-content">
                    <h3>${item.title}</h3>
                    <time>${item.date}</time>
                    <p class="news-summary">${item.summary || '暂无摘要'}</p>
                </div>  
                <div class="index-news-img">
                    <img src="${item.image}" width="120" alt="news" />
                </div>
            </article>
        `;
    }).join('');
}


function renderPublications(pubs) {
    const container = document.getElementById('pubs-container');
    container.innerHTML = pubs.slice(0, 4).map(pub => `
        <div class="pub-item">
            <div class="pub-content">
                <div class="pub-header">
                    <span class="journal">${pub.journal}</span>
                    <span class="date">${pub.year}</span>
                </div>
                <h3>${pub.title}</h3>
                <a href="${pub.doi}" class="doi-link">查看全文</a>
            </div>
        </div>
    `).join('');
}

function renderResearch(researchs) {
    const container = document.getElementById('research-container');
    container.innerHTML = researchs.map(item => `
        <div class="research-card">
            <div class="research-content">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            </div>
            <div class="research-img">
                <img src="${item.image}" class="research-img" alt="research" />
            </div>
        </div>
    `).join('');
}

function renderhome(intro){
    const container = document.getElementById('intro');
    container.innerHTML = intro.map(item => `<p>${item.content}</p>`).join('');
}

// 滚动监听
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    navbar.classList.toggle('scrolled', window.scrollY > 100);
});

// 汉堡菜单交互
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', (e) => {
    e.preventDefault();
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// 点击外部关闭菜单
document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    }
});





