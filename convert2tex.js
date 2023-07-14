const fs = require('fs');
const path = require('path');
const { convertText } = require('html-to-latex');
const md = require('markdown-it')().use(require('markdown-it-mathjax')());

function convertToTex(inputFilePath) {
  const inputContent = fs.readFileSync(inputFilePath, 'utf8');
  const inputDir = path.dirname(inputFilePath);
  const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));

  const html = md.render(inputContent);

  return convertText(html)
    .then(tex => {
      const outputFilePath = path.join(inputDir, `${inputFileName}.tex`);

      let texContent = `\\documentclass[10pt]{article}
\\usepackage[top=2cm, bottom=2cm, left=1cm, right=1cm]{geometry}
\\usepackage{amsmath}
\\usepackage{array}
\\usepackage{graphicx}
\\usepackage{listings}
\\begin{document}
${tex}
\\end{document}`;

      fs.writeFileSync(outputFilePath, texContent, 'utf8');
      fs.writeFileSync('m.html', html, 'utf8');
      return outputFilePath;
    })
    .catch(error => {
      console.error('Conversion error:', error);
    });
}

module.exports = convertToTex;
