const express = require("express");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const multer = require("multer");
const router = express.Router();

const projectRoot = path.join(__dirname, "../../..");
const imgDir = path.join(projectRoot, "/public/images");
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

function createUniqueFolder(baseName) {
  let folderPath = path.join(imgDir, baseName);
  let counter = 1;

  // Check if folder exists and create new names until we find an available one
  while (fs.existsSync(folderPath)) {
    folderPath = path.join(imgDir, `${baseName}(${counter++})`);
  }

  fs.mkdirSync(folderPath, { recursive: true });
  return folderPath;
}

// ✅ Multer file filter (only images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!req.uploadFolder) {
      const baseName = file.originalname || "images"; // optional name from client
      req.uploadFolder = createUniqueFolder(baseName);
    }

    cb(null, req.uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, "image" + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpg, png, webp, gif)."));
    }
  },
}); // 5MB

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
  var products = [
    {
      id: 1,
      name: "img1",
      path: "/static/images/img1/thumbs.png",
    },
    {
      id: 2,
      name: "img2",
      path: "/static/images/img2/thumbs.jpg",
    },
  ];
  res.json(products);
});

router.post("/addmedia", (req, res) => {
  upload.array("images", 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    const uploadedFiles = req.files.map((file) => ({
      filename: file.filename,
      path: file.path,
    }));

    res.json({
      folder: req.uploadFolder,
      files: uploadedFiles,
    });
  });
});

router.post("/removemedia", (req, res) => {
  const { id } = req.body;

  console.log("hello", req.params, id, req.query?.id);
  res.json({ status: "success" });
});

module.exports = router;
