const express = require("express");
const path = require("path");
const router = express.Router();

//cart
router.get("/", (req, res) =>
  res.render("./frontend/pages/cart", {
    title: "My E-commerce",
    layout: "frontend/layout/main",
  })
);

module.exports = router;
