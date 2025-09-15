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

//productpages
router.get("/products", (req, res) =>
  res.render("./frontend/pages/products", {
    title: "My E-commerce",
    layout: "frontend/layout/main",
  })
);

router.get("/products/:id", (req, res) =>
  res.render("./frontend/pages/products", {
    title: "My E-commerce",
    layout: "frontend/layout/main",
  })
);

//cart
router.get("/cart", (req, res) =>
  res.render("./frontend/pages/cart", {
    title: "My E-commerce",
    layout: "frontend/layout/main",
  })
);

module.exports = router;
