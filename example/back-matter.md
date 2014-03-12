This is one of two sections (`front-matter` and `back-matter` that allow you to add content before and after the main body of your text.

This is useful for title pages, acknowledgements, etc that don't really fit in the main body of the text.
You can also pad out the pages until they're divisible by 4 (you may have noticed the little warning there).

Two more things you may have noticed:

`front-cover.png` is used as an image for the front cover and `back-cover.md` is used as contents for the back cover.
For the covers (`front-cover` and `back-cover`), `apocalism.js` checks for the presence of a markdown file first, and then an image file.
If it finds neither, it defaults to a blank page.

There's a couple of blank pages not accounted for so far, after the front cover and before the back cover.
These are for the inside pages of the covers (`inside-front-cover` and `inside-back-cover`)
If you're not planning to print your thing, you may want to omit blank pages by using the `--ignore-blank` flag.

See the *Book format and structure* section in the wiki for more info.
