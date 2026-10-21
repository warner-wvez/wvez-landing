# Contributing

This is a personal site, so the audience for this file is mostly future me.

## Running it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. That serves the landing page and the three demos
exactly as they are. It does not run Jekyll, so anything under `_layouts`, `_posts` or
`_drafts` will not render locally.

## Writing a post

Writing is the fourth panel of the site. The panel is the index and each post opens as its
own page. A post you are not ready to publish goes in `_drafts/`, where it needs no date in
the filename.

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

GitHub builds it and the post appears at `https://wvez.org/blog/slug/` in about a minute,
with the Writing panel and the feed at `/feed.xml` updating themselves. The reading time
next to the date is counted from the post's words on every build, so it never needs
setting by hand.

Images and clips for a post go in `assets/blog/<slug>/`, referenced as
`/assets/blog/<slug>/name.jpg`.

For an aside in a box, use the one custom component:

```liquid
{% capture notice %}
**New here?** Text of the aside, in markdown.
{% endcapture %}
{% include notice.html content=notice %}
```

A box that holds images or columns is easier to write as HTML. `markdown="1"` lets
markdown work inside it:

```html
<aside class="notice" markdown="1">
<div class="cols">
<figure><img src="/assets/blog/slug/a.png" alt=""><figcaption>Left caption</figcaption></figure>
<figure><img src="/assets/blog/slug/b.png" alt=""><figcaption>Right caption</figcaption></figure>
</div>

*Text under both images.*
</aside>
```

`cols` makes two columns, or more with `style="--cols: 3"`. On phones they stack.

### Section rail

Every post with three or more `##` headings gets Notion's outline at the right edge of
the screen: one line per heading, the current one black. Hovering it opens the list.
Nothing to write; it reads the headings. It hides below 1000px wide, where it would sit
on top of the text.

### Light and dark mode

Post pages have a light switch: a pixel-art dot on a string at the top right, in line with
the section rail. Pull it down or tap it. The string is a small physics model, so it
stretches when pulled, bounces back, and swings when the mouse brushes it. It only runs while
something is moving. The reader's choice is remembered; until they choose, their system
setting decides. The dot is drawn from a text map in `assets/blog/theme.js`, one character
per pixel, and the bounce is tuned by the numbers at the top of that file (gravity, damping,
stiffness, speed limit). Diagrams follow the switch, including ones already open.
Each time a post opens, the string starts bunched at the top edge and drops to rest with
a small bounce; readers who ask their device for reduced motion see it already hanging.

The bar at the top of every post reads WVEZ Solutions on the left, the WVEZ monogram from
the demos in the centre (drawn by `assets/demo-monogram.js`), and Writing on the right.
Writing and the "All writing" link at the bottom both go back to the Writing section of
the home page.

### Images

Clicking any image in a post opens it full size in a window in front of the post, with its
caption. The x or Esc closes it. Nothing to write; every image gets this.

### Links

Every link in a post opens in a new tab, so a reader keeps their place. Links to a
section of the same page (`#heading`) stay in the same tab.

### Link previews

Hovering a link to an image, an `.mp4`, an `.mp3` or a YouTube video shows it in a box
beside the link. Moving off stops it. On a phone, a tap opens the box instead of the link.

A YouTube preview shows YouTube's own title, logo and buttons, and they cannot be hidden.
For a clean box, save the clip as an mp4 in `assets/blog/<slug>/` and point the link at
it in the front matter. The link itself still goes to YouTube:

```yaml
previews:
  "https://www.youtube.com/watch?v=WJngbyHgS8E":
    src: /assets/blog/slug/clip.mp4
    label: Iron Man (2008)
    credit: marvel clips on YouTube   # shown as "Via ...", linking to the original
  "https://medium.com/":
    src: none            # a plain link, no preview
```

The key is the link's address, exactly as written in the post. `start` and `end`
(seconds) trim a YouTube preview; trim an mp4 itself before adding it. Keep clips to the
few seconds the post is about. Put quotes around any value with a `#` in it, like a
channel called "Horror future #7": unquoted, everything from the `#` on is dropped as a
comment.

A word can show a definition instead. Link the word to where the definition comes from,
then give the text in the front matter. Hovering shows the word in bold, the text, and a
"Via ..." link back to the source. Copy the source's text as written, and use a blank
line to start a new paragraph:

```yaml
previews:
  "https://larping.urbanup.com/15927973":
    word: larping
    define: "When someone is pretending to be something they’re not. ..."
    credit: Urban Dictionary
```

