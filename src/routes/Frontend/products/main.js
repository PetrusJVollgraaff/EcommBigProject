const express = require("express");
const path = require("path");
const router = express.Router();

const {
  getProductsHTML,
  getProductHTML,
} = require("./controller/controller.js");

//productpages
router.get("/", getProductsHTML);

router.get("/:id", getProductHTML);

module.exports = router;
