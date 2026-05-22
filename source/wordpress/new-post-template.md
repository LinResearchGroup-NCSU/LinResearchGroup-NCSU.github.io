# New News Post Template

Use this when you have a title, one description paragraph, and one image.

1. Copy your image into `assets/media/YYYY/MM/IMAGE_FILENAME`.
2. Copy the JSON object below.
3. Paste it as the first object in `source/wordpress/posts.json`, right after the opening `[`.
4. Add a comma after this new object before the existing first post.
5. Replace every placeholder value.
6. Run `node tools/build-site.mjs`.

```json
{
  "id": 999999,
  "date": "YYYY-MM-DDTHH:MM:SS",
  "date_gmt": "YYYY-MM-DDTHH:MM:SS",
  "guid": {
    "rendered": "https://lingroup.wordpress.ncsu.edu/?p=999999"
  },
  "modified": "YYYY-MM-DDTHH:MM:SS",
  "modified_gmt": "YYYY-MM-DDTHH:MM:SS",
  "slug": "post-slug-in-lowercase-with-hyphens",
  "status": "publish",
  "type": "post",
  "link": "https://lingroup.wordpress.ncsu.edu/YYYY/MM/DD/post-slug-in-lowercase-with-hyphens/",
  "title": {
    "rendered": "POST TITLE"
  },
  "content": {
    "rendered": "\n<p>POST DESCRIPTION PARAGRAPH.</p>\n\n<figure class=\"wp-block-image size-large\"><img src=\"/assets/media/YYYY/MM/IMAGE_FILENAME\" alt=\"IMAGE ALT TEXT\"></figure>\n",
    "protected": false
  },
  "excerpt": {
    "rendered": "<p>POST DESCRIPTION PARAGRAPH.</p>\n",
    "protected": false
  },
  "author": 10555,
  "featured_media": 0,
  "comment_status": "closed",
  "ping_status": "closed",
  "sticky": false,
  "template": "",
  "format": "standard",
  "categories": [
    1
  ],
  "tags": []
}
```

Example image path:

```text
/assets/media/2026/06/group-award-photo.jpg
```

The first image in `content.rendered` becomes the thumbnail on the News page.
