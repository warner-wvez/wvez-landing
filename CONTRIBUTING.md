# Contributing

This is a personal site, so the audience for this file is mostly future me.

## Running it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. That serves the landing page and the three demos
exactly as they are. It does not render the blog: those pages are built by Jekyll
on GitHub's side, so `/blog` and `/feed.xml` are checked on the live site after a
push.

## Writing a post

1. Add a file to `_posts/` named `YYYY-MM-DD-slug.md`.
2. Start it with front matter:

```markdown
---
title: The title as it should read
date: 2026-09-22
description: One line. This shows on the index and in the RSS feed.
---
```

3. Write the body in markdown. Push.

GitHub builds it and the post appears at `https://wvez.org/blog/slug/` in about a
minute. The index at `/blog/` and the feed at `/feed.xml` update themselves.

Images for a post go in `assets/posts/`, referenced as `/assets/posts/name.jpg`.

For an aside in a box, use the one custom component:

```liquid
{% capture notice %}
**New here?** Text of the aside, in markdown.
{% endcapture %}
{% include notice.html content=notice %}
```

## When a build fails

GitHub emails the error and keeps serving the last good version of the site, so a
broken post never takes the site down. To see the error:

```bash
gh api repos/warner-wvez/wvez-landing/pages/builds/latest --jq '{status,error:.error.message}'
```

Almost every failure is front matter: an unquoted colon or apostrophe in the
title. Quote the title and push again.

## Writing in Obsidian

Open `_posts` as a vault. Then go to Settings, Files and links, and turn off
"Use [[Wikilinks]]". Obsidian will write standard `[text](url)` links, which
Jekyll renders. Left on, links show up as literal brackets on the live site.

## Commit messages

The repository carries a copy of the commit message gate at
`.githooks/commit-msg`. Enable it once:

```bash
git config core.hooksPath .githooks
```

A title is a sentence in the imperative, capitalized, no trailing period, under
70 characters. The body explains why, wrapped at 80.

## House rules

- No em dashes and no emojis, anywhere. Commas, colons and periods.
- No large empty regions on any page or in any state.
- The URLs `/`, `/crp`, `/flippr` and `/recon` are shared publicly. They do not move.
