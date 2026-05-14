import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, "source", "wordpress");
const SITE_URL = "https://linresearchgroup-ncsu.github.io";
const OLD_SITE = "https://lingroup.wordpress.ncsu.edu";
const FILE_RE = /https:\/\/lingroup\.wordpress\.ncsu\.edu\/files\/[^"'()\s<>]+/g;
const HOME_INTRO =
  "Our research group is situated within the Department of Physics and the Bioinformatics Research Center of North Carolina State University. By synergizing simulation and data-driven approaches, we are committed to building innovative computational models to answer crucial questions in the realm of genome and epigenome.";

const pages = JSON.parse(fs.readFileSync(path.join(SOURCE, "pages.json"), "utf8"));
const posts = JSON.parse(fs.readFileSync(path.join(SOURCE, "posts.json"), "utf8"));

const pageBySlug = new Map(pages.map((page) => [page.slug, page]));
const postByOldUrl = new Map(posts.map((post) => [trimSlash(post.link), `/news/${post.slug}/`]));
const localMedia = new Set();

const nav = [
  ["Research", "/research/"],
  ["Team", "/team/"],
  ["Publications", "/publications/"],
  ["Software", "/software/"],
  ["Teaching", "/teaching/"],
  ["News", "/news/"],
  ["Photos", "/team-photos/"],
  ["Positions", "/positions/"],
];

const pageRoutes = [
  ["research", "Research Topics"],
  ["team", "Our Team"],
  ["publications", "Publications"],
  ["software", "Software"],
  ["teaching", "Teaching"],
  ["team-photos", "Team Photos"],
  ["positions", "Positions"],
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, content);
}

