const express = require("express");
const path = require("path");
const router = express.Router();

//homepage
router.get("/", (req, res) =>
  res.render("./frontend/pages/home", {
    title: "My E-commerce",
    layout: "frontend/layout/main",
  })
);

module.exports = router;
