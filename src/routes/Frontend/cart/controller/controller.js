const { db } = require("../../../../db.js");

var productDetailSQL = `
SELECT 
          P.id, 
          P.name, 
          P.description,
          P.code,
          P.instock,
          P.onspecial,
          P.showonline,
          
          --product main image
          IFNULL(M.id, 0) AS imgid,
          IFNULL(MU.id, 0) AS imgusedid,
          CASE 
              WHEN M.id IS NOT NULL THEN
                  '/static/images/'|| M.name ||'/medium'|| M.ext
              ELSE ''
          END AS imgpath,

          --product normal prices
          IFNULL(PP1.id, 0) AS normalpriceid,
          IFNULL(PP1.price, 0.00) as normalprice,
      
          --product special prices
          IFNULL(PP2.id, 0) AS specialpriceid,
          IFNULL(PP2.price, 0.00) as specialprice,
          PP2.specialdateStart,
          PP2.specialdateEnd

      FROM products AS P
      LEFT JOIN media_used MU ON MU.id = P.mediaused_id AND MU.deleted_yn=0
      LEFT JOIN media M ON M.id = MU.media_id AND M.deleted_yn=0
      LEFT JOIN product_prices PP1 ON PP1.products_id = P.id AND PP1.isspecial=0 AND PP1.deleted_yn = 0
      LEFT JOIN product_prices PP2 ON PP2.products_id = P.id AND PP2.isspecial=1 AND PP2.deleted_yn = 0          
      WHERE P.deleted_yn = 0 AND P.showonline = 1
`;

function CartTemplate(req, res) {
  const carts = getCart(req);
  let total = 0;
  const productsIds = carts
    .map((item, idx) => {
      return item.id;
    })
    .join(",");

  const products = db
    .prepare(`${productDetailSQL} AND P.id IN (${productsIds})`)
    .all();

  products.forEach((item, idx) => {
    var cartIdx = carts.findIndex((obj) => obj.id === item.id);
    item["qty"] = cartIdx > -1 ? Number(carts[cartIdx]?.qty) : 0;
    total += item["qty"] * item["normalprice"];
  });

  return res.render("./frontend/pages/cartpages/cart", {
    title: "My E-commerce",
    layout: "frontend/layout/main",
    total,
    products,
  });
}

function initCart(req) {
  if (!req.session.cart) {
    req.session.cart = [];
  }
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
  CartTemplate,
  initCart,
  addToCart,
  removeFromCart,
  updateQty,
  getCart,
  getTotal,
};
