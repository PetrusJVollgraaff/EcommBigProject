<<<<<<< HEAD
const { db } = require("../../../../db.js");
const { body, validationResult } = require("express-validator");

const producValidator = [
  body("product_name").trim().notEmpty().withMessage("Product Name required"),
  body("product_code").trim().notEmpty().withMessage("Product Code required"),
  body("product_stock").isInt({ min: 0 }).notEmpty(),
  body("main_mediaid").isInt({ min: 0 }).notEmpty(),
  body("price_normal").isFloat({ min: 0.0 }).notEmpty(),
  body("product_description").trim(),
];

var productSQL = `
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
    `;

var productDetailSQL = `
        SELECT 
          P.id, 
          P.name, 
          P.description,
          P.code,
          P.instock,
          P.onspecial,
          P.showonline,
          
          --product main image
          IFNULL(M.id, 0) AS imgid,
          IFNULL(MU.id, 0) AS imgusedid,
          CASE 
              WHEN M.id IS NOT NULL THEN
                  '/static/images/'|| M.name ||'/thumb'|| M.ext
              ELSE ''
          END AS imgpath,

          --product normal prices
          IFNULL(PP1.id, 0) AS normalpriceid,
          IFNULL(PP1.price, 0.00) as normalprice,
      
          --product special prices
          IFNULL(PP2.id, 0) AS specialpriceid,
          IFNULL(PP2.price, 0.00) as specialprice,
          PP2.specialdateStart,
          PP2.specialdateEnd

      FROM products AS P
      LEFT JOIN media_used MU ON MU.id = P.mediaused_id AND MU.deleted_yn=0
      LEFT JOIN media M ON M.id = MU.media_id AND M.deleted_yn=0
      LEFT JOIN product_prices PP1 ON PP1.products_id = P.id AND PP1.isspecial=0 AND PP1.deleted_yn = 0
      LEFT JOIN product_prices PP2 ON PP2.products_id = P.id AND PP2.isspecial=1 AND PP2.deleted_yn = 0          
      WHERE P.deleted_yn = 0 AND P.id=:id
    `;

function getproductHTML(req, res) {
  res.render("./backend/pages/product_manager/index", {
    title: "Media Manager",
    layout: "backend/layout/main", // <-- switch to backend layout
  });
}

function getProductsJSON(req, res) {
  const productsDb = db.prepare(productSQL).all();

  const products = [];
  for (const product of productsDb) {
    products.push(setProductJSON(product));
  }

  res.json(products);
}

function getSingleProduct(req, res) {
  const { id } = req.body;

  if (id == 0) {
    res.render("./backend/pages/product_manager/editor", {
      title: "",
      product: {},
    });
  } else {
    const stmt = db.prepare(productDetailSQL);
    const row = stmt.get({ id });

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
      imageid: row["imgid"],
      imagepath: row["imgpath"],
      pricenormal: row["normalprice"],
      pricespecial: row["specialprice"],
      specialdatestart: row["specialdateStart"],
      specialdateend: row["specialdateEnd"],
    };

    res.render("./backend/pages/product_manager/editor", {
      title: "",
      product,
    });
  }
}

function addNewProduct(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "error", message: errors.array() });
  }

  var id = addNewProductSQL(req.body);

  if (id > 0) {
    const product = getProductJSON(id);
    res
      .status(200)
      .json({ status: "success", message: "Product is added", product });
  }

  res.status(500).json({
    status: "error",
    message: "Somthing went wrong, Product could not be created",
  });
}

function editExistingProduct(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "error", message: errors.array() });
  }

  const { product_id } = req.body;
  const stmt = db.prepare(productDetailSQL);
  const row = stmt.get({ id: product_id });

  if (row) {
    const found = UpdateProduct(
      req.body,
      row["imgid"],
      row["imgusedid"],
      row["normalprice"],
      row["specialprice"]
    );

    if (found) {
      const product = getProductJSON(product_id);
      res
        .status(200)
        .json({ status: "success", message: "Product is Save.", product });
    }

    res.status(500).json({
      status: "error",
      message: "Somthing went wrong, Product could not be created",
    });
  }

  res.status(404).json({ status: "error", message: "Product not found." });
}

