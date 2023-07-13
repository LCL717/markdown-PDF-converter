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
    console.log(tags);
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
      } else if (tag === 'TABLE') {
        latex += this.__convertTableToLatex(children);
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

  __convertTableToLatex(children) {
    let latex = '\\begin{table}[htbp]\n\\centering\n\\label{tab:example}\n';
  
    children.forEach((child) => {
      if (child.tag === 'THEAD') {
        latex += '\\begin{tabular}{|';
        latex += this.__parseTableHeader(child.children[0]);
      } else if (child.tag === 'TBODY') {
        latex += this.__parseTableBody(child.children);
      }
    });
  
    return latex + '\\end{tabular}\n\\end{table}';
  }

  __parseTableHeader(header) {
    let latex = '';
    console.log(header)
    header.children.forEach((cell) => {
      latex += 'c|';
    });
  
    latex += '}\n\\hline\n';
    latex += this.__parseTableRow(header.children);
    latex += '\\hline\n';
  
    return latex;
  }
  
  __parseTableBody(body) {
    let latex = '';
  
    body.forEach((row) => {
      latex += this.__parseTableRow(row.children);
      latex += '\\hline\n';
    });
  
    return latex;
  }
  
  __parseTableRow(row) {
    let latex = '';
  
    row.forEach((cell) => {
      latex += `${cell.content} & `;
    });
  
    latex = latex.slice(0, -2);
    latex += ' \\\\\n';
  
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
