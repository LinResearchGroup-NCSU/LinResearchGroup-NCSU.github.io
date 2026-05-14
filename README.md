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
- `tools/build-site.mjs` regenerates the static pages from the WordPress export.

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
