class ProductEditor {
  #productID = 0;
  #ajaxUrl = "";
  #formELm;
  #MainImgBtn;
  #modal;
  #mainMediaid = 0;
  #formValid = true;
  #checkValidArr = [
    {
      order: 1,
      name: "product_name",
      title: "Product Name",
    },
    {
      order: 2,
      name: "product_code",
      title: "Product Code",
    },
    {
      order: 3,
      name: "product_stock",
      title: "Product Stock",
    },
    {
      order: 1,
      name: "price_normal",
      title: "Price",
    },

    {
      order: 2,
      name: "price_special",
      title: "Special Price",
    },
  ];

  #action;
  #callback = () => {};
  constructor({ action = "create", id }, callback = () => {}) {
    this.#action = action;
    this.#callback = callback;
    this.#productID = id;
    this.#ajaxUrl = `/modules/productmanager/getproduct`;
    this.#init();
  }

  #init() {
    var _ = this;
    //this.#build();
    this.#modal = new Modal(
      {
        title: this.#action == "edit" ? "Edit Product" : "Create Product",
        ajaxData: { id: this.#productID },
        //content: this.#formELm,
        ajaxUrl: this.#ajaxUrl,
        onOpen: (modal) => {
          var popupEl = modal.popupEl;
          _.#formELm = popupEl.querySelector("form");
          _.#MainImgBtn = popupEl.querySelector("#main_imgbtn");

          _.#mainMediaid = Number(
            popupEl.querySelector("input#main_mediaid").value
          );
          popupEl.querySelector("input#main_mediaid").remove();

          _.#setMediaSelector();
          _.#eventListener();
        },
        buttons: [
          {
            title: this.#action == "edit" ? "Edit" : "Create",
            form: "product_form_editor",
          },
          {
            title: "Cancel",
            click: function (modal) {
              modal.close();
            },
          },
        ],
      },
      (data) => {
        if (data.status == "error") {
          new AlertPopup({
            title: "Warning",
            overlayer: true,
            content: data.message,
          });
        }
      }
    );
  }

  #CheckFieldValid() {
    this.#formValid = true;

    const specialcheckbox = Array.from(this.#formELm.elements).find(
      (field) => field.name == "product_special"
    );

    const specialprice = Array.from(this.#formELm.elements).find(
      (field) => field.name == "product_special"
    );

    for (let field of this.#formELm.elements) {
      var objData = this.#checkValidArr.find((obj) => obj.name == field.name);
      if (field.willValidate && !field.checkValidity()) {
        this.#formValid = false;
        field.focus();
        new AlertPopup({
          title: "Warning",
          overlayer: true,
          content: field.validity.valueMissing
            ? `${objData.title} is required.`
            : field.validity.typeMismatch
            ? `Please enter a valid ${objData.title.toLowerCase()}.`
            : "",
        });
        break;
      }
    }

    if (this.#formValid && specialcheckbox.checked && specialprice.value == 0) {
      specialprice.focus();
      new AlertPopup({
        title: "Warning",
        overlayer: true,
        content: `Please provide a special price.`,
      });
    }

    if (this.#formValid && this.#mainMediaid == 0) {
      _.#MainImgBtn.focus();

      new AlertPopup({
        title: "Warning",
        overlayer: true,
        content: `Please select an Image.`,
      });
    }
  }

  #setMediaSelector() {
    new MediaSelector({ elm: this.#MainImgBtn }, (data) => {
      this.#mainMediaid = data.id;
      this.#MainImgBtn.setAttribute("title", data.name);
      this.#MainImgBtn.style.backgroundImage = `url('${data.path}')`;
    });
  }

  #eventListener() {
    var _ = this;
    const url =
      this.#action == "edit"
        ? "/modules/productmanager/editproduct"
        : "/modules/productmanager/addproduct";
    this.#formELm.addEventListener("submit", (evt) => {
      evt.preventDefault();
      _.#CheckFieldValid();
      if (_.#formValid) {
        _.#modal.disablebtn();
        var formData = new FormData(_.#formELm);
        formData.append("product_id", this.#productID);

        if (this.#mainMediaid > 0)
          formData.append("main_mediaid", this.#mainMediaid);

        fetch(url, {
          method: this.#productID > 0 ? "PUT" : "POST",
          body: new URLSearchParams(formData).toString(),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded ",
          },
        })
          .then((response) => {
            if (response.ok) {
              return response.json();
            }

            const data = response.json();

            // Create error manually and attach custom data
            const error = new Error(`Response status: ${response.status}`);
            error.data = data; // 👈 custom property
            throw error;
          })
          .then((response) => {
            if (response.status == "success") {
              _.#callback(response.product);
              _.#modal.close();

              new AlertPopup({
                title: "Success",
                overlayer: true,
                content: "The Producted is Saved",
                buttons: [],
                autoClose: true,
              });
            } else {
              _.#modal.enablebtn();
              new AlertPopup({
                title: "Error",
                overlayer: true,
                content: "The Producted could not be saved",
              });
            }
          })
          .catch((err) => {
            console.error(err.message);
            //this.callback(err.data);
          });
      }

      return false;
    });
  }
}

