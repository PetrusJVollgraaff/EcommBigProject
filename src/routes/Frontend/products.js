<<<<<<< HEAD
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
=======
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
>>>>>>> 6a297bda8e8bdb9869af026908e89a0b5e081262