function removeExistingProduct(req, res) {
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
}

function getProductJSON(id) {
  const stmt = db.prepare(productSQL + " AND P.id=:id");
  const row = stmt.get({ id });
  return setProductJSON(row);
}

function setProductJSON(row) {
  return {
    id: row["id"],
    name: row["name"],
    onspecial: row["onspecial"],
    showonline: row["showonline"],
    image: {
      path: row["path"],
    },
  };
}

/** ADD NEW PRODUCT DATA **/

//Add New Product Image
function AddImgSQL(imgid) {
  const stmt = db.prepare(`
            INSERT INTO media_used ([media_id], [media_order], [function_as], [create_by_userid], [create_at], [deleted_yn])
                VALUES (:imgid, 0, 'main product image', 1, CURRENT_TIMESTAMP, 0)
                RETURNING id;
      `);

  const row = stmt.get({ imgid });
  return row.id;
}

//Add New Product Prices
function AddNewPriceSQL(productid, body) {
  const { price_normal } = body;
  const stmt = db.prepare(`
        INSERT INTO product_prices ([products_id], [price], [isspecial], [create_by_userid], [create_at], [deleted_yn])
        VALUES(:productid, :price, 0, 1, CURRENT_TIMESTAMP, 0)
      `);

  stmt.run({ productid, price: price_normal });
}

//Add New Product Special Prices
function AddNewSpecialPriceSQL(productid, body) {
  const { product_special, price_special, special_datestart, special_dateend } =
    body;

  if (typeof product_special != "undefined") {
    const stmt = db.prepare(`
        INSERT INTO product_prices ([products_id], [price], [isspecial], [specialdataStart], [specialdataEnd], [create_by_userid], [create_at], [deleted_yn])
        VALUES(:productid, :price, 1, :datestart, :dateend, 1, CURRENT_TIMESTAMP, 0)
      `);

    stmt.run({
      productid,
      price: price_special,
      datestart: special_datestart,
      dateend: special_dateend,
    });
  }
}

//Add New Product
function addNewProductSQL(body) {
  const {
    main_mediaid,
    product_name,
    product_stock,
    product_description,
    product_code,
    product_special,
    product_show,
  } = body;

  let mediausedId = AddImgSQL(main_mediaid);

  const stmt = db.prepare(`
    INSERT INTO products([mediaused_id], [name], [instock], [description], [code], [onspecial], [showonline], [create_by_userid], [create_at], [deleted_yn])
    VALUES (:mediausedid, :name, :stock, :descript, :code, :onspecial, :showonline, 1, CURRENT_TIMESTAMP, 0)
    RETURNING id;
      `);

  const row = stmt.get({
    mediausedid: mediausedId,
    name: product_name,
    stock: product_stock,
    descript: product_description,
    code: product_code,
    onspecial: typeof product_special == "undefined" ? 0 : 1,
    showonline: typeof product_show == "undefined" ? 0 : 1,
  });

  if (row) {
    AddNewPriceSQL(row.id, body);
    AddNewSpecialPriceSQL(row.id, body);
    return row.id;
  }

  return 0;
}

/** UPDATE PRODUCT DATA **/

// Update Existing Product Image
function ReplaceExistingImg(productid, newimgid, oldimgid, oldimgusedid) {
  const usedimgid = oldimgusedid;

  if (newimgid != oldimgid) {
    const stmt = db.prepare(`
            INSERT INTO media_used ([media_id], [media_order], [function_as], [create_by_userid], [create_at], [deleted_yn])
            SELECT :imgid, 0, 'main product image', 1, CURRENT_TIMESTAMP, 0
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM products AS P
                    LEFT JOIN media_used MU ON MU.id = P.mediaused_id AND MU.deleted_yn=0
                    LEFT JOIN medias M ON M.id = MU.media_id AND M.deleted_yn=0
                    WHERE P.deleted_yn = 0 AND P.id=:productid AND IFNULL(M.id, 0)=:imgid
                )
              RETURNING id;
      `);

    const row = stmt.get({ imgid, productid });
    usedimgid = row.id;
  }

  return usedimgid;
}

