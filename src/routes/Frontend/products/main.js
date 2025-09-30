const express = require("express");
const path = require("path");
const router = express.Router();

const projectRoot = path.join(__dirname, "../../..");

const {
  getProductsHTML,
  getProductHTML,
} = require("./controller/controller.js");

router.use(
  "/static",
  express.static(path.join(projectRoot, "/views/frontend/pages/productpages"))
);

//productpages
router.get("/", getProductsHTML);

router.get("/:id", getProductHTML);

module.exports = router;
