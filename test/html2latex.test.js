const html2latex = require('../html2latex');

const parser = new html2latex();

const testCases = [
  {
    html: '<h1>Title</h1><h2>Title</h2><h3>Title</h3>',
    expected: '\\section*{Title}\n\\subsection*{Title}\n\\subsubsection*{Title}\n'
  },
  {
    html: '<ul><li>Item 1</li><li>Item 2</li></ul>',
    expected: '\\begin{itemize}\n\\item Item 1\n\\item Item 2\n\\end{itemize}\n'
  },
];

testCases.forEach(async (testCase, index) => {
  console.log(`Running test case ${index + 1}`);

  const { html, expected } = testCase;

  console.log('Input HTML:');
  console.log(html);

  console.log('Expected LaTeX:');
  console.log(expected);

  console.log('Output LaTeX:');
  try {
    const output = await parser.html2latex(html);
    console.log(output);

    if (output === expected) {
      console.log('Test case passed!\n');
    } else {
      console.error('Test case failed!\n');
    }
  } catch (error) {
    console.error('Test case failed with error:', error);
  }
});
