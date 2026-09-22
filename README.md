# wvez.org

The site for WVEZ Solutions, a one person automation studio in Chicago. It is the
portfolio, three interactive demos of workflows I have built, and a blog.

![The Ventures panel of wvez.org, showing five projects as pixel art Chicago towers](assets/readme-home.jpg)

Live:

| | |
|---|---|
| [wvez.org](https://wvez.org) | The site. Six panels, a 3D pendant, a photo and video viewer |
| [wvez.org/recon](https://wvez.org/recon) | RECON, competitive inventory and pricing surveillance |
| [wvez.org/flippr](https://wvez.org/flippr) | FLIPPR, eBay resale arbitrage scanning |
| [wvez.org/crp](https://wvez.org/crp) | Content Recipe, creator content auditing |
| [wvez.org/blog](https://wvez.org/blog) | Writing, with an [RSS feed](https://wvez.org/feed.xml) |

## Stack

Hand written HTML, CSS and JavaScript. No framework and no build step for the site
itself. IBM Plex Mono throughout, black text on white, pixel art as the only color.
Hosted on GitHub Pages, which builds the blog with Jekyll.

Each demo is a single self contained file. They run entirely in the browser, call no
real service, and the numbers they display are invented.

## Running it

```bash
python3 -m http.server 8000
```

That serves the landing page and the three demos exactly as they are. It does not
render the blog, which Jekyll builds on GitHub's side, so `/blog` and `/feed.xml` are
checked on the live site after pushing.

## Publishing a post

Add a file to `_posts/` named `YYYY-MM-DD-slug.md`:

```markdown
---
title: The title as it should read
date: 2026-09-22
description: One line. This shows on the index and in the RSS feed.
---
```

Write the body in markdown, then push. The post appears at `wvez.org/blog/slug/` in
about a minute, and the index and the feed update themselves.

When a build fails, GitHub emails the error and keeps serving the last good version of
the site. To read the error:

```bash
gh api repos/warner-wvez/wvez-landing/pages/builds/latest --jq '{status,error:.error.message}'
```

## Layout

```
index.html          the site
crp/ flippr/ recon/ the demos, one file each, URLs are frozen
assets/             images, video, pixel art, the two 3D models
_posts/             blog posts, one markdown file each
_layouts/           the blog's shell and post template
_includes/          custom components, currently just the aside box
blog.html           the writing index
docs/decisions.md   why the site is built this way
```

## House rules

- No em dashes and no emojis, anywhere.
- No large empty regions on any page or in any state.
- `/`, `/crp`, `/flippr` and `/recon` have been shared publicly. They do not move.

Commit messages go through `.githooks/commit-msg`. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[PolyForm Noncommercial 1.0.0](LICENSE). Read it, learn from it, do not sell it.
