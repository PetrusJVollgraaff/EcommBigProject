const express = require("express");
const path = require("path");
const router = express.Router();
const { db } = require("../../../db.js");

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
  console.log(id, "hello");
  if (id == 0) {
    res.render("./backend/pages/product_manager/editor", {
      title: "",
      product: {},
    });
  } else {
    const stmt = db.prepare(
      `
        SELECT 
          P.id, 
          P.name, 
          P.desciption,
          P.code,
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
      WHERE P.deleted_yn = 0 AND P.id = ?
    `
    );

    const row = stmt.get(id);

    const product = {
      id: row["id"],
      name: row["name"],
      code: row["code"],
      descript: row["desciption"],
      onspecial: row["onspecial"],
      showonline: row["showonline"],
      image: {
        path: row["path"],
      },
    };

    res.render("./backend/pages/product_manager/editor", {
      title: "",
      product,
    });
  }
  /*var product = products.find((obj) => obj.id == id);

  if (product) {
    res.json({ status: "success", product });
  } else {
    res.json({ status: "error", message: "Product not found." });
  }*/
});

router.post("/addproduct", (req, res) => {
  const { id } = req.body;
  console.log(id);

  res.json({ status: "error", message: "Product not found." });
});

router.put("/editproduct", (req, res) => {
  const { id } = req.body;
  console.log(id);

  res.json({ status: "error", message: "Product not found." });
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
