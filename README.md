# Lin Research Group Website

Static GitHub Pages site for the Lin Research Group at NC State University.

Group website:

https://linresearchgroup-ncsu.github.io/

The current site was generated from the former WordPress site at:

https://lingroup.wordpress.ncsu.edu/

## Structure

- `index.html` is the home page.
- `research/`, `team/`, `publications/`, `software/`, `teaching/`, `team-photos/`, and `positions/` are static section pages.
- `news/` contains generated news HTML pages that GitHub Pages serves.
- `assets/css/styles.css` and `assets/js/main.js` contain the site styling and mobile navigation behavior.
- `assets/media/` contains locally downloaded WordPress images used by the pages.
- `source/pages/research.html` stores the locally maintained Research Topics page content.
- `source/pages/publications.html` stores the locally maintained Publications page content.
- `source/pages/software.html` stores the locally maintained Software page content.
- `source/pages/positions.html` stores the locally maintained Positions page content.
- `source/wordpress/` stores the WordPress API export used for this migration.
- `source/news/posts/` stores hand-authored Markdown news posts that are independent from WordPress.
- `source/team-photos.json` stores local Photos gallery entries for photos that are not attached to a news post.
- `tools/build-site.mjs` regenerates the static pages from the WordPress export, local page overrides, local news posts, and local photo entries.

## Updating Research Topics

1. Edit `source/pages/research.html`.
2. Add new topics as `<h2 class="wp-block-heading">` sections. Place the newest or highest-priority topic near the top of the file.
3. Put research figures under `assets/media/research/` and reference them with root-relative paths such as `/assets/media/research/figure-name.png`.
4. Rebuild the generated HTML from the repository root:

```bash
node tools/build-site.mjs
```

5. Commit and push the source page, figure assets, generated `research/index.html`, and generated `index.html` if the homepage topic cards changed.

## Updating Publications

1. Edit `source/pages/publications.html`.
2. Add new papers near the top of the correct section, usually `Preprints:` or `Peer-reviewed Publications:`.
3. Keep the numbering newest-to-oldest within each section. If a preprint becomes peer reviewed, move it from `Preprints:` to `Peer-reviewed Publications:` and renumber both sections.
4. Follow the existing HTML style:
   - Use `<strong>Xingcheng Lin</strong>` to bold the group PI.
   - Link the paper title to the DOI URL, such as `<a href="https://doi.org/10.xxxx/...">Paper title</a>`.
   - Add `*` after corresponding authors.
   - Use `&dagger;` for shared authorship.
   - Write DOI entries as `DOI: 10.xxxx/...`.
5. Rebuild the generated HTML from the repository root:

```bash
node tools/build-site.mjs
```

6. Commit and push both the source page and the generated Publications page:

```bash
git status
git add source/pages/publications.html publications/index.html
git commit -m "Update publications"
git push
```

## Adding News Without WordPress

1. Copy `source/news/posts/_new-post-template.md` to `source/news/posts/YYYY-MM-DD-short-slug.md`.
2. Keep the new Markdown file inside `source/news/posts/`. Files placed directly in `source/news/` are ignored by the build.
3. Copy the news image into `assets/media/news/YYYY/MM/your-image.jpg`.
4. Edit the front matter at the top of the new Markdown file:
   - `title` is the post title.
   - `date` controls the post order.
   - `slug` becomes the URL at `/news/your-slug/`.
   - `description` appears on the News index.
   - `image` should point to the local image path, such as `/assets/media/news/2026/05/your-image.jpg`.
   - `imageAlt` describes the image for accessibility.
   - `includeImageInPhotos` should usually be `true` for event and group photos. Set it to `false` for logos, diagrams, or images that should only appear in the News post.
5. Set `draft: false` when the post is ready to publish.
6. Rebuild the generated HTML from the repository root:

```bash
node tools/build-site.mjs
```

7. Commit and push the Markdown source file, the image, and the generated HTML changes:

```bash
git status
git add .
git commit -m "Add news post"
git push
```

Local Markdown posts are combined with the older imported WordPress news posts automatically. You do not need to edit `source/wordpress/posts.json` for new posts.

News images are also added to the Photos page automatically during the build when `includeImageInPhotos: true`. If a photo is attached to a news post, do not duplicate it in `source/team-photos.json`.

## Adding Software

1. Edit `source/pages/software.html`.
2. Add a new `<article class="software-card">` inside `<div class="software-grid">`. Use the existing cards as the template.
3. Link only the repository name in the `<h3>` to GitHub. Do not make the logo or letter mark a second link.
4. If the repository has a logo, copy a web-sized image into `assets/media/software/` and use a decorative mark:

```html
<div class="software-mark software-mark-image">
  <img src="/assets/media/software/repo-logo.png" alt="REPO logo">
</div>
```

5. If there is no logo, use a text badge with one of the existing badge classes or add a new class in `tools/build-site.mjs`:

```html
<div class="software-mark software-mark-badge software-mark-rna" aria-hidden="true">
  <span>RNA</span>
</div>
```

6. If the total number of software repositories changes, update `SOFTWARE_REPOSITORY_COUNT` in `tools/build-site.mjs`.
7. Rebuild the generated HTML from the repository root:

```bash
node tools/build-site.mjs
```

8. Commit and push the source page, any new logo assets, the generated CSS, `tools/build-site.mjs` if the count or styles changed, and the generated `software/index.html` and `index.html` files:

```bash
git status
git add source/pages/software.html assets/media/software assets/css/styles.css tools/build-site.mjs software/index.html index.html
git commit -m "Update software page"
git push
```

## Updating Positions

1. Edit `source/pages/positions.html`.
2. Keep current openings near the top of the page, followed by general Graduate Students and Undergraduate Students notes.
3. Rebuild the generated HTML from the repository root:

```bash
node tools/build-site.mjs
```

4. Commit and push both the source page and generated Positions page:

```bash
git status
git add source/pages/positions.html positions/index.html README.md
git commit -m "Update positions"
git push
```

## Adding Team Photos

News post images are included in the Photos page automatically. Use these steps only for gallery-only photos that do not belong to a news post.

1. Copy the photo into the repository. For gallery-only images, use a path such as `assets/media/team-photos/YYYY/MM/photo-name.jpg`. If the image already exists elsewhere under `assets/media/`, reuse that path instead of duplicating it.
2. Add an entry to `source/team-photos.json`:

```json
{
  "image": "/assets/media/team-photos/2026/05/photo-name.jpg",
  "alt": "Short description of the photo"
}
```

3. Keep the JSON list comma-separated and valid. The newest or preferred photos should go near the top of the list.
4. Rebuild the generated HTML from the repository root:

```bash
node tools/build-site.mjs
```

5. Commit and push the image, `source/team-photos.json`, and the generated `team-photos/index.html` change:

```bash
git status
git add .
git commit -m "Add team photos"
git push
```

The Photos page combines news-post images, entries from `source/team-photos.json`, and the older imported WordPress gallery.

## Updating From WordPress Export

From the repository root:

```bash
node tools/build-site.mjs
curl -L --config source/wordpress/media-downloads.curl
```

The generated site is plain HTML/CSS/JS. The `.nojekyll` file tells GitHub Pages to serve the files directly without running the legacy Jekyll/Academic Pages template that was previously in this repository.

## Local Preview

```bash
python3 -m http.server 4000
```

Then open:

http://localhost:4000/