// Update Existsing Product Prices
function ReplaceExistingPrice(productid, body, curnormprice) {
  const { price_normal } = body;
  if (price_normal != curnormprice) {
    const stmt = db.prepare(`
            INSERT INTO product_prices ([products_id], [price], [isspecial], [create_by_userid], [create_at], [deleted_yn])
                SELECT :productid, :price, 0, 1, CURRENT_TIMESTAMP, 0
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM products AS P
                    LEFT JOIN product_prices PP1 ON PP1.products_id = P.id AND PP1.isspecial=0 AND PP1.deleted_yn = 0
                    WHERE P.deleted_yn = 0 AND P.id=:productid AND IFNULL(PP1.price, 0)=:price
                )
                RETURNING id;
      `);

    stmt.run({ productid, price: price_normal });
  }
}

// Update Existsing Product Special Prices
function ReplaceExistingSpecialPrice(productid, body, curspecialprice) {
  const { product_special, price_special, special_datestart, special_dateend } =
    body;

  if (typeof product_special != "undefined") {
    if (price_special != curspecialprice) {
      const stmt1 = db.prepare(`
            INSERT INTO product_prices ([products_id], [price], [isspecial], [create_by_userid], [create_at], [deleted_yn])
                SELECT :productid, :price, 0, 1, CURRENT_TIMESTAMP, 0
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM products AS P
                    LEFT JOIN product_prices PP1 ON PP1.products_id = P.id AND PP1.isspecial=0 AND PP1.deleted_yn = 0
                    WHERE P.deleted_yn = 0 AND P.id=:productid AND IFNULL(PP1.price, 0)=:price
                )
                RETURNING id;
      `);

      var row = stmt1.get({ productid, price: price_special });

      const stmt2 = db.prepare(`
            UPDATE product_prices SET [deleted_yn] = 1, [deleted_at]=CURRENT_TIMESTAMP
            WHERE products_id = :productid AND isspecial=0 AND deleted_yn = 0 AND id!=:id
      `);

      stmt2.run({ productid, id: row.id });
    }
  } else {
    const stmt = db.prepare(`
          UPDATE product_prices SET [deleted_yn] = 1, [deleted_at]=CURRENT_TIMESTAMP
          WHERE products_id=:productid AND isspecial=1 AND deleted_yn = 0
      `);

    stmt.run({ productid });
  }
}

// Update Existing Product
function UpdateProduct(
  body,
  curimgid,
  curimgusedid,
  curnormprice,
  curspecialprice
) {
  const {
    main_mediaid,
    product_id,
    product_name,
    product_stock,
    product_description,
    product_code,
    product_special,
    product_show,
  } = body;

  let mediausedId = ReplaceExistingImg(
    product_id,
    main_mediaid,
    curimgid,
    curimgusedid
  );

  ReplaceExistingPrice(product_id, body, curnormprice);
  ReplaceExistingSpecialPrice(product_id, body, curspecialprice);

  const stmt = db.prepare(`
      UPDATE products SET [name]=:name, [instock]=:instock, [description]=:descript, [code]=:code, 
              [onspecial]=:onspecial, [showonline]=:showonline, [mediaused_id]=:mediausedid
      WHERE id=:id
      RETURNING id;
  `);

  var row = stmt.get({
    id: product_id,
    mediausedid: mediausedId,
    name: product_name,
    instock: product_stock,
    descript: product_description,
    code: product_code,
    onspecial: typeof product_special == "undefined" ? 0 : 1,
    showonline: typeof product_show == "undefined" ? 0 : 1,
  });

  if (row) {
    return true;
  }

  return false;
}

module.exports = {
  producValidator,
  getproductHTML,
  getProductsJSON,
  getSingleProduct,
  addNewProduct,
  editExistingProduct,
  removeExistingProduct,
};
=======
const { db } = require("../../../../db.js");
const { body, validationResult } = require("express-validator");

