// @ts-check
const fs = require("fs");
const path = require("path");
const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const PORT = 8081;
const downloadDirectory = `${__dirname}/dl`;
/**
 *
 * @param {string} baseDownloadlDir
 * @param {string[]} fileNamesArray
 * @returns {Promise<string[]>}
 */
function readDownloadFileDir(baseDownloadlDir, fileNamesArray = []) {
  return new Promise((resolve, reject) => {
    fs.readdir(baseDownloadlDir, (err, files) => {
      if (err) {
        reject(`Error occoured`);
        throw err;
      }
      fileNamesArray = files
        .map(file => {
          return path.join(baseDownloadlDir, file);
        })
        .filter(file => {
          return fs.statSync(file).isFile();
        })
        .map(filePath => {
          console.log("%s", filePath);
          // return path.basename(file);
          const neededFilePath = filePath.split(baseDownloadlDir)[1];
          return neededFilePath.startsWith("/")
            ? neededFilePath.slice(1)
            : neededFilePath;
        });
      resolve(fileNamesArray);
    });
  });
}

app.get("/", (req, res) => {
  if (!fs.existsSync(downloadDirectory)) {
    res.send(`<h2>No file(s) found</h2>`);
    return;
  }
  readDownloadFileDir(downloadDirectory)
    .then(fileNamesArray => {
      if (fileNamesArray.length) {
        const html = [];
        html.push(`<h2>List of Downloads:</h2>`);
        html.push(`<ul>`);
        fileNamesArray.forEach(file => {
          html.push(
            `<li><a href="download/?fileName=${file}">${file}</a></li>`
          );
        });
        html.push(`</ul>`);
        res.send(html.join("\n"));
      } else {
        res.send(`<h2>No file(s) found</h2>`);
      }
    })
    .catch(err => {
      if (typeof err === "string") {
        res.send(`<h2>${err}</h2>`);
      } else {
        res.send(`<h2>Error occured</h2>`);
      }
    });
});

app.get("/download", (req, res) => {
  const { fileName } = req.query;
  if (!fileName) {
    return res.send("<h2>Invalid file name</h2>");
  }
  const file = `${__dirname}/dl/${fileName}`;
  res.download(file);
});

server.listen(PORT, () => {
  console.log(`Server is started on ${PORT}`);
});
