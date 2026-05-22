# Lin Research Group Website

Static GitHub Pages site for the Lin Research Group at NC State University.

The current site was generated from the former WordPress site at:

https://lingroup.wordpress.ncsu.edu/

## Structure

- `index.html` is the home page.
- `research/`, `team/`, `publications/`, `software/`, `teaching/`, `team-photos/`, and `positions/` are static section pages.
- `news/` contains the imported news index and individual news posts.
- `assets/css/styles.css` and `assets/js/main.js` contain the site styling and mobile navigation behavior.
- `assets/media/` contains locally downloaded WordPress images used by the pages.
- `source/wordpress/` stores the WordPress API export used for this migration.
- `source/news/` stores hand-authored news posts that are independent from WordPress.
- `tools/build-site.mjs` regenerates the static pages from the WordPress export and local news posts.

## Adding News Without WordPress

1. Copy `source/news/posts/_new-post-template.md` to `source/news/posts/YYYY-MM-DD-short-slug.md`.
2. Copy the news image into `assets/media/news/YYYY/MM/your-image.jpg`.
3. Edit the front matter at the top of the new Markdown file:
   - `title` is the post title.
   - `date` controls the post order.
   - `slug` becomes the URL at `/news/your-slug/`.
   - `description` appears on the News index.
   - `image` should point to the local image path, such as `/assets/media/news/2026/05/your-image.jpg`.
   - `imageAlt` describes the image for accessibility.
4. Set `draft: false` when the post is ready to publish.
5. Rebuild the site from the repository root:

```bash
node tools/build-site.mjs
```

Local Markdown posts are combined with the older imported WordPress news posts automatically. You do not need to edit `source/wordpress/posts.json` for new posts.

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