const producValidator = [
  body("product_name").trim().notEmpty().withMessage("Product Name required"),
  body("product_code").trim().notEmpty().withMessage("Product Code required"),
  body("product_stock").isInt({ min: 0 }).notEmpty(),
  body("main_mediaid").isInt({ min: 0 }).notEmpty(),
  body("price_normal").isFloat({ min: 0.0 }).notEmpty(),
  body("product_description").trim(),
];

var productSQL = `
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
    `;

var productDetailSQL = `
        SELECT 
          P.id, 
          P.name, 
          P.description,
          P.code,
          P.instock,
          P.onspecial,
          P.showonline,
          
          --product main image
          IFNULL(M.id, 0) AS imgid,
          IFNULL(MU.id, 0) AS imgusedid,
          CASE 
              WHEN M.id IS NOT NULL THEN
                  '/static/images/'|| M.name ||'/thumb'|| M.ext
              ELSE ''
          END AS imgpath,

          --product normal prices
          IFNULL(PP1.id, 0) AS normalpriceid,
          IFNULL(PP1.price, 0.00) as normalprice,
      
          --product special prices
          IFNULL(PP2.id, 0) AS specialpriceid,
          IFNULL(PP2.price, 0.00) as specialprice,
          PP2.specialdateStart,
          PP2.specialdateEnd

      FROM products AS P
      LEFT JOIN media_used MU ON MU.id = P.mediaused_id AND MU.deleted_yn=0
      LEFT JOIN media M ON M.id = MU.media_id AND M.deleted_yn=0
      LEFT JOIN product_prices PP1 ON PP1.products_id = P.id AND PP1.isspecial=0 AND PP1.deleted_yn = 0
      LEFT JOIN product_prices PP2 ON PP2.products_id = P.id AND PP2.isspecial=1 AND PP2.deleted_yn = 0          
      WHERE P.deleted_yn = 0 AND P.id=:id
    `;

function getproductHTML(req, res) {
  res.render("./backend/pages/product_manager/index", {
    title: "Media Manager",
    layout: "backend/layout/main", // <-- switch to backend layout
  });
}

function getProductsJSON(req, res) {
  const productsDb = db.prepare(productSQL).all();

  const products = [];
  for (const product of productsDb) {
    products.push(setProductJSON(product));
  }

  res.json(products);
}

function getSingleProduct(req, res) {
  const { id } = req.body;

  if (id == 0) {
    res.render("./backend/pages/product_manager/editor", {
      title: "",
      product: {},
    });
  } else {
    const stmt = db.prepare(productDetailSQL);
    const row = stmt.get({ id });

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
      imageid: row["imgid"],
      imagepath: row["imgpath"],
      pricenormal: row["normalprice"],
      pricespecial: row["specialprice"],
      specialdatestart: row["specialdateStart"],
      specialdateend: row["specialdateEnd"],
    };

    res.render("./backend/pages/product_manager/editor", {
      title: "",
      product,
    });
  }
}

function addNewProduct(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "error", message: errors.array() });
  }

  var id = addNewProductSQL(req.body);

  if (id > 0) {
    const product = getProductJSON(id);
    res
      .status(200)
      .json({ status: "success", message: "Product is added", product });
  }

  res.status(500).json({
    status: "error",
    message: "Somthing went wrong, Product could not be created",
  });
}

function editExistingProduct(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "error", message: errors.array() });
  }

  const { product_id } = req.body;
  const stmt = db.prepare(productDetailSQL);
  const row = stmt.get({ id: product_id });

  if (row) {
    const found = UpdateProduct(
      req.body,
      row["imgid"],
      row["imgusedid"],
      row["normalprice"],
      row["specialprice"]
    );

    if (found) {
      const product = getProductJSON(product_id);
      res
        .status(200)
        .json({ status: "success", message: "Product is Save.", product });
    }

    res.status(500).json({
      status: "error",
      message: "Somthing went wrong, Product could not be created",
    });
  }

  res.status(404).json({ status: "error", message: "Product not found." });
}

