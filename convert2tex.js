const fs = require('fs');
const path = require('path');
const { convertText } = require('html-to-latex');
const html2latex = require('./html2latex');

const parser = new html2latex();
const md = require('markdown-it')().use(require('markdown-it-mathjax')());

function convertToTex(inputFilePath) {
  const inputContent = fs.readFileSync(inputFilePath, 'utf8');
  const inputDir = path.dirname(inputFilePath);
  const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));

  const html = md.render(inputContent);
  return parser.html2latex(html)
    .then(texContent => {
      const outputFilePath = path.join(inputDir, `${inputFileName}.tex`);
      fs.writeFileSync(outputFilePath, texContent, 'utf8');
      fs.writeFileSync('m.html', html, 'utf8');
      return outputFilePath;
    })
    .catch(error => {
      console.error('Conversion error:', error);
    });
}

module.exports = convertToTex;
