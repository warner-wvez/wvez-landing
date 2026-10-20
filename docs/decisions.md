# Decisions

Why the site is built the way it is. Newest first. A decision here is settled, so if
one turns out to be wrong, the fix is a new entry that says so, not an edit to the old one.

## Posts get a way back, and the switch drops in

2026-10-20

- **"All writing" sits above the date** on every post, centred like the rest of the
  header, in full black so it reads as the thing to click. The link at the bottom stays.
  Both open the Writing section (`/#writing`).
- **The light switch drops down when a post opens.** The string starts bunched at the
  top edge and falls to rest with a bounce, so the switch announces itself without a
  label. Readers who ask for reduced motion get it already hanging.

## The demos show the monogram in text, not a 3D pendant

2026-10-20

The spinning 3D pendant at the top right of RECON, FLIPPR and Content Recipe is now the
round WVEZ monogram drawn in IBM Plex Mono characters (the demos' own font), in the same
box (125px, 200px on Content Recipe), with a shine that crosses it every five seconds. It
follows the "polar" piece from ascii.rest (MIT, license in `assets/demo-monogram.js`):
each cell holds the character whose shape best matches the logo's edge, and 8 where it is
solid. The art comes from the logo's white letter faces; the black outlines between them
stay empty, which is what keeps the letters apart at this size. The demos no longer load
the 3D viewer library or the pendant model, the shine pauses off screen, and it holds
still for reduced motion. Phones still hide the logo, as before. The generator
(`make.py`) lives in the local preview kit, outside this repository, like the diagrams'.

## The demo workflow builders show less chrome

2026-10-20

In RECON, FLIPPR and Content Recipe, the workflow builder lost its green "Active" badge
(the title now leads the header), the node and connection counts with their coloured dots
in the footer (the "Tap Add Node · N nodes left" hint stays, centred), and the "Full n8n
workflow · N nodes · V1.0" caption under the builder. The counting code that fed those
labels went with them.

RECON's five small round nodes (the models, tool and loader that hang off the Agent and
the two memory nodes) now show a label card on hover or keyboard focus, styled like a
full node: the type in small caps over the name. It replaces the browser's own tooltip,
which was slow to appear and looked nothing like the builder. Near the right edge the card
opens leftward so it stays inside the canvas. Two layout overlaps were fixed the same day:
"Semantic Memory - Insert" in RECON now sits on the row of the node that feeds it, and the
eight Content Recipe steps are spaced evenly so "Data Output" and "Clear Binary" no
longer touch.

## Each demo leads back to Ventures

2026-10-20

The button at the top left of every demo said `< WVEZ.ORG` and loaded the live home page
from the top, so a reader who opened RECON from Ventures lost their place. It now says
`< VENTURES`. Inside the home page's project viewer, it and the Escape key close the
viewer and leave the reader on Ventures with no reload (the demo sends the home page a
`wvez:close-project` message). Opened on its own page, the button goes to `/#ventures`.
The link is relative now, so the local preview no longer jumps to the live site.

The viewer itself lost its white title bar (the demo's name and category, which the demo
already shows in large type) and its X button, since `< VENTURES` and Escape do the same
job. The demo fills the screen. Showing it as a smaller window over Ventures was tried the
same day and turned down.

## The demos lost their background videos

2026-10-20

RECON, FLIPPR and Content Recipe each played a 4K stock clip behind the page, grey and
dimmed, loaded from an outside file host. They came out at Warner's request, with their
style rules and the script that forced them to play on phones. A faint tiled texture
(`beanstalk-dark.png`) went too: the file was never in the repo, so every demo asked for
it and got a 404. The backdrop is now plain black, and the demos load nothing from outside
the site apart from fonts and the visit counter.

## The What I Solve section is gone

2026-10-20

The services menu ("What I Solve", need on the left and what gets built on the right)
came out at Warner's request. The site is six panels now: Home, About, Ventures,
Writing, Photography, Contact. The menu, the dots and the panel order lost one entry
each, and Writing moved from fifth to fourth. An old `/#services` link opens Home,
since an unknown section name falls back to the first panel.

## Each post shows its reading time next to the date

2026-10-20

The date line reads `SEPTEMBER 24, 2026 · 13 MIN READ`. Readers decide whether to
commit at the top of a post, so that is where it goes. The post layout counts the words
on every build and divides by 238 a minute, the average adult silent reading speed for
nonfiction (Brysbaert, 2019), rounded up. Clips and diagrams
are not counted. Keeping the number in Notion was offered and turned down: it would go
stale the first time a post changed length.

## Email signups go to Brevo through a box the site draws itself

2026-10-19

Readers get new posts by email: one field, one button, after every post. RSS stays as
the small footer link for people who already use it, but most readers know an email
box and not a feed.

- **The box is the site's own HTML** (`_includes/subscribe.html`), styled like the
  rest of the post, with no provider logo on the page. It sends the address to a Brevo
  form the same way Brevo's own script does, and shows Warner's own messages in place.
- **Brevo, free plan.** About 100,000 contacts and 300 emails a day. Its emails carry a
  small Brevo logo, which is the price of free. Kit was the first pick (2026-10-07) and
  was dropped: its free plan requires Kit branding on the form and shows other
  newsletters after a signup. Resend was the no-logo option, free only to 1,000
  contacts and needing a small server of its own. Mailchimp's free plan stops at 250
  contacts, and beehiiv's box is its own widget.
- **One step.** No "confirm your email" link to click. Brevo sends the welcome email
  (its "simple confirmation" email) the moment someone signs up.
- **No text messages.** US carriers require paid registration for any texting service.
- **Popups and a sidebar box are possible later** with the same include. A popup would
  appear once, only after most of the post is read, because Google ranks pages lower
  on phones when a popup covers the post on arrival. A box on one side breaks the
  site's symmetry.

