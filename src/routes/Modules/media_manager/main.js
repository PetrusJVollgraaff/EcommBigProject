const express = require("express");
const path = require("path");
const router = express.Router();

const projectRoot = path.join(__dirname, "../../..");
router.use(
  "/static",
  express.static(path.join(projectRoot, "/views/backend/pages/media_manager"))
);

router.get("/", (req, res) => {
  res.render("./backend/pages/media_manager/index", {
    title: "Media Manager",
    layout: "backend/layout/main", // <-- switch to backend layout
  });
});

router.get("/getmedia", (req, res) => {
  console.log("helo");
  var products = [];
  res.json(products);
});

router.post("/addmedia", (req, res) => {
  var products = [];
  res.json(products);
});

module.exports = router;
