"use strict";

var sass = require("node-sass"),
  he = require("he"),
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
  function renderElement(tag, text, isBlock) {
    var classMatch = text.match(new RegExp("\\{(" + classesRegex + ")\\}$")),
      classString = "";

    if (classMatch && classMatch[1]) {
      // if the element is block, then replace the newline as well
      text = text.replace(new RegExp((isBlock ? "\\n" : "") + "\\{" + classesRegex + "\\}"), "");
      classString = " class=\"" + classMatch[1] + "\"";
    }

    return "<" + tag + classString + ">" + text + "</" + tag + ">";
  }

  renderer.list = function (body, ordered) {
    // if the last li contains a curly brace statement
    // it belongs to the list rather than the item
    // so switch it over
    var liWithClassRegex = new RegExp("\\n\\{(" + classesRegex + ")\\}</li>"),
      classMatch = body.match(liWithClassRegex);

    if (classMatch && classMatch[1]) {
      body = body.replace(liWithClassRegex, "</li>");
      body += "\n{" + classMatch[1] + "}";
    }

    return renderElement(ordered ? "ol" : "ul", body, true);
  };

  renderer.heading = function (text, level) {
    return renderElement("h" + level, text, true);
  };

  renderer.blockquote = function (text) {
    return renderElement("blockquote", text, true);
  };

  renderer.paragraph = function (text) {
    return renderElement("p", text, true);
  };

  renderer.em = function (text) {
    return renderElement("em", text, false);
  };

  renderer.strong = function (text) {
    return renderElement("strong", text, false);
  };

  return renderer;
}

function addOpeningClassToTokens(tokens) {
  var i,
    level = 0,
    hangingCharsRegex = "'|\"";

  // add "opening" to the first paragraph
  // but only if we're not in another block level element
  // i.e. list or blockquote
  for (i = 0; i < tokens.length; i += 1) {
    if (tokens[i].type.indexOf("_start") > -1) {
      level += 1;
    } else if (tokens[i].type.indexOf("_end") > -1) {
      level -= 1;
    } else if (tokens[i].type === "paragraph" && level === 0) {
      if (tokens[i].text.indexOf("\n{") > -1) {
        tokens[i].text = tokens[i].text.replace("}", " opening}");
      } else {
        tokens[i].text += "\n{opening}";
      }

      // add the class "cap" to the first non-alphanumeric letter
      // but ignore any quotes when picking the initial character
      tokens[i].text = tokens[i].text.replace(new RegExp("^(" + hangingCharsRegex + ")?([a-zA-Z0-9])"), "$1<span class=\"cap\">$2</span>");

      break;
    }
  }

  return tokens;
}

exports.parseMarkdown = function (markdown) {
  var markup,
    lexer = getLexer(),
    renderer = getRenderer(),
    parser = new marked.Parser({ renderer: renderer }),
    tokens;

  tokens = lexer.lex(markdown);

  tokens = addOpeningClassToTokens(tokens);

  markup = parser.parse(tokens);

  // decode html entities as typogr misses them otherwise
  markup = he.decode(markup);

  // typographic fanciness
  if (markup.length) {
    markup = typogr.typogrify(markup);
  }

  return markup;
};