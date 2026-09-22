# Security policy

## Reporting a vulnerability

Email warner@wvez.org with the subject line `wvez.org security`. Include the URL,
what you observed, and the steps to reproduce it. You will get a reply within five
business days, and a fix or a written reason within thirty.

Please do not open a public issue for a security report.

## What is in scope

This repository is the source for https://wvez.org. It is a static site: hand
written HTML, CSS and JavaScript, a set of images, three self contained demo
pages, and markdown posts that GitHub Pages renders with Jekyll.

In scope:

- Content injected into a page through a link, a query string, or a post.
- A dependency loaded from a CDN that could be swapped for something hostile.
- Anything served from wvez.org that leaks data about a visitor.

## What is not in scope

There is no backend, no database, no login, and no user data. The site stores
nothing about visitors and asks them for nothing. There are no API keys or
credentials in this repository; the only credential involved in a deploy is the
token GitHub Pages manages on its own.

The three demo pages under `/crp`, `/flippr` and `/recon` are illustrations. They
run entirely in the browser, call no real service, and hold no real data. The
values they display are invented.
