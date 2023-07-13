const fs = require('fs');
const path = require('path');
const html2latex = require('../html2latex');

const parser = new html2latex();

const testDir = 'test/testCases';

fs.readdir(testDir, (err, files) => {
  if (err) {
    console.error('Error reading test cases directory:', err);
    return;
  }

  files.forEach((file) => {
    if (path.extname(file) === '.html') {
      const htmlPath = path.join(testDir, file);
      const texPath = path.join(testDir, file.replace('.html', '.tex'));

      fs.readFile(htmlPath, 'utf8', async (err, htmlContent) => {
        if (err) {
          console.error(`Error reading HTML file ${htmlPath}:`, err);
          return;
        }

        try {
          const expectedTexContent = await fs.promises.readFile(texPath, 'utf8');

          console.log(`Running test case ${file}`);

          try {
            const output = await parser.html2latex(htmlContent);

            const outputLines = output.split('\n');
            const expectedLines = expectedTexContent.split('\n');

            let diffFound = false;

            for (let i = 0; i < expectedLines.length; i++) {
              if (outputLines[i] !== expectedLines[i]) {
                console.error(`Line ${i + 1} \t- Expected: ${expectedLines[i]}`);
                console.error(`\t- Output  : ${outputLines[i]}\n`);
                diffFound = true;
              }
            }

            if (!diffFound) {
              console.log('Test case passed!\n');
            }
          } catch (error) {
            console.error('Test case failed with error:', error);
          }
        } catch (error) {
          console.error(`Error reading LaTeX file ${texPath}:`, error);
        }
      });
    }
  });
});
