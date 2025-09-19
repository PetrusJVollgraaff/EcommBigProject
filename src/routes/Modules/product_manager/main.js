const express = require("express");
const path = require("path");
const router = express.Router();
const { db } = require("../../../db.js");
const { body, validationResult } = require("express-validator");

const projectRoot = path.join(__dirname, "../../..");

var products = [
  {
    id: 1,
    name: "Product One",
    image: {
      id: 1,
      path: "/static/images/img1/thumbs.png",
    },
  },
  {
    id: 2,
    name: "Product Two",
    image: {
      id: 2,
      path: "/static/images/img2/thumbs.jpg",
    },
  },
];

producValidator = [
  body("product_name").trim().notEmpty().withMessage("Product Name required"),
  body("product_code").trim().notEmpty().withMessage("Product Code required"),
  body("product_description").trim(),
];
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.use(
  "/static",
  express.static(path.join(projectRoot, "/views/backend/pages/product_manager"))
);

router.get("/", (req, res) => {
  res.render("./backend/pages/product_manager/index", {
    title: "Media Manager",
    layout: "backend/layout/main", // <-- switch to backend layout
  });
});

router.get("/getproducts", (req, res) => {
  const productsDb = db
    .prepare(
      `
        SELECT 
          P.id, 
          P.name, 
          P.onspecial,
          P.showonline,
          CASE 
              WHEN M.id IS NOT NULL THEN
                  '/static/images/'|| M.name ||'/thumb'|| M.ext
              ELSE ''
          END AS path 

      FROM products AS P
      LEFT JOIN media_used MU ON MU.id = P.mediaused_id AND MU.deleted_yn=0
      LEFT JOIN media M ON M.id = MU.media_id AND M.deleted_yn=0
      WHERE P.deleted_yn = 0 
    `
    )
    .all();

  const products = [];
  for (const product of productsDb) {
    products.push({
      id: product["id"],
      name: product["name"],
      onspecial: product["onspecial"],
      showonline: product["showonline"],
      image: {
        path: product["path"],
      },
    });
  }

  res.json(products);
});

router.post("/getproduct", (req, res) => {
  const { id } = req.body;

  if (id == 0) {
    res.render("./backend/pages/product_manager/editor", {
      title: "",
      product: {},
    });
  } else {
    const stmt = db.prepare(`
        SELECT 
          P.id, 
          P.name, 
          P.description,
          P.code,
          P.instock,
          P.onspecial,
          P.showonline,
          CASE 
              WHEN M.id IS NOT NULL THEN
                  '/static/images/'|| M.name ||'/thumb'|| M.ext
              ELSE ''
          END AS path
      FROM products AS P
      LEFT JOIN media_used MU ON MU.id = P.mediaused_id AND MU.deleted_yn=0
      LEFT JOIN media M ON M.id = MU.media_id AND M.deleted_yn=0
      WHERE P.deleted_yn = 0 AND P.id=?
    `);

    const row = stmt.get(id);

    if (!row) {
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });
    }

    const product = {
      id: row["id"],
      name: row["name"],
      code: row["code"],
      descript: row["description"],
      onspecial: row["onspecial"] == 1,
      showonline: row["showonline"] == 1,
      image: {
        path: row["path"],
      },
    };

    res.render("./backend/pages/product_manager/editor", {
      title: "",
      product,
    });
  }
});

router.post("/addproduct", producValidator, (req, res) => {
  const { product_name, product_special, product_show } = req.body;
  console.log(product_name, product_special, product_show);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "error", message: errors.array() });
  }

  res.json({ status: "success", message: "Product not found." });
});

router.put("/editproduct", producValidator, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "error", message: errors.array() });
  }

  const {
    product_id,
    product_name,
    product_description,
    product_code,
    product_stock,
    product_special,
    product_show,
  } = req.body;

  const stmt = db.prepare(`
      UPDATE products SET [name]=:name, [description]=:descript, [code]=:code, [instock]=:instock, 
        [onspecial]=:onspecial, [showonline]=:showonline
      WHERE id=:id
      RETURNING id;
    `);

  const row = stmt.get({
    id: product_id,
    name: product_name,
    descript: product_description,
    code: product_code,
    instock: Number(product_stock),
    onspecial: typeof product_special == "undefined" ? 0 : 1,
    showonline: typeof product_show == "undefined" ? 0 : 1,
  });

  if (row) {
    res.status(200).json({ status: "success", message: "Product is Save." });
  }

  res.status(404).json({ status: "error", message: "Product not found." });
});

router.delete("/removeproduct", (req, res) => {
  const { id } = req.body;

  const stmt = db.prepare(`
    UPDATE products SET deleted_at=CURRENT_TIMESTAMP, deleted_yn=1, deleted_by_userid=1
    WHERE id=:mediaid
    RETURNING id;
    `);

  const row = stmt.get(id);

  if (row) {
    res.json({ status: "success", message: "Product is removed." });
  } else {
    res.json({
      status: "error",
      message: "Somthing went wrong, please try again later.",
    });
  }
});

module.exports = router;