- **A moving ascii brick wall sits behind the box**, faint, with the words on a solid
  strip so it never runs through them. It is the "rotozoomer" piece from ascii.rest
  (MIT), copied into `assets/blog/subscribe-art.js` with its license rather than
  loaded from ascii.rest, so the page calls no extra site and the grid can fill any
  box size. It plays only while the box is on screen, and holds still for readers
  who ask their device for reduced motion. The "tunnel" piece was tried first and
  swapped out the same day.

This replaces the 2026-09-22 note that left email subscriptions undecided.

## Visits are counted with GoatCounter

2026-10-19

The blog needs a count of who reads it, and the site has no server to keep logs (GitHub
Pages shows none). GoatCounter's hosted service is free for personal sites and small
businesses, sets no cookies, and needs one script tag. Cloudflare Web Analytics was the
free alternative; GoatCounter was picked for its per-page counts and referrers.

- **Every page carries it**: the landing page, the post layout, and the three demos. The
  dashboard is wvez.goatcounter.com.
- **No cookie banner.** Nothing is stored on the visitor's device.
- **Local previews do not count.** GoatCounter skips localhost by default.
- **RSS readers cannot be counted.** Feed requests go straight to GitHub Pages.

## Post text goes up to 18px

2026-10-14

The first post read as mostly empty space. Measured against eleven other posts at a
1440px screen, the margins were normal (52% of the width empty, against a middle value of
54%). The text was not: 15.2px monospace at line spacing 1.75 was the smallest and loosest
of the group, and fit 62 characters a line where the others fit about 76. Long-form
formatting guides ask for 16px at least and 18 to 20px for long posts.

- **Body text 18px, line spacing 1.6, on desktop.** About 55 characters a line, inside the
  50 to 75 that reads comfortably. The font stays IBM Plex Mono.
- **16px on phones.** Monospace at 18px fits only about 30 characters on a phone line.
- **Everything else scales with it.** Title 40px (about 2.2 times the body), section
  headings 24px, boxes 17px, captions and the workflow cards in step.
- **Dividers stay.** Cutting them was offered and declined.

## A grid of workflow cards is the one block wider than the text column

2026-10-14

The first post lists four workflows, each with a diagram. Clicking a bullet to see its
diagram (the 2026-10-05 layout) hid three of the four at any time, and drew each diagram
at half size. Three layouts that show everything at once were built and compared: a table
(text left, diagram right), a stack (each diagram full width, its text under it) and a
2 x 2 grid of cards. The grid won, at 1000px wide.

- **Wider than the column, on purpose, for this block only.** At 688px each card is
  311px, too small to read a node's name. At 1000px each card is about 470px. The text
  around the grid keeps the 688px column, so the edges still line up everywhere else.
  The grid is centred on the column, never narrower than it, and stops short of the
  outline at the right edge. This replaces the 2026-10-05 rule that no block leaves the
  column.
- **Gridlines, the one place with borders.** A 1px grey line between cards and around
  the grid, so each workflow reads as its own box. The rest of the site keeps no borders.
- **Text split into short lines, words unchanged.** One sentence, or one step of a long
  sentence, per bullet, with sub-workflows under a bold label. Only the colon after each
  workflow's name is gone, because the name became the card's title.

## Post pages get Notion's outline, hover previews and live diagrams, still on Jekyll

2026-10-05

Posts are drafted in Notion and should read like a Notion page on the site: the outline
of lines at the right edge, links to clips and images that play on hover, and the
workflow diagrams working inside the post rather than as screenshots. None of it needed
a new stack. It is one script, `assets/blog/post.js`, and some CSS in the post layout,
and with the script missing every page still reads as plain HTML.

- **Diagrams are frames, not pasted HTML.** Each diagram is a complete page with its own
  styles and script. Inside a frame they cannot collide with the post's CSS, and the
  same file works on its own. The script sizes each frame to its diagram, so a frame
  never scrolls by itself.
- **Video previews are local mp4 files, not YouTube embeds.** A YouTube embed shows
  YouTube's title, channel, logo and buttons over the clip, and none of that can be
  turned off. An mp4 plays in a plain box that matches the site, starts at once, and
  holds only the seconds the post is about. YouTube still works as a fallback for a link
  with no mp4.
- **Sound needs one click first.** Browsers block sound until a reader has clicked
  something on the page, and hovering does not count. A clip plays silently until then
  and offers "Click for sound". There is no way around this rule.
- **No colours.** Notion's blue and grey callouts both become the grey box, because the
  site is black and white.
- **Dark mode is the page inverted, switched by a pixel-art dot on a string.** The pull-cord
  idea comes from GIMMIE. It starts in the reader's system setting and remembers a choice.
  The lit dot is yellow because the home page's rule is "pixel art as only colour"; nothing
  else on the page gains a colour. Switching is instant. The string is simulated (gravity,
  a little stretch, a capped fling) and drawn at 2px per pixel, so it moves like a real cord
  and still reads as pixel art. A bulb came first and was swapped for the plainer dot.
- **One centred column, 688px.** The title, text, boxes, images and diagrams share the
  same left and right edge, with the title centred above them. This is the measure
  wustep.me uses for its posts. The first version capped the text narrower than the title
  and let diagrams run wider, which pushed the text left of centre and made every edge
  jump. A list of workflows set beside its diagrams follows the same rule: the diagram is
  drawn at about half size inside the column, and "View larger" opens it full size. A
  wider block was tried first and broke the edges.

`_config.yml` now sets the post layout explicitly. GitHub Pages already did this through a
plugin, so the live site does not change, but a plain local Jekyll build now matches it.

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
