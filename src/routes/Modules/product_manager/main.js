const express = require("express");
const path = require("path");
const router = express.Router();

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
  res.json(products);
});

router.post("/getproduct", (req, res) => {
  const { id } = req.body;
  var product = products.find((obj) => obj.id == id);

  if (product) {
    res.json({ status: "success", product });
  } else {
    res.json({ status: "error", message: "Product not found." });
  }
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
  res.json({ status: "success" });
});

module.exports = router;
