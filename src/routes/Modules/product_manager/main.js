const express = require("express");
const path = require("path");
const router = express.Router();

const projectRoot = path.join(__dirname, "../../..");
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

router.use(express.json());

router.get("/getproducts", (req, res) => {
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
  res.json(products);
});

router.post("/addproduct", (req, res) => {
  var products = [];
  res.json(products);
});

router.delete("/removeproduct", (req, res) => {
  const { id } = req.body;
  res.json({ status: "success" });
});

module.exports = router;
