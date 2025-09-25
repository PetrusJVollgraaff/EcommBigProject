const { db } = require("../../../../db.js");

function initCart(req) {
  if (!req.session.cart) {
    req.session.cart = [];
  }

  console.log(req.session.cart);
}

function addToCart(req, res) {
  const id = parseInt(req.body.id);
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(id);

  if (!product)
    return res
      .status(404)
      .json({ status: "error", message: "Product not found" });

  addItem(req, product, parseInt(req.body.qty || 1));
  res.status(200).json({ status: "success" });
}

function addItem(req, product, qty = 1) {
  initCart(req);
  const cart = req.session.cart;

  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: qty,
    });
  }
}

function removeFromCart(req, res) {
  const id = parseInt(req.params.id);
  removeItem(req, id);
  res.status(200).json({ status: "success" });
}

function removeItem(req, productId) {
  initCart(req);
  req.session.cart = req.session.cart.filter((item) => item.id !== productId);
}

function updateQty(req, productId, qty) {
  initCart(req);
  const item = req.session.cart.find((i) => i.id === productId);
  if (item) item.qty = qty;
}

function getCart(req) {
  initCart(req);
  return req.session.cart;
}

function getTotal(req) {
  initCart(req);
  return req.session.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

module.exports = {
  initCart,
  addToCart,
  removeFromCart,
  updateQty,
  getCart,
  getTotal,
};
