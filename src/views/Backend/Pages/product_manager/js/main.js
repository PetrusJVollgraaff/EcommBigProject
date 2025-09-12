class ProductEditor {
  #action;
  #callback = () => {};
  constructor({ action = "create" }, callback) {
    this.#action = action;
    this.#callback = callback;
    this.#init();
  }

  #init() {
    new Modal({
      title: (this.#action = "edit" ? "Edit Product" : "Create Product"),
      onOpen: (modal) => {
        //var contentCtn = modal.popupEl.getElementsByClassName("content_ctn");
        //contentCtn[0].appendChild(this.mainDiv)
      },
      buttons: [
        {
          title: (this.#action = "edit" ? "Edit" : "Create"),
          click: (modal) => {
            modal.close();
          },
        },
        {
          title: "Cancel",
          click: function (modal) {
            modal.close();
          },
        },
      ],
    });
  }

  #build() {}

  #eventListener() {}
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
            this.#getProductDetails(data.id);
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

  #addProduct(formData) {
    fetch("/modules/productmanager/addproduct", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((response) => console.log(response));
  }

  #editProduct(formData) {
    fetch("/modules/productmanager/editproduct", {
      method: "PUT",
      body: formData,
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
          this.#modalProduct({ action: "edit", data: data.product });
        }
      });
  }

  #modalProduct({ action, data = null }) {
    new ProductEditor({ action: action, data }, (data) => {
      if (action == "edit") {
        this.#editProduct(data.formData);
      } else {
        this.#addProduct(data.formData);
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
