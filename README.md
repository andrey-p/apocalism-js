Apocalism.js
=====

Automate your short story build process

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

Some time ago I started working on an illustrated short story thing called *Apocalism!*.
The lack of suitable tools was at least part of the reason why I never managed to finish it.

As a Linux user, I tried a couple of OSS desktop publishing tools.

Scribus was ok but didn't fit in with the efficient command-line-based workflow I'd become used to as a programmer, and forced me to work on content and layout separately.

LaTeX was a step in the right direction but was too restrictive. Creating anything that didn't look like a dissertation was a headache, and I gave up on it after spending an afternoon trying to move an image 3mm to the right.

At the end I decided it would be loads easier to roll my own solution, and put this together.

I named it `apocalism.js` in memory of that long-dead project.
