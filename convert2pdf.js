const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function convertToPdf(texFilePath) {
  return new Promise((resolve, reject) => {
    const command = `pdflatex ${texFilePath}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function deleteTexFile(texFilePath) {
  const fileDir = path.dirname(texFilePath);
  const fileBaseName = path.basename(texFilePath, path.extname(texFilePath));
  const logFilePath = path.join(fileDir, `${fileBaseName}.log`);
  const auxFilePath = path.join(fileDir, `${fileBaseName}.aux`);
  fs.unlink(texFilePath, error => {
    if (error) {
      console.error('Error deleting TeX file:', error);
    }
  });
  
  fs.unlink(logFilePath, error => {
    if (error) {
      console.error('Error deleting log file:', error);
    }
  });
  
  fs.unlink(auxFilePath, error => {
    if (error) {
      console.error('Error deleting aux file:', error);
    }
  });
}

module.exports = {convertToPdf, deleteTexFile};
