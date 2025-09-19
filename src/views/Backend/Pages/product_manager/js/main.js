class ProductEditor {
  #productID = 0;
  #ajaxUrl = "";
  #formELm;
  #modal;
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
    console.log(this);
  }

  #init() {
    var _ = this;
    //this.#build();
    this.#modal = new Modal({
      title: this.#action == "edit" ? "Edit Product" : "Create Product",
      ajaxData: { id: this.#productID },
      //content: this.#formELm,
      ajaxUrl: this.#ajaxUrl,
      onOpen: (modal) => {
        var popupEl = modal.popupEl;
        _.#formELm = popupEl.querySelector("form");
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
            console.log("123");
            modal.close();
          },
        },
      ],
    });
  }

  #CheckFieldValid() {
    this.#formValid = true;
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
        if (this.#productID > 0) formData.append("product_id", this.#productID);

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
          .then((response) => console.log(response))
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
    this.#callback = callback;

    this.#init();
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

  #addProduct({ modal, formdata }) {
    console.log(formdata.get("id"));
    fetch("/modules/productmanager/addproduct", {
      method: "POST",
      body: new URLSearchParams(formdata).toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded ",
        //"Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => console.log(response));
  }

  #editProduct({ modal, formdata }) {
    fetch("/modules/productmanager/editproduct", {
      method: "PUT",
      body: JSON.stringify(formdata),
      headers: {
        //"Content-Type": "application/x-www-form-urlencoded ",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => console.log(response));
  }

  #getProductDetails(id) {
    fetch("/modules/productmanager/getproduct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status == "success") {
        }
      });
  }

  #modalProduct({ action, id = 0 }) {
    new ProductEditor({ action: action, id }, (data) => {
      if (action == "edit") {
        this.#editProduct({ modal: data.modal, formdata: data.formData });
      } else {
        this.#addProduct({ modal: data.modal, formdata: data.formData });
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
