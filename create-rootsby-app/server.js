"use strict";

const escapeHtml = require("escape-html");
const express = require("express");
const fs = require("fs");
const marked = require("marked");
const path = require("path");
const router = require("./src/router");

(async function () {
  require("dotenv").config();
  await require("./src/db").db();
  const app = express();
  
  app.engine("md", function (path, options, fn) {
    fs.readFile(path, "utf8", function (err, str) {
      if (err) return fn(err);
      var html = marked.parse(str).replace(/\{([^}]+)\}/g, function (_, name) {
        return escapeHtml(options[name] || "");
      });
      fn(null, html);
    });
  });

  app.set("views", path.join(__dirname, "src/views"));

  // make it the default, so we don't need .md
  app.set("view engine", "md");

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  router(app);

  app.listen(+process.env.PORT);
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
})();

