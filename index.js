// @ts-check
const fs = require("fs");
const path = require("path");
const http = require("http");
const express = require("express");
const app = express();

const server = http.createServer(app);
const PORT = 8081;
const downloadDirectory = `${__dirname}/dl`;

app.get("/", (req, res) => {
  if (!fs.existsSync(downloadDirectory)) {
    res.send(`<h2>No file(s) found</h2>`);
    return;
  }
  fs.readdir(downloadDirectory, function(err, files) {
    if (err) {
      res.send(`<h2>Error occoured</h2>`);
      throw err;
    }
    const fileNamesArray = files
      .map(function(file) {
        return path.join(downloadDirectory, file);
      })
      .filter(function(file) {
        return fs.statSync(file).isFile();
      })
      .map(function(file) {
        console.log("%s (%s)", file, path.extname(file));
        return path.basename(file);
      });

    if (fileNamesArray.length) {
      const html = [];
      html.push(`<h2>List of Downloads:</h2>`);
      html.push(`<ul>`);
      fileNamesArray.forEach(file => {
        html.push(`<li><a href="download/?fileName=${file}">${file}</a></li>`);
      });
      html.push(`</ul>`);
      res.send(html.join("\n"));
    } else {
      res.send(`<h2>No file(s) found</h2>`);
    }
  });
});

app.get("/download", (req, res) => {
  const { fileName } = req.query;
  if (!fileName) {
    return res.send("Invalid file name");
  }
  const file = `${__dirname}/dl/${fileName}`;
  res.download(file);
});

server.listen(PORT, () => {
  console.log(`Server is started on ${PORT}`);
});