function removeExistingProduct(req, res) {
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
}

function getProductJSON(id) {
  const stmt = db.prepare(productSQL + " AND P.id=:id");
  const row = stmt.get({ id });
  return setProductJSON(row);
}

function setProductJSON(row) {
  return {
    id: row["id"],
    name: row["name"],
    onspecial: row["onspecial"],
    showonline: row["showonline"],
    image: {
      path: row["path"],
    },
  };
}

/** ADD NEW PRODUCT DATA **/

//Add New Product Image
function AddImgSQL(imgid) {
  const stmt = db.prepare(`
            INSERT INTO media_used ([media_id], [media_order], [function_as], [create_by_userid], [create_at], [deleted_yn])
                VALUES (:imgid, 0, 'main product image', 1, CURRENT_TIMESTAMP, 0)
                RETURNING id;
      `);

  const row = stmt.get({ imgid });
  return row.id;
}

//Add New Product Prices
function AddNewPriceSQL(productid, body) {
  const { price_normal } = body;
  const stmt = db.prepare(`
        INSERT INTO product_prices ([products_id], [price], [isspecial], [create_by_userid], [create_at], [deleted_yn])
        VALUES(:productid, :price, 0, 1, CURRENT_TIMESTAMP, 0)
      `);

  stmt.run({ productid, price: price_normal });
}

//Add New Product Special Prices
function AddNewSpecialPriceSQL(productid, body) {
  const { product_special, price_special, special_datestart, special_dateend } =
    body;

  if (typeof product_special != "undefined") {
    const stmt = db.prepare(`
        INSERT INTO product_prices ([products_id], [price], [isspecial], [specialdataStart], [specialdataEnd], [create_by_userid], [create_at], [deleted_yn])
        VALUES(:productid, :price, 1, :datestart, :dateend, 1, CURRENT_TIMESTAMP, 0)
      `);

    stmt.run({
      productid,
      price: price_special,
      datestart: special_datestart,
      dateend: special_dateend,
    });
  }
}

//Add New Product
function addNewProductSQL(body) {
  const {
    main_mediaid,
    product_name,
    product_stock,
    product_description,
    product_code,
    product_special,
    product_show,
  } = body;

  let mediausedId = AddImgSQL(main_mediaid);

  const stmt = db.prepare(`
    INSERT INTO products([mediaused_id], [name], [instock], [description], [code], [onspecial], [showonline], [create_by_userid], [create_at], [deleted_yn])
    VALUES (:mediausedid, :name, :stock, :descript, :code, :onspecial, :showonline, 1, CURRENT_TIMESTAMP, 0)
    RETURNING id;
      `);

  const row = stmt.get({
    mediausedid: mediausedId,
    name: product_name,
    stock: product_stock,
    descript: product_description,
    code: product_code,
    onspecial: typeof product_special == "undefined" ? 0 : 1,
    showonline: typeof product_show == "undefined" ? 0 : 1,
  });

  if (row) {
    AddNewPriceSQL(row.id, body);
    AddNewSpecialPriceSQL(row.id, body);
    return row.id;
  }

  return 0;
}

/** UPDATE PRODUCT DATA **/

// Update Existing Product Image
function ReplaceExistingImg(productid, newimgid, oldimgid, oldimgusedid) {
  const usedimgid = oldimgusedid;

  if (newimgid != oldimgid) {
    const stmt = db.prepare(`
            INSERT INTO media_used ([media_id], [media_order], [function_as], [create_by_userid], [create_at], [deleted_yn])
            SELECT :imgid, 0, 'main product image', 1, CURRENT_TIMESTAMP, 0
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM products AS P
                    LEFT JOIN media_used MU ON MU.id = P.mediaused_id AND MU.deleted_yn=0
                    LEFT JOIN medias M ON M.id = MU.media_id AND M.deleted_yn=0
                    WHERE P.deleted_yn = 0 AND P.id=:productid AND IFNULL(M.id, 0)=:imgid
                )
              RETURNING id;
      `);

    const row = stmt.get({ imgid, productid });
    usedimgid = row.id;
  }

  return usedimgid;
}

