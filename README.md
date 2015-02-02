Apocalism.js
=====

Automate your short story build process

[![Build Status](https://travis-ci.org/andrey-p/apocalism-js.svg?branch=master)](https://travis-ci.org/andrey-p/apocalism-js)

What is this?
----

This is an app I've been working on to compile my illustrated short stories.
This is a _very early_ version with _a number of problems_ but I've already used it in production - the results can be seen at http://apocalism.co.uk.

It is essentially a beefed-up opinionated Markdown to HTML to PDF generator with pagination, image management and custom styling capabilities.
You supply a Markdown file and high-res images and you get a print-ready PDF, bleeds and everything.
You can also build an HTML-only paginated version if you want, too.

`apocalism.js` built on NodeJS and uses PhantomJS internally to render PDFs.

Who is this for?
---

It is meant for self publishing writers who:

- want to work on the content and style of their writing at the same time (but within separate files)
- want an unobtrusive writing format (Markdown with a few extra bits and bobs)
- want a styling method that is powerful, popular and easy to pick up (Sass/CSS)
- want to work in a text editor of their choice
- are comfortable working with a command line interface

(At least one of those is known to exist at the time of writing.)

Requirements
----

- NodeJS (tested on v0.10.22)
- [pdftk](https://www.pdflabs.com/tools/pdftk-server/)
- [graphicsmagick](http://www.graphicsmagick.org/)
- pdfinfo (for local tests only - your distro might have this already)

Installation
----

```
npm install -g apocalism-js
```

Usage
----

Check out the example in `example/`.
Run the example by doing either `make example` or, if you've installed using `npm -g` use `apocalism example/example.md`.

Loads of useful info in the [wiki](https://github.com/andrey-p/apocalism-js/wiki).

But... why?
----

I've written up a [blog post](http://andrey-p.github.io/blog/2014/10/24/apocalism-js/) about how and why I wrote this tool.