class Product {
  #ElmP;
  #Elm;
  #Data = {};
  #BtnDelete;
  #BtnEdit;
  #callback = () => {};

  constructor({ elmP, obj }, callback = () => {}) {
    this.#ElmP = elmP;
    this.#Data = { ...obj };
    this.id = this.#Data.id;
    this.#callback = callback;

    this.#init();
  }

  setProduct(newData) {
    this.#Data = { ...newData };
    this.#remove();
  }

  #remove() {
    const oldElm = document.querySelector(
      '.product_block[data-id="' + this.#Data.id + '"]'
    );

    this.#buildElm();
    oldElm.replaceWith(this.#Elm);
    this.#eventListener();
  }

  #init() {
    this.#buildElm();
    this.#ElmP.appendChild(this.#Elm);
    this.#eventListener();
  }

  #buildElm() {
    this.#Elm = createDOMElement({
      attributes: {
        "data-id": this.#Data.id,
        class: "product_block",
      },
    });
    this.#Elm.appendChild(
      createDOMElement({
        type: "img",
        attributes: {
          src: this.#Data.image.path,
        },
      })
    );

    this.#Elm.appendChild(
      createDOMElement({ type: "p", text: this.#Data.name })
    );

    this.#BtnEdit = createDOMElement({
      type: "button",
      attributes: { class: "btn_edit" },
      text: "Edit",
    });

    this.#BtnDelete = createDOMElement({
      type: "button",
      attributes: { class: "btn_delete" },
      text: "X",
    });

    this.#Elm.appendChild(this.#BtnEdit);
    this.#Elm.appendChild(this.#BtnDelete);
  }

  #eventListener() {
    this.#BtnDelete.addEventListener("click", (evt) => {
      this.#callback({ action: "delete", id: this.#Data.id });
    });

    this.#BtnEdit.addEventListener("click", (evt) => {
      this.#callback({ action: "edit", id: this.#Data.id });
    });
  }
}

class ProductManager {
  #Products = [];
  #btnAddmedia = document.getElementById("btn_addproduct");
  #Elm = document.getElementById("product_ctn");
  constructor() {
    this.#init();
  }

  #init() {
    this.#eventListener();
    this.#getProduct();
  }

  #getProduct() {
    fetch("/modules/productmanager/getproducts")
      .then((response) => response.json())
      .then((response) => this.#build(response));
  }

  #build(data) {
    data.forEach((obj) => {
      this.#Products.push(
        new Product({ elmP: this.#Elm, obj }, (data) => {
          if (data.action == "delete") {
            this.#removeProduct(data.id);
          }

          if (data.action == "edit") {
            this.#modalProduct({ action: "edit", id: data.id });
          }
        })
      );
    });
  }

  #removeProduct(id) {
    fetch("/modules/productmanager/removeproduct", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    })
      .then((response) => response.json())
      .then((response) => console.log(response));
  }

  #editProduct(product) {
    const idx = this.#Products.findIndex((obj) => obj.id === product.id);
    if (idx > -1) {
      this.#Products[idx].setProduct(product);
    }
  }

  #modalProduct({ action, id = 0 }) {
    new ProductEditor({ action: action, id }, (obj) => {
      if (action == "edit") {
        this.#editProduct(obj);
      } else {
        this.#Products.push(
          new Product({ elmP: this.#Elm, obj }, (data) => {
            if (data.action == "delete") {
              this.#removeProduct(data.id);
            }

            if (data.action == "edit") {
              this.#modalProduct({ action: "edit", id: data.id });
            }
          })
        );
      }
    });
  }

  #eventListener() {
    this.#btnAddmedia.addEventListener("click", () => {
      this.#modalProduct({ action: "create" });
    });
  }
}

document.addEventListener("DOMContentLoaded", (evt) => {
  new ProductManager();
});