// Update Existsing Product Prices
function ReplaceExistingPrice(productid, body, curnormprice) {
  const { price_normal } = body;
  if (price_normal != curnormprice) {
    const stmt = db.prepare(`
            INSERT INTO product_prices ([products_id], [price], [isspecial], [create_by_userid], [create_at], [deleted_yn])
                SELECT :productid, :price, 0, 1, CURRENT_TIMESTAMP, 0
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM products AS P
                    LEFT JOIN product_prices PP1 ON PP1.products_id = P.id AND PP1.isspecial=0 AND PP1.deleted_yn = 0
                    WHERE P.deleted_yn = 0 AND P.id=:productid AND IFNULL(PP1.price, 0)=:price
                )
                RETURNING id;
      `);

    stmt.run({ productid, price: price_normal });
  }
}

// Update Existsing Product Special Prices
function ReplaceExistingSpecialPrice(productid, body, curspecialprice) {
  const { product_special, price_special, special_datestart, special_dateend } =
    body;

  if (typeof product_special != "undefined") {
    if (price_special != curspecialprice) {
      const stmt1 = db.prepare(`
            INSERT INTO product_prices ([products_id], [price], [isspecial], [create_by_userid], [create_at], [deleted_yn])
                SELECT :productid, :price, 0, 1, CURRENT_TIMESTAMP, 0
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM products AS P
                    LEFT JOIN product_prices PP1 ON PP1.products_id = P.id AND PP1.isspecial=0 AND PP1.deleted_yn = 0
                    WHERE P.deleted_yn = 0 AND P.id=:productid AND IFNULL(PP1.price, 0)=:price
                )
                RETURNING id;
      `);

      var row = stmt1.get({ productid, price: price_special });

      const stmt2 = db.prepare(`
            UPDATE product_prices SET [deleted_yn] = 1, [deleted_at]=CURRENT_TIMESTAMP
            WHERE products_id = :productid AND isspecial=0 AND deleted_yn = 0 AND id!=:id
      `);

      stmt2.run({ productid, id: row.id });
    }
  } else {
    const stmt = db.prepare(`
          UPDATE product_prices SET [deleted_yn] = 1, [deleted_at]=CURRENT_TIMESTAMP
          WHERE products_id=:productid AND isspecial=1 AND deleted_yn = 0
      `);

    stmt.run({ productid });
  }
}

// Update Existing Product
function UpdateProduct(
  body,
  curimgid,
  curimgusedid,
  curnormprice,
  curspecialprice
) {
  const {
    main_mediaid,
    product_id,
    product_name,
    product_stock,
    product_description,
    product_code,
    product_special,
    product_show,
  } = body;

  let mediausedId = ReplaceExistingImg(
    product_id,
    main_mediaid,
    curimgid,
    curimgusedid
  );

  ReplaceExistingPrice(product_id, body, curnormprice);
  ReplaceExistingSpecialPrice(product_id, body, curspecialprice);

  const stmt = db.prepare(`
      UPDATE products SET [name]=:name, [instock]=:instock, [description]=:descript, [code]=:code, 
              [onspecial]=:onspecial, [showonline]=:showonline, [mediaused_id]=:mediausedid
      WHERE id=:id
      RETURNING id;
  `);

  var row = stmt.get({
    id: product_id,
    mediausedid: mediausedId,
    name: product_name,
    instock: product_stock,
    descript: product_description,
    code: product_code,
    onspecial: typeof product_special == "undefined" ? 0 : 1,
    showonline: typeof product_show == "undefined" ? 0 : 1,
  });

  if (row) {
    return true;
  }

  return false;
}

module.exports = {
  producValidator,
  getproductHTML,
  getProductsJSON,
  getSingleProduct,
  addNewProduct,
  editExistingProduct,
  removeExistingProduct,
};
>>>>>>> 6a297bda8e8bdb9869af026908e89a0b5e081262
