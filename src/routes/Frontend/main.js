<<<<<<< HEAD
const express = require("express");
const path = require("path");
const router = express.Router();

//productpages
const Productpages = require("./products.js");
router.use("/products", Productpages);

//cartpages
const Cartpages = require("./cart.js");
router.use("/cart", Cartpages);

//homepage
router.get("/", (req, res) =>
  res.render("./frontend/pages/home", {
    title: "My E-commerce",
    layout: "frontend/layout/main",
  })
);

module.exports = router;
=======
const express = require("express");
const path = require("path");
const router = express.Router();

//productpages
const Productpages = require("./products.js");
router.use("/products", Productpages);

//cartpages
const Cartpages = require("./cart.js");
router.use("/cart", Cartpages);

//homepage
router.get("/", (req, res) =>
  res.render("./frontend/pages/home", {
    title: "My E-commerce",
    layout: "frontend/layout/main",
  })
);

module.exports = router;
>>>>>>> 6a297bda8e8bdb9869af026908e89a0b5e081262
