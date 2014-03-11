0.3.9
===

- fixed issue with weird missing dot (see [#19](https://github.com/andrey-p/apocalism-js/issues/19))
- some improvements to error and status reporting from within the phantom processes
- fixed style issue with line that should have zero indentation immediately after an `<hr>` tag
- some cleaning out (moved jslint cruft into a jslintrc file, removed long-stack-traces)

0.3.8
===

- --debug pages are now output with utf-8 encoding
- css is output compressed
- updated dependencies

0.3.7
===

- changed the way dropcaps work (they are now given the `cap` class)
- added support for hanging quotation marks (see [#14](https://github.com/andrey-p/apocalism-js/issues/14))

0.3.6
===

- refactored book.js and improved test coverage
- improved the way empty sections are handled (see [#15](https://github.com/andrey-p/apocalism-js/issues/15))
- added an --ignore-blank option to the command line

0.3.5
====

- refactored the way phantomjs is used as a dependency (making it easier to manage the version currently in use), fixes [#13](https://github.com/andrey-p/apocalism-js/issues/10)
- switched to websockets for everything phantomjs-related, gaining a huge performance boost [#7](https://github.com/andrey-p/apocalism-js/issues/7)

0.3.4
====

- fixed crash with null section contents
- fixed [#10](https://github.com/andrey-p/apocalism-js/issues/10)

0.3.3
====

- added support for jpg image formats (issue [#5](https://github.com/andrey-p/apocalism-js/issues/5))
- added dpi settings in options
- some refactoring for reader
- improved test coverage

0.3.2
====

- fixed [#9](https://github.com/andrey-p/apocalism-js/issues/9)

0.3.0
====

- it is now possible to update options through a manifest (`story.json` inside the project folder)
- added custom styling syntax

0.2.2
====

- added this changelog
- removed caching feature
- added --debug flag for the CLI
