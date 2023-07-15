const { exec } = require('child_process');
const fs = require('fs');
const { removeSync } = require('fs-extra');
const path = require('path');

const imgpath = 'img'

function convertToPdf(texFilePath) {
  return new Promise((resolve, reject) => {
    const texFileDir = path.dirname(texFilePath);
    const command = `pdflatex -output-directory=${texFileDir} ${texFilePath}`;
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
  if (fs.existsSync(imgpath)) {
    removeSync(imgpath);
  }

  fs.unlink(texFilePath, error => {
    if (error) {
      console.error('Error deleting TeX file:', error);
    }
  });
  
  const fileDir = path.dirname(texFilePath);
  const fileBaseName = path.basename(texFilePath, path.extname(texFilePath));
  const logFilePath = path.join(fileDir, `${fileBaseName}.log`);
  const auxFilePath = path.join(fileDir, `${fileBaseName}.aux`);
  const outFilePath = path.join(fileDir, `${fileBaseName}.out`);
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

  fs.unlink(outFilePath, error => {
    if (error) {
      console.error('Error deleting out file:', error);
    }
  });
}

module.exports = {convertToPdf, deleteTexFile};
