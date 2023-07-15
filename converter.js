const convertToTex = require('./convert2tex');
const { convertToPdf, deleteTexFile } = require('./convert2pdf');

const inputFilePath = process.argv[2];

convertToTex(inputFilePath)
  .then(texFilePath => {
    convertToPdf(texFilePath)
      .then(() => {
        console.log('Conversion complete.');
        deleteTexFile(texFilePath);
      })
      .catch(error => {
        console.error('PDF conversion error:', error);
      });
  })
  .catch(error => {
    console.error('Conversion error:', error);
  });
