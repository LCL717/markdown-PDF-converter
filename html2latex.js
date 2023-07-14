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
        if (typeof children === 'undefined'){
          latex += this.__convertParagraphToLatex(content);
        } else {
          latex += this.__convertComplexPassageToLatex(content, children);
        }
      } else if (tag === 'UL') {
        latex += this.__convertListToLatex(children, tag);
      } else if (tag === 'OL') {
        latex += this.__convertListToLatex(children, tag);
      } else if (tag === 'TABLE') {
        latex += this.__convertTableToLatex(children);
      }
      if (children && children.length > 0) {
        latex += this.__convertToLatex(children);
      }
    });

    return latex;
  }

  __convertComplexPassageToLatex(content, children){
    let latex = '';
    if (children[0].tag === 'IMG') {
      latex = this.__convertImgToLatex(content);
    } else {
      latex = this.__convertComplexPToLatex(content);
    }
    return latex
  }

  __convertComplexPToLatex(content){
    content = content.replace(/<strong>(.*?)<\/strong>/g, "\\textbf{$1}");
    content = content.replace(/<em>(.*?)<\/em>/g, "\\textit{$1}");
    content = content.replace(/<a href="(.*?)">(.*?)<\/a>/g, '\\href{$1}{$2}');
    return content + '\n'
  }

  __convertImgToLatex(content){
    let latex = '';
    const regex = /<img\s+src="([^"]+)"\s+alt="([^"]+)">/i;
    const match = regex.exec(content);
    const src = match[1];
    const alt = match[2];
    latex += '\\begin{figure}[htbp]\n\\centering\n\\resizebox{0.5\\textwidth}{!}{%\n\\includegraphics{';
    latex += src;
    latex += '}}\n\\caption{'
    latex += alt
    latex += '}\n\\end{figure}\n';
    return latex
  }

  __convertListToLatex(children, tag) {
    let latex = '';
    if( tag === 'UL' ){
      latex = '\\begin{itemize}\n';
    } else if(tag === 'OL'){
      latex = '\\begin{enumerate}\n';
    }

    children.forEach((child) => {
      latex += `\\item ${child.content}\n`;

      if (child.children && child.children.length > 0) {
        latex += this.__convertToLatex(child.children);
      }
    });
    if( tag === 'UL' ){
      latex += '\\end{itemize}\n';
    } else if(tag === 'OL'){
      latex += '\\end{enumerate}\n';
    }

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
  
    return latex + '\\end{tabular}\n\\end{table}\n';
  }

  __parseTableHeader(header) {
    let latex = '';
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
    return `${content}\n`;
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
