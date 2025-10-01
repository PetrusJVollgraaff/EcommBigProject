const express = require("express");
const path = require("path");
const router = express.Router();
const projectRoot = path.join(__dirname, "../../..");

const cart = require("./controller/controller.js");

router.use(
  "/static",
  express.static(path.join(projectRoot, "/views/frontend/pages/cartpages"))
);

//cart
router.get("/", cart.CartTemplate);

router.post("/add", cart.addToCart);

router.post("/remove", cart.removeFromCart);

router.post("/checkout", (req, res) => {});

module.exports = router;
