const cheerio = require('cheerio');

class HTMLParser {
  constructor() {
    this.$ = null;
  }

  __parseTags($, elements) {
    const tags = [];

    elements.each((index, element) => {
      const tag = $(element).prop('tagName');
      const content = $(element).html();
      const children = $(element).children();

      if (children.length > 0) {
        const nestedTags = this.__parseTags($, children);
        tags.push({ tag, content, children: nestedTags });
      } else {
        tags.push({ tag, content });
      }
    });

    return tags;
  }

  __convertToLatex(parsedTags) {
    let latex = '';

    parsedTags.forEach((tagObj) => {
      const { tag, content, children } = tagObj;

      if (tag === 'H1') {
        latex += this.__convertHeadingToLatex(content, 'section');
      } else if (tag === 'H2') {
        latex += this.__convertHeadingToLatex(content, 'subsection');
      } else if (tag === 'H3') {
        latex += this.__convertHeadingToLatex(content, 'subsubsection');
      } else if (tag === 'P') {
        latex += this.__convertParagraphToLatex(content);
      } else if (tag === 'UL') {
        latex += this.__convertListToLatex(children);
      }
      if (children && children.length > 0) {
        latex += this.__convertToLatex(children);
      }
    });

    return latex;
  }

  __convertListToLatex(children) {
    let latex = '\\begin{itemize}\n';

    children.forEach((child) => {
      latex += `\\item ${child.content}\n`;

      if (child.children && child.children.length > 0) {
        latex += this.__convertToLatex(child.children);
      }
    });

    latex += '\\end{itemize}\n';

    return latex;
  }

  __convertHeadingToLatex(content, headingType) {
    return `\\${headingType}*{${content}}\n`;
  }

  __convertParagraphToLatex(content) {
    return `${content}\n\n`;
  }

  async html2latex(html) {
    try {
      this.$ = cheerio.load(html);
      const rootElement = this.$('body').children();
      const parsedTags = this.__parseTags(this.$, rootElement);
      const parsedLatex = this.__convertToLatex(parsedTags);
      return parsedLatex;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = HTMLParser;
