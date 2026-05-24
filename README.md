# Lin Research Group Website

Static GitHub Pages site for the Lin Research Group at NC State University.

The current site was generated from the former WordPress site at:

https://lingroup.wordpress.ncsu.edu/

## Structure

- `index.html` is the home page.
- `research/`, `team/`, `publications/`, `software/`, `teaching/`, `team-photos/`, and `positions/` are static section pages.
- `news/` contains generated news HTML pages that GitHub Pages serves.
- `assets/css/styles.css` and `assets/js/main.js` contain the site styling and mobile navigation behavior.
- `assets/media/` contains locally downloaded WordPress images used by the pages.
- `source/wordpress/` stores the WordPress API export used for this migration.
- `source/news/posts/` stores hand-authored Markdown news posts that are independent from WordPress.
- `source/team-photos.json` stores the local Photos gallery entries.
- `tools/build-site.mjs` regenerates the static pages from the WordPress export and local news posts.

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
5. Set `draft: false` when the post is ready to publish.
6. Rebuild the generated HTML from the repository root:

```bash
node tools/build-site.mjs
```

7. Commit and push both the Markdown source file and the generated HTML changes:

```bash
git status
git add .
git commit -m "Add news post"
git push
```

Local Markdown posts are combined with the older imported WordPress news posts automatically. You do not need to edit `source/wordpress/posts.json` for new posts.

## Adding Team Photos

1. Copy the photo into the repository. For new gallery-only images, use a path such as `assets/media/team-photos/YYYY/MM/photo-name.jpg`. If the image already exists elsewhere under `assets/media/`, reuse that path instead of duplicating it.
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

The Photos page combines entries from `source/team-photos.json` with the older imported WordPress gallery.

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
