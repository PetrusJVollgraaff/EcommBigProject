const express = require("express");
const path = require("path");
const router = express.Router();

const routepath = path.join(__dirname, "");
const projectRoot = path.join(__dirname, "../..");

const MediaMangerRoutes = require(routepath + "/media_manager/main");
const ProductMangerRoutes = require(routepath + "/product_manager/main");

router.use("/static", express.static(path.join(projectRoot, "/views/backend")));

router.use("/mediamanager", MediaMangerRoutes);
router.use("/productmanager", ProductMangerRoutes);

//dashboard
router.get("/", (req, res) => {
  res.render("./backend/pages/dashboard", {
    layout: "backend/layout/main", // <-- switch to backend layout
    title: "Dashboard",
  });
});

module.exports = router;
