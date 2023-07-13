const assert = require('chai').assert;
const { convertText } = require('html-to-latex');

describe('HTML to LaTeX Converter', function() {
  it('should convert HTML to LaTeX', async function() {
    const html = '<p>Some <strong>bold</strong> text.</p>';
    const expectedLatex = 'Some \\textbf{bold} text.';
    const result = await convertText(html);
    assert.equal(result, expectedLatex);
  });

  it('should handle empty input', async function() {
    const html = '';
    const expectedLatex = '';
    const result = await convertText(html);
    assert.equal(result, expectedLatex);
  });

  // Add more test cases as needed
});
