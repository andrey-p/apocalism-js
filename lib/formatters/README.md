Formatters
===

Formatters apply formatting changes to the text.

The text as an array of chunks, each of them having a content property. It can be formatted as either HTML or MD - use the comments at the top of each formatter as a guide about what assumptions the formatter makes about the content passed to it and what kind of content it outputs.

The last argument passed to a formatter is a callback (as you'd expect) and the second-to-last is always the array of content chunks. The only non-error argument a formatter should output is the modified array of chunks. This is so that the formatters can be chained easily with `async.waterfall` and `async.apply`.

These could hopefully be redone as a series of streams in the future - for extra flexibility, mild performance increase and better status handling.
