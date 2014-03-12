This is the first sentence of this example book thing. Notice the dropcap. Cool, eh?

This paragraph uses the custom styling hooks. It should look horrible.
If it annoys you it's easy to change - just tweak the values in style.scss
{horrible}

> Blockquotes are also supported!
>
> Some dude
> {byline}

You can add custom styling hooks to emphasized text too. *See?!{big}*

These are described in more detail in the wiki, *Content styling* section.

A horizontal rule (`---`) produces a break in the text, this is useful for separating sections in a book:

---

There's another custom thing here. Force a page break by adding a line of 3 or more equal signs, like so:

===

---

This page starts with another horizontal rule.
If a horizontal rule appears at the beginning or the end of a page, it is rendered as three asterisks.

(This is done with CSS so it's easy to override. Compile this example with the `--debug` flag to see the default rules that affect its look.
The html files that are used as a source for the pdf will be output at `example/output/debug/`)

===

This page is a different colour for no reason whatsoever. Fret not though, here's a picture of a duck:

![note how you don't need to specify the path to the file, it's resolved to the images/ folder](duck.png)

You can float images if you like! This is done with a combination of an `nth-of-type` CSS selector and the specific class given to this image (`.image-duck`).

![you can leave out the description in here, but I give my images non-descriptive names so writing stuff here helps me loads](duck.png)

We've been breaking pages manually so far, but you don't have to.

Here's some classic Lorem Ipsum that'll flow over onto the next page:

---

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Donec et mollis dolor. Praesent et diam eget libero egestas mattis sit amet vitae augue. Nam tincidunt congue enim, ut porta lorem lacinia consectetur. Donec ut libero sed arcu vehicula ultricies a non tortor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ut gravida lorem. Ut turpis felis, pulvinar a semper sed, adipiscing id dolor. Pellentesque auctor nisi id magna consequat sagittis. Curabitur dapibus enim sit amet elit pharetra tincidunt feugiat nisl imperdiet. Ut convallis libero in urna ultrices accumsan. Donec sed odio eros. Donec viverra mi quis quam pulvinar at malesuada arcu rhoncus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In rutrum accumsan ultricies. Mauris vitae nisi at sem facilisis semper ac in est.
