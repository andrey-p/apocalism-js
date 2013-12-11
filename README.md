Apocalism.js
=====

Automate your short story build process

What is this?
----

This is an app I've been working on to compile my illustrated short stories.
This is a _very early_ version with _a number of problems_ but I've already used it in production - the results can be seen at http://apocalism.co.uk.

It is essentially a beefed-up opinionated Markdown to HTML to PDF generator with pagination and image management.
It's built on NodeJS and uses PhantomJS internally to render PDFs.

Requirements
----

- NodeJS (tested on v0.10.22)
- PhantomJS (tested on 1.9.0)
- pdftk

Quick start
----

This misses out on loads of details, pitfalls, styling hooks and extra options (coming soon: detailed wiki-style guide) but here's a quick runthrough.

Your short story file structure should be the following:

```
project-folder/
|-- images/   <---- 300dpi PNGs
|-- output/   <---- this is where the pdf will be located
|-- story.md  <---- your story file, which I'm assuming contains greatness
```

Fill in Title and Author name and start writing:

```
Title: Foo
Name: John Bar

Lorem ipsum something
```

Images can be added too, you only need to specify the filename and the path gets resolved automatically. So assuming your `images` folder contains `fancy-image.png`, you do:

```
![this is an image from the images folder](fancy-image.png)
```

Call the script with the story markdown filename as the first argument (coming soon: installation via `npm install -g`):

```
/path/to/apocalism/bin/apocalism-cli.js story.md
```

This should result in an A5 pdf booklet with 2mm bleed. Bliss!
