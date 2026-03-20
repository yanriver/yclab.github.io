# 新闻新增说明

这份说明只讲一件事：以后如何新增一条新闻。

## 1. 你需要改 3 个地方

新增一条新闻时，只需要处理这 3 步：

1. 把图片放到 `news/images/`
2. 新建正文文件到 `news/articles/`
3. 在 `data/news.json` 里新增一条记录

## 2. 文件结构

- `data/news.json`
  负责新闻列表、首页新闻栏、详情弹窗的基础信息
- `news/articles/*.html`
  负责每条新闻的正文内容
- `news/images/*`
  负责新闻中使用的图片

## 3. `news.json` 里每条新闻怎么写

每条新闻需要这些字段：

- `id`
  唯一编号，不能重复
- `title`
  新闻标题
- `date`
  日期，格式固定为 `YYYY-MM-DD`
- `summary`
  首页和新闻列表页显示的摘要
- `image`
  列表封面图路径
- `articlePath`
  正文文件路径
- `category`
  目前写 `event` 或 `research`

可直接复制这个模板：

```json
{
  "id": "sample-news-2025-03-20",
  "title": "这里写新闻标题",
  "date": "2025-03-20",
  "summary": "这里写列表摘要，一般 1 到 2 句话。",
  "image": "news/images/sample-cover.jpg",
  "articlePath": "news/articles/sample-news-2025-03-20.html",
  "category": "event"
}
```

## 4. 正文文件怎么写

正文文件放在 `news/articles/`，例如：

`news/articles/sample-news-2025-03-20.html`

这里写的是“正文片段”，不是完整网页。

不要写这些：

- `<!DOCTYPE html>`
- `<html>`
- `<head>`
- `<body>`
- 导航栏
- 页脚

你只需要写正文内容本身。

最常用模板：

```html
<p>这里是第一段正文。</p>

<figure class="detail-figure">
    <img src="../images/sample-cover.jpg" alt="图片说明">
    <figcaption>图片说明文字。</figcaption>
</figure>

<p>这里是第二段正文。</p>
```

## 5. 如果有多张图片

可以继续往下写多个 `figure`：

```html
<p>这里是正文。</p>

<figure class="detail-figure">
    <img src="../images/a.jpg" alt="图片 A">
    <figcaption>图片 A 说明。</figcaption>
</figure>

<figure class="detail-figure">
    <img src="../images/b.jpg" alt="图片 B">
    <figcaption>图片 B 说明。</figcaption>
</figure>
```

也可以写成并排图片组：

```html
<div class="detail-gallery">
    <figure class="detail-figure">
        <img src="../images/a.jpg" alt="图片 A">
        <figcaption>图片 A 说明。</figcaption>
    </figure>
    <figure class="detail-figure">
        <img src="../images/b.jpg" alt="图片 B">
        <figcaption>图片 B 说明。</figcaption>
    </figure>
</div>
```

## 6. 路径怎么写

这是最容易写错的地方：

- `news.json` 里的封面图：
  写成 `news/images/xxx.jpg`
- 正文 `.html` 文件里的图片：
  写成 `../images/xxx.jpg`

原因是正文文件本身在 `news/articles/` 目录下。

## 7. 新增新闻的完整示例

假设你要新增一条组会新闻：

1. 把图片放到：
   `news/images/group-meeting-2026-03-20.jpg`

2. 新建正文文件：
   `news/articles/group-meeting-2026-03-20.html`

正文写成：

```html
<p>课题组举行了新一期组会，本次围绕近期研究进展进行了交流。</p>

<figure class="detail-figure">
    <img src="../images/group-meeting-2026-03-20.jpg" alt="组会现场">
    <figcaption>组会现场照片。</figcaption>
</figure>

<p>本次讨论帮助大家进一步梳理了研究思路，也明确了下一阶段的工作安排。</p>
```

3. 在 `data/news.json` 里新增：

```json
{
  "id": "group-meeting-2026-03-20",
  "title": "课题组举行新一期组会",
  "date": "2026-03-20",
  "summary": "课题组围绕近期研究进展开展交流讨论。",
  "image": "news/images/group-meeting-2026-03-20.jpg",
  "articlePath": "news/articles/group-meeting-2026-03-20.html",
  "category": "event"
}
```

## 8. 最后检查一下

新增完以后，检查这几项：

- `id` 有没有和以前重复
- `date` 格式是不是 `YYYY-MM-DD`
- `image` 路径是否存在
- `articlePath` 路径是否存在
- 正文里的图片路径是不是 `../images/xxx.jpg`

如果这 5 项都对，新闻一般就能正常显示。
