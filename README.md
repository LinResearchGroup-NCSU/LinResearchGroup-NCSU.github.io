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
- `source/pages/publications.html` stores the locally maintained Publications page content.
- `source/wordpress/` stores the WordPress API export used for this migration.
- `source/news/posts/` stores hand-authored Markdown news posts that are independent from WordPress.
- `source/team-photos.json` stores local Photos gallery entries for photos that are not attached to a news post.
- `tools/build-site.mjs` regenerates the static pages from the WordPress export, local page overrides, local news posts, and local photo entries.

## Updating Publications

1. Edit `source/pages/publications.html`.
2. Add new papers near the top of the correct section, usually `Preprints:` or `Peer-reviewed Publications:`.
3. Keep the numbering newest-to-oldest within each section. If a preprint becomes peer reviewed, move it from `Preprints:` to `Peer-reviewed Publications:` and renumber both sections.
4. Follow the existing HTML style:
   - Use `<strong>Xingcheng Lin</strong>` to bold the group PI.
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
