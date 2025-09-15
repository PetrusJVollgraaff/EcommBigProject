class ProductEditor {
  #productData = {
    id: 0,
    name: "",
    instock: 0,
    image: { imgid: 0, usedid: 0, path: "" },
    code: "",
    showonline: false,
    onspecial: false,
    normalprice: {
      id: 0,
      price: 0,
    },
    specialprice: null,
  };

  #formELm;
  #modal;
  #formValid = true;
  #tabs = [
    {
      name: "main",
      isactive: true,
      children: [
        {
          order: 1,
          name: "productname",
          title: "Product Name",
          elm: this.#labelinput({
            name: "productname",
            title: "Product Name",
            inputattr: {
              id: "productname",
              type: "text",
              name: "productname",
              required: "required",
              onchange: this.#setProductName.bind(this),
            },
          }),
        },
        {
          order: 2,
          name: "productcode",
          title: "Product Code",
          elm: this.#labelinput({
            name: "productcode",
            title: "Product Code",
            inputattr: {
              id: "productcode",
              type: "text",
              name: "productcode",
              required: "required",
              onchange: this.#setProductCode.bind(this),
            },
          }),
        },
        {
          order: 3,
          name: "productstock",
          title: "Product Stock",
          elm: this.#labelinput({
            name: "productstock",
            title: "Product Stock",
            inputattr: {
              id: "productstock",
              type: "number",
              min: 0,
              name: "productstock",
              required: "required",
              onchange: this.#setProductStock.bind(this),
            },
          }),
        },
      ],
    },
    {
      name: "prices",
      isactive: false,
      children: [
        {
          order: 1,
          name: "productprice",
          title: "Price",
          elm: this.#labelinput({
            name: "productprice",
            title: "Price",
            inputattr: {
              id: "productprice",
              type: "number",
              min: 0,
              name: "productprice",
              required: "required",
              onchange: this.#setProductPrice.bind(this),
            },
          }),
        },

        {
          order: 2,
          name: "productspecial",
          title: "Is Product On Special",
          elm: this.#labelinput({
            name: "productspecial",
            title: "Is Product On Special",
            inputattr: {
              id: "productspecial",
              type: "checkbox",
              name: "productspecial",
              onchange: this.#setProductOnSpecial.bind(this),
            },
          }),
        },
      ],
    },
  ];

  #action;
  #callback = () => {};
  constructor({ action = "create", data }, callback) {
    this.#productData = { ...this.#productData, ...data };
    this.#action = action;
    this.#callback = callback;
    this.#init();
    console.log(this);
  }

  #setProductName(evt) {
    this.#productData.name = evt.target.value;
  }

  #setProductCode(evt) {
    this.#productData.code = evt.target.value;
  }

  #setProductStock(evt) {
    var num = checkZeroValue(evt.target.value);
    this.#productData.instock = num;
  }

  #setProductPrice(evt) {
    var num = checkZeroValue(evt.target.value);
    this.#productData.normalprice.price = num;
  }

  #setProductOnSpecial(evt) {
    this.#productData.onspecial = evt.target.checked;
  }

  #init() {
    var _ = this;
    this.#build();
    this.#modal = new Modal({
      title: this.#action == "edit" ? "Edit Product" : "Create Product",
      content: this.#formELm,
      onOpen: (modal) => {
        _.#eventListener();
      },
      buttons: [
        {
          title: (this.#action = "edit" ? "Edit" : "Create"),
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

  #build() {
    var _ = this;
    this.#formTabs();
    this.#formELm = createDOMElement({
      type: "form",
      attributes: {
        novalidate: "novalidate",
        id: "product_form_editor",
        onsubmit: (evt) => {
          evt.preventDefault();
          _.#CheckFieldValid();
          if (_.#formValid) {
            _.#modal.disablebtn();

            var formData = objectToFormData(this.#productData);
            console.log(this.#productData);
            console.log(formData.get("id"));
            this.#callback({ modal: _.#modal, formData });
          }

          return false;
        },
      },
    });

    this.#formELm.appendChild(this.tabmainctn);
  }

  #CheckFieldValid() {
    for (let field of this.#formELm.elements) {
      var test = Object.values(this.#tabs.map((obj) => obj.children)).flat();
      var objData = test.find((obj) => obj.name == field.name);
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

  #formTabs() {
    this.tabmainctn = createDOMElement({
      attributes: { class: "product_main_tab" },
    });
    var topTab = createDOMElement({ attributes: { class: "top_tab" } });
    var innerTab = createDOMElement({ attributes: { class: "inner_tab" } });

    this.#tabs.forEach((tab) => {
      topTab.appendChild(
        createDOMElement({
          attributes: {
            "data-tab": tab.name,
            class: tab.isactive ? "tab_btn active" : "tab_btn",
          },
          text: tab.name,
        })
      );
      var inner = createDOMElement({
        attributes: {
          "data-tab": tab.name,
          class: tab.isactive ? "tab_inner active" : "tab_inner",
        },
      });

      tab.children
        .sort((a, b) => a.order - b.order)
        .forEach((obj) => {
          console.log(obj);
          inner.appendChild(obj.elm);
        });

      innerTab.appendChild(inner);
    });

    this.tabmainctn.appendChild(topTab);
    this.tabmainctn.appendChild(innerTab);
  }

  #labelinput({ name, title, inputattr = {} }) {
    var div = createDOMElement();

    div.appendChild(
      createDOMElement({
        type: "label",
        attributes: {
          for: name,
        },
        text: title,
      })
    );

    div.appendChild(
      createDOMElement({
        type: "input",
        attributes: inputattr,
      })
    );

    return div;
  }

  #eventListener() {
    var _ = this;
    var tabs = this.tabmainctn.querySelectorAll(".tab_btn");
    var innertabs = this.tabmainctn.querySelectorAll(".tab_inner");

    tabs.forEach((tab, idx) => {
      tab.addEventListener("click", (evt) => {
        var elm = evt.target;
        var tab = elm.getAttribute("data-tab");

        for (var i = 0; i < tabs.length; i++) {
          if (idx == i) {
            tabs[i].classList.add("active");
            innertabs[i].classList.add("active");
          } else {
            tabs[i].classList.remove("active");
            innertabs[i].classList.remove("active");
          }
        }
      });
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
          this.#modalProduct({ action: "edit", data: data.product });
        }
      });
  }

  #modalProduct({ action, data = {} }) {
    new ProductEditor({ action: action, data }, (data) => {
      console.log(data.formData.get("id"));
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
