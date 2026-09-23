# Decisions

Why the site is built the way it is. Newest first. A decision here is settled, so if
one turns out to be wrong, the fix is a new entry that says so, not an edit to the old one.

## The blog is markdown in this repository, rendered by Jekyll

2026-09-22

I wanted a place to write at wvez.org/blog without turning the site into an application.
Three setups were on the table, taken from sites I read:

- **Substack, with the titles pulled back onto the site.** This is what tmb.sh does. It
  solves email subscriptions and comments on day one, but the writing lives on
  substack.com and the traffic leaves my domain.
- **Notion as the source, rendered by the site.** This is what wustep.me does. It is the
  best writing experience of the three and the worst to leave: the posts are rows in
  Notion, not files I own.
- **Markdown files in the repository.** This is what mtlynch.io does, and it is what I
  picked. A post is a text file. Any editor works, including Obsidian pointed at the
  folder, and if I ever leave Jekyll the posts come with me.

The renderer is Jekyll because GitHub Pages already runs it on this repository and was
sitting idle with nothing to build. That means no build script to maintain, no GitHub
Action, and no generated HTML committed here. The cost is that previewing locally needs a
Ruby toolchain I do not have, so a post is checked on the live page after pushing. A failed
build leaves the previous version of the site serving, so that is a safe trade.

Rejected along the way: a hand written Python build script with its own tests and a
workflow to run it. It worked on paper and was about 150 lines of my code doing a job
GitHub already does for free.

An RSS feed comes free with the plugin and turns on with the blog. Email subscriptions are
a separate decision and are deliberately not here: Buttondown is free to 100 subscribers but
charges 9 dollars a month for the RSS to email feature, and I would rather price that
properly than default to a vendor.

## Writing is the fifth panel, and the panel is the index

2026-09-23

Writing sits between Services and Photography in the panel deck, and that panel is the post
index: one row per post, grouped by year, newest first. Clicking a row opens the post as its
own page at `/blog/<slug>`, which scrolls normally. `/blog` redirects to `/#writing`.

The three portfolio sites I looked at all treat writing as a top-level destination placed
early, never as a widget scattered on the home page: andrewl.ee has it second of three,
tmb.sh second of four, wustep.me as a top-level link. A panel is the version of that which
fits a deck.

The Photography panel already proved the pattern here: a panel that is a dense list, where
clicking an item opens the content. Writing copies it.

Making it a panel costs one thing. `index.html` now carries Jekyll front matter so the panel
can be rendered from `_posts/`. It was safe to add because the file contains no `{{` or `{%`
anywhere, so nothing in the hand written HTML or JavaScript collides with Liquid. Everything
outside the Writing panel passes through untouched.

The panel will look sparse for a while. That is accepted: it fills as posts accumulate, and
a page that grows is not the same thing as a screen with a permanent hole in it.

Adding the panel also added hash routing, so `/#writing`, `/#ventures` and every other
section can be linked directly. It uses `replaceState`, not `pushState`, so the back button
still leaves the site rather than walking back through panels.

## The demo URLs do not move

2026-09-22

`/crp`, `/flippr` and `/recon` have been shared publicly, so they are frozen. Each demo
stays a single self contained HTML file at the top level of the repository, even though
grouping them under a `demos/` folder would be tidier. Tidier is not worth a dead link.

## The landing page stays one hand written file

2026-09-22

`index.html` is about 1,660 lines of hand written HTML, CSS and JavaScript with no build
step and no framework. It is a single page with six panels, a 3D model, a photo viewer and
a video viewer, and it loads with nothing but a font and the model-viewer script.

A framework would make it easier to share pieces between the landing page and the demos.
It would also mean a build step, a dependency tree, and a page that cannot be opened by
double clicking the file. For a site this size that trade is not worth it.
