const express = require("express");
const path = require("path");
const router = express.Router();

const projectRoot = path.join(__dirname, "../../..");
const {
  getMediaHTML,
  getMediasJSON,
  addMedia,
  removeMedia,
} = require("./controllers/controller");

router.use(express.json());

router.use(
  "/static",
  express.static(path.join(projectRoot, "/views/backend/pages/media_manager"))
);

router.get("/", getMediaHTML);

router.get("/getmedias", getMediasJSON);

router.post("/addmedia", addMedia);

router.delete("/removemedia", removeMedia);

module.exports = router;
