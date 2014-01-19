Apocalism.js
=====

Automate your short story build process

What is this?
----

This is an app I've been working on to compile my illustrated short stories.
This is a _very early_ version with _a number of problems_ but I've already used it in production - the results can be seen at http://apocalism.co.uk.

It is essentially a beefed-up opinionated Markdown to HTML to PDF generator with pagination, image management and custom styling capabilities.
It's built on NodeJS and uses PhantomJS internally to render PDFs.

Requirements
----

- NodeJS (tested on v0.10.22)
- PhantomJS (tested on 1.9.0)
- pdftk

Quick start
----

Loads of useful info in the [wiki](https://github.com/andrey-p/apocalism-js/wiki).

But... why?
----

Some time ago I started working on an illustrated short story thing. As a Linux user, I started with an OSS alternative to InDesign called [Scribus](http://scribus.net/canvas/Scribus).

It was ok enough, but the workflow was painful. I worked on the layout and the content (both text and images) simultaneously so a lot of unnecessary copy and pasting was needed as well as repeat formatting work and so on.

What I needed was something that would allow me to work on the content and layout side by side, and something that did its magic via the command line so I could integrate it with an XCF to PNG conversion script. Being able to work in a plain text file would also be good, so I could Vim and git to my heart's content.

[LaTeX](http://latex-project.org/) almost fit the bill. That is, until I had to spend an afternoon trying (and failing) to move an image three milimetres to the right.

So I made this instead.
