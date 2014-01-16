/*jslint indent: 2, node: true*/
"use strict";

var sass = require("node-sass"),
  ent = require("ent"),
  marked = require("marked"),
  typogr = require("typogr"),
  classesRegex = "[a-zA-Z0-9 _\\-]+";

function getLexer() {
  var lexer = new marked.Lexer();

  // customizing the marked heading regex
  // so that it can catch any classes in curly braces on a newline after it
  // NOTE: this gets tripped up by closing hashes
  // - also I guess underlined headings don't work?
  lexer.rules.heading = new RegExp("^ *(#{1,6}) *([^\\n]+(\\n{" + classesRegex + "})?) *#* *(?:\\n+|$)");

  return lexer;
}

function getRenderer() {
  var renderer = new marked.Renderer();

  // takes any hanging curly braces at the end of the element
  // uses the contents of curly braces as a class string
  // and removes them from the end of the element
  function renderBlockLevelElement(tag, text) {
    var classMatch = text.match(new RegExp("\\{(" + classesRegex + ")\\}$")),
      classString = "";

    if (classMatch && classMatch[1]) {
      text = text.replace(new RegExp("\\n\\{" + classesRegex + "\\}"), "");
      classString = " class=\"" + classMatch[1] + "\"";
    }

    return "<" + tag + classString + ">" + text + "</" + tag + ">";
  }

  renderer.heading = function (text, level) {
    return renderBlockLevelElement("h" + level, text);
  };

  renderer.blockquote = function (text) {
    return renderBlockLevelElement("blockquote", text);
  };

  renderer.paragraph = function (text) {
    return renderBlockLevelElement("p", text);
  };

  return renderer;
}

exports.fromMarkdown = function (markdown) {
  var markup,
    lexer = getLexer(),
    renderer = getRenderer(),
    parser = new marked.Parser({ renderer: renderer }),
    tokens,
    i;

  tokens = lexer.lex(markdown);

  // add "opening" to the first paragraph
  for (i = 0; i < tokens.length; i += 1) {
    if (tokens[i].type === "paragraph") {
      if (tokens[i].text.indexOf("\n{") > -1) {
        tokens[i].text = tokens[i].text.replace("}", " opening}");
      } else {
        tokens[i].text += "\n{opening}";
      }

      break;
    }
  }

  markup = parser.parse(tokens);

  // decode html entities as typogr misses them otherwise
  markup = ent.decode(markup);

  // typographic fanciness
  markup = typogr.typogrify(markup);

  return markup;
};

// currently assumes that body has no class
// this might cause problems down the line?
exports.getBodyContent = function (markup) {
  var startIndex = markup.indexOf("<body>") + 6,
    endIndex = markup.indexOf("</body>");
  return markup.slice(startIndex, endIndex);
};
