const cheerio = require('cheerio');
const path = require('path');
const axios = require('axios')
const fs = require('fs');

const imgpath = 'img'

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
      const className = $(element).attr('class');

      if (children.length > 0) {
        const nestedTags = this.__parseTags($, children);
        tags.push({ tag, content, children: nestedTags, class: className });
      } else {
        tags.push({ tag, content, class: className });
      }
    });
    return tags;
  }

  __convertToLatex(parsedTags) {
    let latex = '';

    parsedTags.forEach((tagObj) => {
      const { tag, content, children, class: className} = tagObj;

      if (tag === 'H1') {
        latex += this.__convertHeadingToLatex(content, 'section');
      } else if (tag === 'H2') {
        latex += this.__convertHeadingToLatex(content, 'subsection');
      } else if (tag === 'H3') {
        latex += this.__convertHeadingToLatex(content, 'subsubsection');
      } else if (tag === 'P') {
        latex += '\\smallskip '
        if (typeof children === 'undefined'){
          latex += this.__convertParagraphToLatex(content);
        } else {
          latex += this.__convertComplexPassageToLatex(content, children);
        }
      } else if (tag === 'UL' || tag === 'OL') {
        latex += this.__convertListToLatex(content, children, tag);
      } else if (tag === 'TABLE') {
        latex += this.__convertTableToLatex(children);
      } else if (tag === 'PRE') {
        latex += this.__convertCodeToLatex(children);
      } else if (tag === 'BLOCKQUOTE') {
        latex += this.__convertQuoteToLatex(children);
        children.splice(0, children.length);
      } else if (tag === 'HR') {
        latex += this.__convertHRToLatex();
      }
      if (children && children.length > 0) {
        latex += this.__convertToLatex(children);
      }
    });

    return latex;
  }

  __convertHRToLatex(){
    return '\\rule{\\linewidth}{0.4pt}\n'
  }

  __convertQuoteToLatex(children){
    let latex = '';
    latex += '\\begin{quote}\n\\small\\itshape ';
    latex += this.__convertToLatex(children);
    latex += '\n\\end{quote}\n\n'
    return latex
  }

  __convertCodeToLatex(children){
    let latex = '';
    if(children[0].tag === 'CODE'){
      latex = '\\lstset{\nbasicstyle=\\ttfamily\\small,'
      if(typeof children[0].class !== 'undefined'){
        latex += '\nlanguage=' + children[0].class.replace("language-", "") + ','
      }
      latex += '\nxleftmargin=1cm}\n\\begin{lstlisting}\n\n'
      latex += children[0].content;
      latex += '\\end{lstlisting}\n'
    }
    return latex
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
    content = content.replace(/<strong>(.*?)<\/strong>/g, "\\textbf{$1}"); // bold
    content = content.replace(/<em>(.*?)<\/em>/g, "\\textit{$1}"); // it
    content = content.replace(/<a href="(.*?)">(.*?)<\/a>/g, '\\href{$1}{$2}'); // link
    content = content.replace(/<code>(.*?)<\/code>/g, '\\verb|$1|'); // inline code
    content = content.replace(/<s>(.*?)<\/s>/g, '\\sout{$1}'); // delete
    content = content.replace(/<br>/g, "\n");
    return content + '\n\n'
  }

  async __downloadImage(url, filePath) {
    if (this.__isLocalPath(url)) {
      await fs.copyFileSync(url, filePath);
      return;
    }
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync(filePath, response.data);
  }

  __isLocalPath(url) {
    const isAbsolutePath = path.isAbsolute(url);
    const isRelativePath = url.startsWith('./') || url.startsWith('../');
    return isAbsolutePath || isRelativePath;
  }
  
  __convertImgToLatex(content) {
    let latex = '';
    const regex = /<img\s+src="([^"]+)"\s+alt="([^"]+)">/i;
    const match = regex.exec(content);
    const src = match[1];
    const alt = match[2];
    const fileName = path.basename(src);
    const localPath = path.join(imgpath, fileName);

    if (!fs.existsSync(imgpath)) {
      fs.mkdirSync(imgpath, { recursive: true });
    }
  
    this.__downloadImage(src, localPath);
  
    latex += '\\begin{figure}[h]\n\\centering\n\\resizebox{0.6\\textwidth}{!}{%\n\\includegraphics{';
    latex += localPath;
    latex += '}}\n\\caption{'
    latex += alt;
    latex += '}\n\\end{figure}\n';
    return latex;
  }

  __convertListToLatex(content, children, tag) {
    let tex = '';

    if (tag === 'LI') {
      tex += '\\item ';
      if (content && (typeof children) === undefined) {
        content = content.trim().replace(/\[x\]/g, "[\\checkmark]");
        content = content.trim().replace(/\[ \]/g, "[$\\square$]");
        tex += content + '\n';
      } else {
        [content] = content.split('\n');
        content = content.trim().replace(/\[x\]/g, "[\\checkmark]");
        content = content.trim().replace(/\[ \]/g, "[$\\square$]");
        tex += content + '\n'
      }
      if (typeof children === undefined){}
    } else if (tag === 'UL') {
      tex += '\\begin{itemize}\n';
    } else if (tag === 'OL') {
      tex += '\\begin{enumerate}\n';
    } 

    if (children) {
      for (let i = 0; i < children.length; i++) {
        tex += this.__convertListToLatex(children[i].content, children[i].children, children[i].tag);
      }
      children.splice(0, children.length);
    }

    if (tag === 'UL') {
      tex += '\\end{itemize}\n';
    } else if (tag === 'OL') {
      tex += '\\end{enumerate}\n';
    }
    return tex;
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
    return `\\${headingType}*{${content}}\n\n`;
  }

  __convertParagraphToLatex(content) {
    return `${content}\n\n`;
  }

  __addHeaderAndFooter(latex) {
    const header = `\\documentclass[10pt]{article}
\\usepackage[top=2cm, bottom=2cm, left=1cm, right=1cm]{geometry}
\\usepackage{amsmath}
\\usepackage{array}
\\usepackage{graphicx}
\\usepackage{listings}
\\usepackage{ulem}
\\usepackage{hyperref}
\\usepackage{amssymb}
\\setlength{\\parindent}{0pt}
\\begin{document}\n`;
  
    const footer = '\\end{document}';
  
    return `${header}\n${latex}\n${footer}`;
  }

  async html2latex(html) {
    try {
      this.$ = cheerio.load(html);
      const rootElement = this.$('body').children();
      const parsedTags = this.__parseTags(this.$, rootElement);
      const parsedLatex = this.__convertToLatex(parsedTags);
      const finalLatex = this.__addHeaderAndFooter(parsedLatex);
      return finalLatex;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = HTMLParser;