To make a clip: download with [yt-dlp](https://github.com/yt-dlp/yt-dlp), then cut and
shrink it with ffmpeg. `-ss` and `-to` are the start and end in seconds.

```bash
uvx --from yt-dlp yt-dlp --js-runtimes node -f "bv*[height<=720][ext=mp4]+ba[ext=m4a]" \
  --merge-output-format mp4 -o full.mp4 "https://www.youtube.com/watch?v=ID"
ffmpeg -ss 31.8 -to 39.3 -i full.mp4 -vf "scale=640:-2,fps=30" -c:v libx264 -preset slow \
  -crf 26 -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart clip.mp4
```

Each clip comes out under about 1MB.

Browsers only allow sound after the reader has clicked something on the page. Before
that, a clip plays silently and the box offers "Click for sound".

### Workflow diagrams

Each diagram is its own page in `assets/blog/workflows/`. Put one in a post with:

```liquid
{% include workflow.html name="job-hunt" title="Job-hunt Slack bot" %}
```

It is the same width as the text; on phones it turns into a tap-to-open list.

To keep several diagrams in one place, so a reader can skip all of them in one scroll,
put them in one block with a tab each:

```liquid
{% include workflows.html names="job-hunt,ebay-flipping" labels="Job hunt,eBay flipping" %}
```

`names` are the file names without `.html`. `labels` are the tab names, in the same order.

To put a list of workflows beside their diagrams, write the list in a capture and name one
diagram per top-level bullet, in order. Clicking a bullet shows its diagram. Leave a name
empty for a bullet with no diagram:

```liquid
{% capture flows %}
- **Job hunt**: what it does
- **Dispensary monitor**: what it does
- **eBay flipping**: what it does
{% endcapture %}
{% include workflow-split.html list=flows names="job-hunt,,ebay-flipping" %}
```

The block stays inside the text column, so the diagram is drawn at about half size and a
"View larger" button opens it full size in a window over the post, closed by its x or Esc. On phones the diagram drops under the list.

To show every workflow with its diagram and text at once, put cards in a grid. Each card
is the workflow's name, its diagram, then its text split into short lines, one sentence
(or one step of a long sentence) per bullet. A bold line on its own starts a sub-group:

```liquid
<div class="wf-grid">
{% capture text %}
- First sentence.
- Second sentence.

**Sub-workflow:**

- Its sentence.
{% endcapture %}
{% include workflow-card.html name="job-hunt" title="Job hunt" text=text %}
</div>
```

The grid is two cards a row with gridlines, and it is the one block allowed wider than
the text column: up to 1000px, centred on the column, and clear of the outline at the
right edge. Below 640px it is one card a row. The card's name replaces the diagram's own
title (the frame loads with `?canvas&bare`), and "View larger" opens the full diagram.

The diagrams are built from `build.py`, which lives outside this repository. Rebuild
there, then copy the html files in.

### Email signup box

Every post ends with an email signup box. It comes from the post layout, so a new
post gets it without doing anything. Its words (the line above the box, the button,
the four messages, and the note under the thank-you line) and the Brevo form address
all live under `subscribe:` in `_config.yml`. Change them there and every box on the
site follows.

To put a box somewhere else, add `{% include subscribe.html spot="NAME" %}` with a
short `NAME` for the spot. GoatCounter records each signup as an event called
`subscribe-NAME`, so the spots can be compared. A page outside the post layout also
needs the box's CSS, which lives in `_layouts/post.html`.

The moving brick wall behind the box is `assets/blog/subscribe-art.js`, a copy of the
"rotozoomer" piece from ascii.rest under the MIT License. Another ascii.rest piece can
replace it: swap the piece's code in that file and keep the player below it. Keep the license text at the top of that
file. Its look (size, colour, how faint) is the `.subscribe-art` rule in the post layout.

The welcome email lives in Brevo, not here. The form "Blog after post" (Marketing,
Forms) picks which email to send under its Settings step; the email itself is edited
under Marketing, Templates.

## From Notion to a post

Posts are drafted in Notion. These are the conversions:

| Notion | Post |
|---|---|
| Heading 1 or 2 | `##` (the title is the only H1) |
| Heading 3 | `###` |
| Callout, any colour | `<aside class="notice" markdown="1">`. The site is black and white, so every colour becomes the grey box |
| Columns | `<div class="cols">` |
| Image with caption | `<figure>` with `<figcaption>`, file saved to `assets/blog/<slug>/` |
| Quote | `>` |
| Centred text | the line as written, then `{: .center}` on the next line (`{: .center .small}` for three quarters size) |
| Divider | `---` |
| Blank to fill in, like `____` | `\_\_\_\_`, or markdown reads it as italics |
| Link to a clip or image | the same link, plus a `previews:` entry when it should play a local mp4 |
| Word linked to a dictionary page | the same link, plus a `previews:` entry with `define:` |
| Bullets of workflows, each `**Name**: text` | a `wf-grid` of `workflow-card.html`: the name becomes the card title (its colon dropped), the text splits into one bullet per sentence, words unchanged |

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
