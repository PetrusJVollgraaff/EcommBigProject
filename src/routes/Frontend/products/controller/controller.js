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
      WHERE P.deleted_yn = 0
    `;

function getProductsHTML(req, res) {
  const products = db.prepare(productDetailSQL).all();

  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-inline'");

  res.render("./frontend/pages/products", {
    title: "Products",
    layout: "frontend/layout/main",
    products,
  });
}

function getProductHTML(req, res) {
  const stmt = db.prepare(productDetailSQL + " AND P.id=:id");
  const product = stmt.get({ id: req.params.id });

  if (!product) {
    return res.status(404).send("Not Found.");
  }

  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-inline'");
  res.render("./frontend/pages/product", {
    title: product.name,
    layout: "frontend/layout/main",
    product,
  });
}

module.exports = { getProductsHTML, getProductHTML };
