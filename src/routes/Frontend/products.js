const express = require("express");
const path = require("path");
const router = express.Router();

//productpages
router.get("/", (req, res) =>
  res.render("./frontend/pages/products", {
    title: "Products",
    layout: "frontend/layout/main",
  })
);

router.get("/:id", (req, res) =>
  res.render("./frontend/pages/products", {
    title: "My E-commerce",
    layout: "frontend/layout/main",
  })
);

module.exports = router;
