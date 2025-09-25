const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const multer = require("multer");
const { db } = require("../../../../db.js");

const projectRoot = path.join(__dirname, "../../../..");
const imgDir = path.join(projectRoot, "/public/images");
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

function createUniqueFolder(baseName) {
  let folderName = baseName;
  let folderPath = path.join(imgDir, folderName);
  let counter = 1;

  // Check if folder exists and create new names until we find an available one
  while (fs.existsSync(folderPath)) {
    folderName = `${baseName}(${counter++})`;
    folderPath = path.join(imgDir, folderName);
  }

  fs.mkdirSync(folderPath, { recursive: true });
  return { folderPath, folderName };
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    var ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext) || "image"; // optional name from client
    const { folderPath, folderName } = createUniqueFolder(baseName);
    req.uploadFolder = folderPath;
    file["folderName"] = folderName;
    file["ext"] = ext;

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

function getMediaHTML(req, res) {
  res.render("./backend/pages/media_manager/index", {
    title: "Media Manager",
    layout: "backend/layout/main", // <-- switch to backend layout
  });
}

function getMediasJSON(req, res) {
  const medias = db
    .prepare(
      "SELECT id, name, '/static/images/'|| name ||'/thumb'|| ext AS path FROM media WHERE deleted_yn =0"
    )
    .all();

  res.json(medias);
}

function addMedia(req, res) {
  upload.array("images", 10)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: "error", message: err.message });
    }

    const uploadedFiles = [];
    /*JSON.stringify(
      req.files.map((file) => ({
        filename: file.filename,
        path: file.path,
      }))
    );*/

    req.files.forEach((file) => {
      const { width, height } = sharp(file.path).metadata();

      const stmt = db.prepare(`
            INSERT INTO media (name, type, width, height, ext, create_at, deleted_yn, create_by_userid) 
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 0, 1) 
            RETURNING id;
      `);

      const row = stmt.get(file.folderName, "image", width, height, file.ext);

      shapeImage(file);
      uploadedFiles.push({
        id: row.id,
        name: file.folderName,
        path: `/static/images/${file.folderName}/image${file.ext}`,
      });
    });

    res.status(200).json({ status: "success", images: uploadedFiles });
  });
}

function removeMedia(req, res) {
  const { id } = req.body;

  const stmt = db.prepare(`
    UPDATE medias SET deleted_at=CURRENT_TIMESTAMP, deleted_yn=1
    WHERE id=:mediaid
    RETURNING id;
    `);

  const row = stmt.get(id);

  if (row) {
    res.json({ status: "success", message: "images are removes" });
  } else {
    res.json({
      status: "error",
      message: "Somthing went wrong, please try again later.",
    });
  }
}

async function shapeImage(file) {
  const sizes = {
    large: { width: 1920 },
    medium: { width: 600 },
    thumb: { width: 150 },
  };

  for (key in sizes) {
    const thumbFull = path.join(file.destination, key + file.ext);
    await sharp(file.path).resize(300, 300, { fit: "cover" }).toFile(thumbFull);
  }
}

module.exports = {
  getMediaHTML,
  getMediasJSON,
  addMedia,
  removeMedia,
  removeMedia,
};
