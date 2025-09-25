const express = require("express");
const path = require("path");
const router = express.Router();

const cart = require("./controller/controller.js");

//cart
router.get("/", (req, res) =>
  res.render("./frontend/pages/cart", {
    title: "My E-commerce",
    layout: "frontend/layout/main",
    cart: cart.getCart(req),
    total: cart.getTotal(),
  })
);

router.post("/add", cart.addToCart);

router.post("/remove", cart.removeFromCart);

router.post("/checkout", (req, res) => {});

module.exports = router;
