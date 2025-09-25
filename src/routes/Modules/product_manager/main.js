const express = require("express");
const path = require("path");

const projectRoot = path.join(__dirname, "../../..");

const router = express.Router();

const {
  getproductHTML,
  getProductsJSON,
  getSingleProduct,
  addNewProduct,
  editExistingProduct,
  removeExistingProduct,
  producValidator,
} = require("./controllers/controller");

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.use(
  "/static",
  express.static(path.join(projectRoot, "/views/backend/pages/product_manager"))
);

router.get("/", getproductHTML);

router.get("/getproducts", getProductsJSON);

router.post("/getproduct", getSingleProduct);

router.post("/addproduct", producValidator, addNewProduct);

router.put("/editproduct", producValidator, editExistingProduct);

router.delete("/removeproduct", removeExistingProduct);

module.exports = router;
