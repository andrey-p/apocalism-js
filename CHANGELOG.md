0.5.1
===

- unbroke previous release (oops)

0.5.0
===

- specified when an empty section does not generate an empty page [as mentioned here](https://github.com/andrey-p/apocalism-js/issues/31) (potentially breaking some styles)
- fixed incorrect shebang for the executable (issue [here](https://github.com/andrey-p/apocalism-js/issues/30))

0.4.4
===

- minor performance increase for PDF generation

0.4.3
===

- added output format to page classes

0.4.2
===

- updated to latest version of ectoplasm (contains bugfixes, slightly different API)

0.4.1
===

- added --no-images flag
- added block-level style hooks for lists

0.4.0
===

Massive massive rewrite!

- updated all dependencies
- moved all code that deals with modifying the text into a separate folder of single-purpose modules (see the `formatters` folder)
- moved all code that outputs stuff to the output folder into a series of single-purpose modules (see the `outputters` folder)
- generally cleaned up, streamlined and made everything loads more modular
- streamlined CLI
- switched to using `ectoplasm` for handling PhantomJS scripts
- made sure everything is true async to avoid unleashing Zalgo

0.3.14
===

- updated phantomjs NPM module dependency to avoid [this bug](https://github.com/Medium/phantomjs/issues/161)

0.3.13
===

- merged in [pull request #23](https://github.com/andrey-p/apocalism-js/pull/23), changing to `he` for html entity encoding
- added a couple of mixins for common tasks (see [#20](https://github.com/andrey-p/apocalism-js/issues/20))
- added removing of empty `<p>` tags inside phantom-wrapper (see [#22](https://github.com/andrey-p/apocalism-js/issues/22))

0.3.12
===

- temporarily set json2sass dependency to point to the specific Github commit

0.3.11
===

- fixed issue with page breaking after an image, when it's followed by text

0.3.10
===

- added example project and some extra bits in the readme
- updated binary name to just `apocalism`
- fixed problem with --ignore-blank not working properly

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