function decodeHtml(value = "") {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/&#160;/g, " ");
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripTags(html = "") {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function words(value, limit) {
  const parts = value.split(/\s+/).filter(Boolean);
  return parts.length > limit ? `${parts.slice(0, limit).join(" ")}...` : parts.join(" ");
}

function trimSlash(url) {
  return url.replace(/\/+$/, "");
}

function mediaPathFromUrl(url) {
  const clean = url.split("?")[0];
  const relative = clean.replace(`${OLD_SITE}/files/`, "");
  return `assets/media/${relative}`;
}

function mediaUrlFromOld(url) {
  localMedia.add(url.split("?")[0]);
  return `/${mediaPathFromUrl(url)}`;
}

function firstImage(html = "") {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : "";
}

function rewriteLinks(html = "") {
  let output = html
    .replace(/\s(?:srcset|sizes)=["'][^"']*["']/gi, "")
    .replace(/\sdata-(?:type|id)=["'][^"']*["']/gi, "")
    .replace(/\sdecoding=["'][^"']*["']/gi, "")
    .replace(/\sloading=["'][^"']*["']/gi, "")
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/<br>\s*<br>/gi, "<br>");

  output = output.replace(FILE_RE, (url) => mediaUrlFromOld(url));

  for (const [oldUrl, newUrl] of postByOldUrl.entries()) {
    output = output.replaceAll(`${oldUrl}/`, newUrl).replaceAll(oldUrl, newUrl);
  }

  for (const [slug] of pageBySlug.entries()) {
    if (slug === "home" || slug === "sample-page" || slug === "search") continue;
    output = output
      .replaceAll(`${OLD_SITE}/${slug}/`, `/${slug}/`)
      .replaceAll(`${OLD_SITE}/${slug}`, `/${slug}/`);
  }

  output = output.replaceAll(`${OLD_SITE}/`, "/");
  return output;
}

function pageContent(slug) {
  const page = pageBySlug.get(slug);
  if (!page) throw new Error(`Missing WordPress page: ${slug}`);
  return rewriteLinks(page.content.rendered || "");
}

function pageTitle(slug) {
  const page = pageBySlug.get(slug);
  return decodeHtml(page?.title?.rendered || slug);
}

function dateLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function shell({ title, description, bodyClass = "", children, pathName = "/" }) {
  const fullTitle = title === "Lin Research Group" ? title : `${title} | Lin Research Group`;
  const canonical = `${SITE_URL}${pathName}`;
  const navHtml = nav
    .map(([label, href]) => {
      const active = pathName === href || (href !== "/" && pathName.startsWith(href));
      return `<a class="${active ? "active" : ""}" href="${href}">${label}</a>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(fullTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body class="${bodyClass}">
  <a class="skip-link" href="#main">Skip to main content</a>
  <header class="site-header">
    <a class="brand" href="/" aria-label="Lin Research Group home">
      <span class="brand-mark">LRG</span>
      <span class="brand-text">
        <strong>Lin Research Group</strong>
        <small>NC State University</small>
      </span>
    </a>
    <button class="nav-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="site-nav">
      <span></span><span></span><span></span>
    </button>
    <nav class="site-nav" id="site-nav" aria-label="Main navigation">
      ${navHtml}
    </nav>
  </header>
  <main id="main">
    ${children}
  </main>
  <footer class="site-footer">
    <div>
      <strong>Lin Research Group</strong>
      <p>Department of Physics and Bioinformatics Research Center, North Carolina State University.</p>
    </div>
    <div>
      <a href="https://physics.sciences.ncsu.edu/" rel="noopener">NC State Physics</a>
      <a href="https://brc.ncsu.edu/" rel="noopener">Bioinformatics Research Center</a>
      <a href="https://scholar.google.com/citations?user=PS_CX0AAAAAJ" rel="noopener">Google Scholar</a>
    </div>
  </footer>
  <script src="/assets/js/main.js"></script>
</body>
</html>
`;
}

function extractResearchCards() {
  const research = rewriteLinks(pageBySlug.get("research").content.rendered || "");
  const sections = [...research.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2|$)/gi)];
  return sections.map((match) => ({
    title: stripTags(match[1]),
    excerpt: words(stripTags(match[2]), 38),
  }));
}

function postExcerpt(post) {
  const source = post.excerpt?.rendered || post.content?.rendered || "";
  return words(stripTags(source), 34);
}

function postCard(post) {
  const title = decodeHtml(post.title.rendered);
  const image = firstImage(post.content.rendered || "");
  const thumbnail = image
    ? `<a class="news-thumb" href="/news/${post.slug}/"><img src="${mediaUrlFromOld(image)}" alt=""></a>`
    : `<a class="news-thumb news-thumb-fallback" href="/news/${post.slug}/"><span>${escapeHtml(title.slice(0, 1))}</span></a>`;

  return `<article class="news-card">
    ${thumbnail}
    <div>
      <time datetime="${post.date}">${dateLabel(post.date)}</time>
      <h3><a href="/news/${post.slug}/">${escapeHtml(title)}</a></h3>
      <p>${escapeHtml(postExcerpt(post))}</p>
    </div>
  </article>`;
}

function buildHome() {
  const home = pageBySlug.get("home");
  const heroImage = mediaUrlFromOld(firstImage(home.content.rendered));
  const intro = HOME_INTRO;
  const researchCards = extractResearchCards()
    .map((card) => `<article class="topic-card"><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.excerpt)}</p></article>`)
    .join("");
  const latestNews = posts.slice(0, 3).map(postCard).join("");

  const children = `<section class="hero" style="--hero-image: url('${heroImage}')">
    <div class="hero-shade"></div>
    <div class="hero-content">
      <p class="eyebrow">Computational genome and epigenome research</p>
      <h1>Lin Research Group</h1>
      <p>${escapeHtml(intro)}</p>
      <div class="hero-actions">
        <a class="button primary" href="/research/">Research Topics</a>
        <a class="button secondary" href="/positions/">Open Positions</a>
      </div>
    </div>
  </section>

  <section class="overview-band">
    <div class="metric"><strong>3</strong><span>Research themes</span></div>
    <div class="metric"><strong>${posts.length}</strong><span>News updates imported</span></div>
    <div class="metric"><strong>6</strong><span>Software repositories</span></div>
  </section>

  <section class="content-section">
    <div class="section-heading">
      <p class="eyebrow">Research</p>
      <h2>Simulation and data-driven models for genome regulation</h2>
      <a href="/research/">View all research</a>
    </div>
    <div class="topic-grid">${researchCards}</div>
  </section>

  <section class="content-section muted">
    <div class="section-heading">
      <p class="eyebrow">Latest News</p>
      <h2>Recent group updates</h2>
      <a href="/news/">All news</a>
    </div>
    <div class="news-grid">${latestNews}</div>
  </section>`;

  writeFile(
    path.join(ROOT, "index.html"),
    shell({
      title: "Lin Research Group",
      description: "Computational genome and epigenome research at NC State University.",
      bodyClass: "home-page",
      pathName: "/",
      children,
    }),
  );
}

function buildContentPage(slug, title) {
  const content = pageContent(slug);
  const text = stripTags(content);
  const className = `${slug.replaceAll("-", "-")}-page`;
  const children = `<section class="page-hero compact">
    <p class="eyebrow">Lin Research Group</p>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(words(text, 28))}</p>
  </section>
  <section class="page-shell">
    <article class="wordpress-content ${slug === "team-photos" ? "photo-gallery" : ""}">
      ${content}
    </article>
  </section>`;

  writeFile(
    path.join(ROOT, slug, "index.html"),
    shell({
      title,
      description: words(text, 26),
      bodyClass: className,
      pathName: `/${slug}/`,
      children,
    }),
  );
}

function buildNewsIndex() {
  const cards = posts.map(postCard).join("");
  const children = `<section class="page-hero compact">
    <p class="eyebrow">News</p>
    <h1>Group Updates</h1>
    <p>Announcements, publications, presentations, awards, and group milestones imported from the original WordPress site.</p>
  </section>
  <section class="page-shell">
    <div class="news-list">${cards}</div>
  </section>`;

  writeFile(
    path.join(ROOT, "news", "index.html"),
    shell({
      title: "News",
      description: "News and updates from the Lin Research Group at NC State University.",
      bodyClass: "news-page",
      pathName: "/news/",
      children,
    }),
  );
}

function buildPostPages() {
  for (const post of posts) {
    const title = decodeHtml(post.title.rendered);
    const content = rewriteLinks(post.content.rendered || "");
    const text = stripTags(content);
    const children = `<section class="page-hero compact post-head">
      <p class="eyebrow">News</p>
      <h1>${escapeHtml(title)}</h1>
      <time datetime="${post.date}">${dateLabel(post.date)}</time>
    </section>
    <section class="page-shell">
      <article class="wordpress-content post-content">
        ${content}
      </article>
      <p class="back-link"><a href="/news/">Back to all news</a></p>
    </section>`;

    writeFile(
      path.join(ROOT, "news", post.slug, "index.html"),
      shell({
        title,
        description: words(text, 26),
        bodyClass: "post-page",
        pathName: `/news/${post.slug}/`,
        children,
      }),
    );
  }
}

function buildAssets() {
  writeFile(
    path.join(ROOT, "assets", "css", "styles.css"),
    `:root {
  --red: #cc0000;
  --red-dark: #8f0d14;
  --ink: #18202a;
  --muted: #586273;
  --line: #d9dee6;
  --paper: #ffffff;
  --wash: #f5f7f4;
  --teal: #2f6f73;
  --gold: #c3912e;
  --max: 1160px;
}

* { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  color: var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.65;
  background: var(--paper);
  overflow-x: hidden;
}

a { color: var(--red-dark); text-decoration-thickness: 0.08em; text-underline-offset: 0.18em; }
a:hover { color: var(--red); }

img { display: block; max-width: 100%; height: auto; }

.skip-link {
  position: absolute;
  left: 1rem;
  top: -4rem;
  z-index: 100;
  background: var(--ink);
  color: #fff;
  padding: 0.7rem 1rem;
  border-radius: 6px;
}

.skip-link:focus { top: 1rem; }

.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0.8rem clamp(1rem, 4vw, 3rem);
  border-bottom: 1px solid rgba(24, 32, 42, 0.1);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(16px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--ink);
  text-decoration: none;
  min-width: max-content;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 2.7rem;
  height: 2.7rem;
  border-radius: 8px;
  background: var(--red);
  color: white;
  font-weight: 800;
}

.brand-text { display: grid; line-height: 1.15; }
.brand-text small { color: var(--muted); }

.site-nav {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: clamp(0.6rem, 1.8vw, 1.25rem);
  font-size: 0.95rem;
}

.site-nav a {
  color: var(--ink);
  text-decoration: none;
  padding: 0.35rem 0;
  border-bottom: 2px solid transparent;
}

.site-nav a.active,
.site-nav a:hover {
  color: var(--red-dark);
  border-color: var(--red);
}

.nav-toggle {
  display: none;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: #fff;
  place-items: center;
  padding: 0.6rem;
}

.nav-toggle span {
  display: block;
  width: 1.2rem;
  height: 2px;
  background: var(--ink);
  margin: 3px auto;
}

.hero {
  position: relative;
  min-height: min(78vh, 760px);
  display: grid;
  align-items: end;
  padding: clamp(6rem, 12vw, 11rem) clamp(1rem, 5vw, 4rem) clamp(3rem, 7vw, 6rem);
  isolation: isolate;
  overflow: hidden;
  background: var(--ink);
}

.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -2;
  background-image: var(--hero-image);
  background-size: cover;
  background-position: center;
  filter: saturate(0.95);
}

.hero-shade {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg, rgba(10, 14, 20, 0.88), rgba(10, 14, 20, 0.54), rgba(10, 14, 20, 0.2));
}

.hero-content {
  width: min(760px, 100%);
  max-width: 100%;
  color: #fff;
}

.eyebrow {
  margin: 0 0 0.75rem;
  color: var(--gold);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0;
  font-size: 0.78rem;
}

.hero h1,
.page-hero h1,
.section-heading h2 {
  margin: 0;
  line-height: 1.08;
}

.hero h1 {
  font-size: clamp(3.2rem, 9vw, 6.8rem);
  max-width: 11ch;
}

.hero p:not(.eyebrow) {
  max-width: 720px;
  margin: 1.4rem 0 0;
  font-size: clamp(1.05rem, 2.2vw, 1.35rem);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 2rem;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0.7rem 1.05rem;
  border-radius: 6px;
  font-weight: 800;
  text-decoration: none;
}

.button.primary { color: white; background: var(--red); }
.button.secondary { color: white; border: 1px solid rgba(255, 255, 255, 0.55); }

.overview-band {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--line);
  border-bottom: 1px solid var(--line);
}

.metric {
  background: var(--wash);
  padding: clamp(1.2rem, 3vw, 2rem);
  text-align: center;
}

.metric strong {
  display: block;
  color: var(--red-dark);
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  line-height: 1;
}

.metric span { color: var(--muted); font-weight: 700; }

.content-section,
.page-shell {
  max-width: var(--max);
  margin: 0 auto;
  padding: clamp(3rem, 7vw, 5.5rem) clamp(1rem, 4vw, 2rem);
}

.content-section.muted {
  max-width: none;
  background: var(--wash);
}

.content-section.muted > * {
  max-width: var(--max);
  margin-left: auto;
  margin-right: auto;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-heading h2 {
  max-width: 690px;
  font-size: clamp(2rem, 4vw, 3.1rem);
}

.section-heading a {
  flex: 0 0 auto;
  font-weight: 800;
}

.topic-grid,
.news-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.topic-card,
.news-card {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.topic-card {
  padding: 1.25rem;
  border-top: 4px solid var(--teal);
}

.topic-card h3,
.news-card h3 {
  margin: 0 0 0.55rem;
  line-height: 1.22;
}

.topic-card p,
.news-card p { margin: 0; color: var(--muted); }

.news-card {
  display: grid;
  grid-template-rows: auto 1fr;
}

.news-card > div { padding: 1rem; }

.news-card time,
.post-head time {
  display: inline-block;
  color: var(--muted);
  font-size: 0.9rem;
  font-weight: 800;
  margin-bottom: 0.45rem;
}

.news-thumb {
  display: block;
  aspect-ratio: 4 / 3;
  background: var(--ink);
  color: #fff;
  text-decoration: none;
  overflow: hidden;
}

.news-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 180ms ease;
}

.news-card:hover .news-thumb img { transform: scale(1.03); }

.news-thumb-fallback {
  display: grid;
  place-items: center;
  background: var(--teal);
}

.news-thumb-fallback span { font-size: 3rem; font-weight: 900; }

.page-hero {
  background: var(--ink);
  color: #fff;
  padding: clamp(4rem, 10vw, 7rem) clamp(1rem, 5vw, 4rem) clamp(2.5rem, 6vw, 4rem);
}

.page-hero.compact h1 {
  max-width: 900px;
  font-size: clamp(2.45rem, 6vw, 5rem);
}

.page-hero.compact p:not(.eyebrow) {
  max-width: 780px;
  margin: 1rem 0 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 1.08rem;
}

.wordpress-content {
  max-width: 880px;
  margin: 0 auto;
  font-size: 1.05rem;
}

.wordpress-content h2,
.wordpress-content h3 {
  clear: both;
  margin: 2.2rem 0 0.7rem;
  line-height: 1.2;
}

.wordpress-content h2 {
  padding-top: 1.2rem;
  border-top: 1px solid var(--line);
  font-size: clamp(1.7rem, 3vw, 2.25rem);
}

.wordpress-content h3 { font-size: 1.35rem; }
.wordpress-content p { margin: 0 0 1rem; }
.wordpress-content ul,
.wordpress-content ol { padding-left: 1.25rem; }
.wordpress-content li + li { margin-top: 0.4rem; }

.wordpress-content figure {
  margin: 1.5rem 0;
}

.wordpress-content figure img {
  border-radius: 8px;
  border: 1px solid var(--line);
}

.team-page .wordpress-content > figure:first-child img {
  width: 100%;
  max-height: 520px;
  object-fit: cover;
}

.team-page .wordpress-content figure:not(:first-child) {
  float: left;
  clear: left;
  width: 150px;
  margin: 0.25rem 1.1rem 1.1rem 0;
}

.team-page .wordpress-content figure:not(:first-child) img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.team-page .wordpress-content figure:not(:first-child) + p {
  min-height: 150px;
  display: flex;
  align-items: center;
}

.photo-gallery {
  max-width: var(--max);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.photo-gallery figure {
  margin: 0;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid var(--line);
}

.photo-gallery figure img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 0;
  border-radius: 0;
}

.news-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.news-list .news-card {
  grid-template-columns: minmax(160px, 0.45fr) 1fr;
  grid-template-rows: none;
}

.post-content {
  font-size: 1.09rem;
}

.post-content figure img {
  margin-inline: auto;
}

.back-link {
  max-width: 880px;
  margin: 2rem auto 0;
  font-weight: 800;
}

.site-footer {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  padding: 2rem clamp(1rem, 4vw, 3rem);
  background: #111820;
  color: rgba(255, 255, 255, 0.82);
}

.site-footer p { margin: 0.35rem 0 0; }
.site-footer a { color: #fff; margin-left: 1rem; font-weight: 700; }

@media (max-width: 980px) {
  .nav-toggle { display: grid; }
  .site-nav {
    position: absolute;
    inset: 100% 1rem auto 1rem;
    display: none;
    flex-direction: column;
    align-items: stretch;
    padding: 0.75rem;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 18px 40px rgba(24, 32, 42, 0.16);
  }
  .site-nav.open { display: flex; }
  .site-nav a { padding: 0.7rem 0.8rem; }
  .topic-grid,
  .news-grid,
  .news-list,
  .photo-gallery { grid-template-columns: 1fr 1fr; }
  .news-list .news-card { grid-template-columns: 1fr; }
}

@media (max-width: 680px) {
  .brand-text small { display: none; }
  .hero { min-height: 680px; align-items: end; }
  .hero-shade { background: rgba(10, 14, 20, 0.72); }
  .hero h1 {
    font-size: 3.35rem;
    max-width: 100%;
  }
  .hero p:not(.eyebrow) {
    max-width: 100%;
    font-size: 1rem;
  }
  .overview-band,
  .topic-grid,
  .news-grid,
  .news-list,
  .photo-gallery { grid-template-columns: 1fr; }
  .section-heading { display: block; }
  .section-heading a { display: inline-block; margin-top: 0.8rem; }
  .team-page .wordpress-content figure:not(:first-child) {
    float: none;
    width: 150px;
    margin: 1rem 0 0.5rem;
  }
  .team-page .wordpress-content figure:not(:first-child) + p {
    min-height: 0;
    display: block;
  }
  .site-footer { display: block; }
  .site-footer a { display: block; margin: 0.65rem 0 0; }
}
`,
  );

  writeFile(
    path.join(ROOT, "assets", "js", "main.js"),
    `const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}
`,
  );

  writeFile(path.join(ROOT, ".nojekyll"), "");
  writeFile(
    path.join(ROOT, "favicon.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#cc0000"/>
  <text x="32" y="39" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" font-weight="800" fill="#fff">LRG</text>
</svg>
`,
  );
  writeFile(
    path.join(ROOT, "robots.txt"),
    `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`,
  );
}

function buildSitemap() {
  const urls = ["/", ...pageRoutes.map(([slug]) => `/${slug}/`), "/news/", ...posts.map((post) => `/news/${post.slug}/`)];
  writeFile(
    path.join(ROOT, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${SITE_URL}${url}</loc></url>`).join("\n")}
</urlset>
`,
  );
}

function buildDownloadConfig() {
  const lines = ["create-dirs", "location"];
  for (const url of [...localMedia].sort()) {
    lines.push(`url = "${url}"`);
    lines.push(`output = "${mediaPathFromUrl(url)}"`);
  }
  writeFile(path.join(SOURCE, "media-downloads.curl"), `${lines.join("\n")}\n`);
}

buildAssets();
buildHome();
for (const [slug, title] of pageRoutes) buildContentPage(slug, title || pageTitle(slug));
buildNewsIndex();
buildPostPages();
buildSitemap();
buildDownloadConfig();

console.log(`Generated ${pageRoutes.length + posts.length + 2} pages and ${localMedia.size} media downloads.`);
