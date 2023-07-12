const markdownpdf = require('markdown-pdf');
const fs = require('fs');

const markdownFilePath = 'input.md'; // Markdown Path
const pdfFilePath = 'output.pdf'; // PDF Path

const markdown = fs.readFileSync(markdownFilePath, 'utf8');

markdownpdf().from.string(markdown).to(pdfFilePath, () => {
  console.log('PDF completed! ');
});
