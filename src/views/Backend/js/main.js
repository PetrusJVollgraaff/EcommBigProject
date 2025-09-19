class Modal {
  constructor(options, callback = () => {}) {
    this.settings = {
      ...{
        ajaxData: null,
        ajaxUrl: null,
        title: "Modal",
        buttons: null,
        content: null,
        customClass: null,
        outsideClose: true,
        onClose: null,
        onOpen: null,
        width: 150,
        height: 100,
        autoOpen: true,
        overlayer: true,
      },
      ...options,
    };
    this.callback = callback;
    this.#build();
    this.popupEl = null;

    this.OutsideClick = this.#outsideClickListener.bind(this);

    if (this.settings.autoOpen) {
      this.open();
    }
  }

  #build() {
    this.CtnDiv = createDOMElement({ attributes: { class: "modal_ctn" } });
    const InnerCtnDiv = createDOMElement({
      attributes: { class: "modal_innerctn" },
    });

    if (this.settings.title != "") {
      InnerCtnDiv.appendChild(
        createDOMElement({
          attributes: { class: "modal_headerctn" },
          text: this.settings.title,
        })
      );
    }

    const ContentDiv = createDOMElement({
      attributes: { class: "content_ctn" },
    });
    const BtnDiv = createDOMElement({ attributes: { class: "btn_ctn" } });
    if (this.settings.customClass != undefined) {
      this.CtnDiv.classList.add(this.settings.customClass);
    }

    this.CtnDiv.appendChild(InnerCtnDiv);
    InnerCtnDiv.appendChild(ContentDiv);
    InnerCtnDiv.appendChild(BtnDiv);
  }

  #loadContent(fallback) {
    if (this?.popupEl) {
      var contentCtn = this.popupEl.getElementsByClassName("content_ctn");
      console.log(this.settings.content);
      if (this.settings.content) {
        switch (typeof this.settings.content) {
          case "string":
            contentCtn[0].innerHTML = this.settings.content;
            break;
          case "object":
            contentCtn[0].appendChild(this.settings.content);
            break;
        }

        this.#loadButtons();

        if (typeof fallback == "function") fallback();
        this.#appendToBody();
      } else if (this.settings.ajaxUrl) {
        const request = !this.settings.ajaxData
          ? new Request(this.settings.ajaxUrl)
          : new Request(this.settings.ajaxUrl, {
              method: "POST",
              body: JSON.stringify(this.settings.ajaxData),
              headers: {
                //"Content-Type": "application/x-www-form-urlencoded ",
                "Content-Type": "application/json",
              },
            });

        fetch(request)
          .then(async (response) => {
            console.log(response.ok);
            if (response.ok) {
              return response.text();
            }

            const data = await response.json();

            // Create error manually and attach custom data
            const error = new Error(`Response status: ${response.status}`);
            error.data = data; // 👈 custom property
            throw error;
          })
          .then((response) => {
            contentCtn[0].innerHTML = response;
            this.#loadButtons();

            if (typeof fallback == "function") fallback();
            this.#appendToBody();
          })
          .catch((err) => {
            console.error(err.message);
            this.callback(err.data);
          });
      }
    }
  }

  #loadButtons() {
    var btnCtn = this.popupEl.getElementsByClassName("btn_ctn");
    if (
      this.settings?.buttons &&
      typeof this.settings?.buttons == "object" &&
      this.settings.buttons.length > 0
    ) {
      this.settings.buttons.forEach((btn) => {
        var button = createDOMElement({
          type: "button",
          attributes: { class: "modal_ctn" },
          text: btn?.title,
        });

        if (btn?.tooltip) {
          button.setAttribute("title", btn.tooltip);
        }
        if (btn?.form) {
          button.setAttribute("form", btn.form);
        }

        if (btn?.customClass) {
          button.classList.add(btn.customClass);
        }

        btnCtn[0].appendChild(button); //  insertAdjacentHTML("beforeend", buttonHTML);

        if (btn?.click)
          button.addEventListener("click", (evt) => {
            btn.click(this, evt);
          });
      });
    }
  }

  open() {
    if (this.settings.overlayer) {
      this.OverDiv = createDOMElement({
        attributes: {
          class: "modal_overlay",
          onclick:
            this.settings?.outsideClose && this.settings.overlayer
              ? this.OutsideClick
              : "",
        },
      });
      this.OverDiv.appendChild(this.CtnDiv);
      this.popupEl = this.OverDiv;
    } else {
      this.popupEl = this.CtnDiv;
      this.#EventListener();
    }

    this.#loadContent(() => {
      if (typeof this.settings.onOpen == "function") {
        this.settings.onOpen(this);
      }
    });
  }

  #appendToBody() {
    const body = document.getElementsByTagName("body");
    body[0].appendChild(this.popupEl);
  }

  disablebtn() {
    var btnCtn = this.popupEl.getElementsByClassName("btn_ctn");
    btnCtn[0].querySelectorAll("button").forEach((btn) => {
      btn.setAttribute("disabled", true);
    });
  }

  enablebtn() {
    var btnCtn = this.popupEl.getElementsByClassName("btn_ctn");
    btnCtn[0].querySelectorAll("button").forEach((btn) => {
      btn.setAttribute("disabled", false);
    });
  }

  close() {
    if (this.settings?.onClose && typeof this.settings?.onClose == "function") {
      this.settings.onClose();
    }

    console.log(this.popupEl);
    this.popupEl.remove();
  }

  #EventListener() {
    if (!this.settings.overlayer) {
      document.addEventListener("click", this.OutsideClick);
    }
  }

  #outsideClickListener(e) {
    if (!e.target.closest(".modal_ctn") && e.target != this.elem) {
      this.close();
    }
  }
}

class AlertPopup {
  constructor(options) {
    this.settings = {
      ...{
        title: "Alert",
        buttons: [
          {
            title: "Cancel",
            click: (modal) => {
              modal.close();
            },
          },
        ],
        content: null,
        customClass: null,
        outsideClose: false,
        onClose: null,
        onOpen: null,
        width: 150,
        height: 100,
        autoOpen: true,
        overlayer: false,
        position: "center",
      },
      ...options,
    };
    this.popupEl = null;
    this.#build();
    this.open();
  }

  #build() {
    this.CtnDiv = createDOMElement({ attributes: { class: "alert_ctn" } });
    const InnerCtnDiv = createDOMElement({
      attributes: { class: "alert_innerctn" },
    });

    if (this.settings.title != "") {
      InnerCtnDiv.appendChild(
        createDOMElement({
          attributes: { class: "alert_headerctn" },
          text: this.settings.title,
        })
      );
    }

    const ContentDiv = createDOMElement({
      attributes: { class: "content_ctn" },
    });
    const BtnDiv = createDOMElement({ attributes: { class: "btn_ctn" } });
    if (this.settings.customClass != undefined) {
      this.CtnDiv.classList.add(this.settings.customClass);
    }

    this.CtnDiv.appendChild(InnerCtnDiv);
    InnerCtnDiv.appendChild(ContentDiv);
    InnerCtnDiv.appendChild(BtnDiv);
  }

  #loadContent(fallback) {
    if (this?.popupEl) {
      var contentCtn = this.popupEl.getElementsByClassName("content_ctn");
      switch (typeof this.settings.content) {
        case "string":
          contentCtn[0].innerHTML = this.settings.content;
          break;
        case "object":
          contentCtn[0].appendChild(this.settings.content);
          break;
      }

      this.#loadButtons();

      if (typeof fallback == "function") fallback();
    }
  }

  #loadButtons() {
    var btnCtn = this.popupEl.getElementsByClassName("btn_ctn");
    if (
      this.settings?.buttons &&
      typeof this.settings?.buttons == "object" &&
      this.settings.buttons.length > 0
    ) {
      this.settings.buttons.forEach((btn) => {
        var button = createDOMElement({
          type: "button",
          attributes: { class: "modal_ctn" },
          text: btn?.title,
        });

        if (btn?.tooltip) {
          button.setAttribute("title", btn.tooltip);
        }
        if (btn?.form) {
          button.setAttribute("form", btn.form);
        }

        if (btn?.customClass) {
          button.classList.add(btn.customClass);
        }

        btnCtn[0].appendChild(button); //  insertAdjacentHTML("beforeend", buttonHTML);

        if (btn?.click)
          button.addEventListener("click", (evt) => {
            btn.click(this, evt);
          });
      });
    }
  }

  open() {
    const body = document.getElementsByTagName("body");
    if (this.settings.overlayer) {
      this.OverDiv = createDOMElement({
        attributes: {
          class: "alert_overlay",
          onclick:
            this.settings?.outsideClose && this.settings.overlayer
              ? this.OutsideClick
              : () => {},
        },
      });
      this.OverDiv.appendChild(this.CtnDiv);
      this.popupEl = this.OverDiv;
    } else {
      this.popupEl = this.CtnDiv;
    }

    body[0].appendChild(this.popupEl);
    this.popupEl.style.zIndex =
      10 + document.querySelectorAll(".modal_ctn, .alert_ctn").length;

    this.#loadContent(() => {
      if (typeof this.settings.onOpen == "function") {
        this.settings.onOpen(this);
      }
    });
  }

  close() {
    console.log(this);
    if (this.settings?.onClose && typeof this.settings?.onClose == "function") {
      this.settings.onClose();
    }

    console.log(this.popupEl);
    this.popupEl.remove();
  }
}

class MediaSelectorItem {
  #elmP;
  #elm;
  #data = {};
  constructor({ elmP, data }, callback = () => {}) {
    this.#elmP = elmP;
    this.#data = { ...this.#data, ...data };

    this.#init();
  }

  #init() {
    this.#elm = createDOMElement({
      attributes: this.#data,
    });
    this.#elm.appendChild(
      createDOMElement({ type: "img", attributes: { src: this.#data.path } })
    );
    this.#elm.appendChild(
      createDOMElement({ type: "span", text: this.#data.name })
    );

    this.#elmP.appendChild(this.#elm);
  }
}

class MediaSelector {
  #medias = [];
  #mediasArr = [];
  #popElm;
  #elmP;
  #mainBody;
  #settings = {
    onSelect: () => {},
    onBeforeOpen: () => {},
    onOpen: () => {},
    multiSelect: false,
    selectedItems: null,
    maxItems: 20,
    hideUpload: true,
    showExt: ["jpg", "jpeg", "png", "gif", "webp"],
  };
  constructor({ elm, options }) {
    this.#elmP = elm;
    this.#settings = {
      ...this.#settings,
      ...options,
    };
    this.#init();

    console.log("Hello");
  }

  #init() {
    this.#elmP.addEventListener("click", this.#clickedOnThis.bind(this));
  }

  #getMedia() {
    var _ = this;
    fetch("/modules/mediamanager/getmedias")
      .then((response) => response.json())
      .then((response) => {
        _.#medias = response;
        _.#appendMedia();
      });
  }

  #appendMedia() {
    this.#medias.forEach((obj) => {
      console.log(obj);
      this.#mediasArr.push(
        new MediaSelectorItem({ elmP: this.#mainBody, data: obj }, (data) => {})
      );
    });

    console.log(this.#mediasArr);
  }

  #clickedOnThis(evt) {
    var _ = this;
    console.log("helo");

    if (typeof _.#settings.onBeforeOpen == "function") {
      _.#settings.onBeforeOpen(
        _.#elmP,
        //$(".mediaSelector").last().find(".mediaMainbody"),
        _.#settings
      );
    }

    /**
     * (_.#settings.multiSelect &&
            {
            title: "Apply",
            click: function (modal) {
              modal.close();
            },
          }
          )
     */

    this.#popElm = new Modal(
      {
        title: "",
        content:
          '<div class="mediaSelector">' +
          '   <div class="mediaHeader">' +
          '     <label class="gt-label">' +
          '       Search&nbsp;&nbsp;<input class="gt-input" name="search_media" id="search_media" type="search" placeholder="Type here to search...">' +
          "     </label>" +
          "   </div>" +
          '   <div class="mediaMainbody gridView">' +
          "     </div>" +
          "</div>",
        onOpen: (modal) => {
          var popupEl = modal.popupEl;
          _.#mainBody = popupEl.querySelector(".mediaMainbody");

          setTimeout(function () {
            if (typeof _.#settings.onBeforeOpen == "function")
              _.#settings.onBeforeOpen(
                _.#elmP,
                //$(".mediaSelector").last().find(".mediaMainbody"),
                _.#settings
              );
          }, 1000);
          console.log("world");

          _.#getMedia();
        },
        buttons: [
          {
            title: "Cancel",
            click: function (modal) {
              modal.close();
            },
          },
        ],
      },
      (data) => {}
    );
  }
}

/** Create a DOM Element
 * @param {string} type - Type of DOM element, eg. 'div', 'input', etc...
 * @param {Array<{ key: string, value: string }>} attributes - Attributes of the element, eg. 'onchange', 'title', etc...
 * @param {string} text - Text for inside the element
 * @returns {HTMLElement} - The created DOM element.
 */
function createDOMElement(
  { type = "div", attributes = null, text = null } = { type: "div" }
) {
  const element = document.createElement(type);
  if (text) {
    element.innerText = text;
  }

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (key.indexOf("on") === 0) {
        element.addEventListener(key.substring(2), value);
      } else {
        element.setAttribute(key, value);
      }
    });
  }
  return element;
}

function checkZeroValue(value) {
  var num = Number(value);
  num = num < 0 ? 0 : num;
}

/** Object to FormData
 * @param {object} obj - given object
 * @param {FormData} formData - new or existing FormData
 * @param {string} parentKey - append to parentKey in FormData
 * @returns {FormData} - The created FromData.
 */
function objectToFormData(obj, formData = new FormData(), parentKey = "") {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const value = obj[key];
    const formKey = parentKey ? `${parentKey}[${key}]` : key;

    if (value instanceof Date) {
      // Convert Dates to ISO string
      formData.append(formKey, value.toISOString());
    } else if (value instanceof File || value instanceof Blob) {
      // Append File/Blob as is
      formData.append(formKey, value);
    } else if (typeof value === "object" && value !== null) {
      // Recurse for objects and arrays
      objectToFormData(value, formData, formKey);
    } else {
      // Append primitive values
      formData.append(formKey, value);
    }
  }
  return formData;
}

async function fetchWithProgress(url, options, onProgress) {
  const response = await fetch(url, options);

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  // Get total size if server sent Content-Length
  const contentLength = response.headers.get("Content-Length");
  if (!contentLength) {
    console.warn("No Content-Length header, cannot show accurate progress");
  }

  const reader = response.body.getReader();
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  let received = 0;
  let chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    received += value.length;

    if (total) {
      const percent = Math.round((received / total) * 100);
      onProgress(percent);
    } else {
      // If no total size, just pulse from 0-90%
      const percent = Math.min(90, Math.round(received / 1000));
      onProgress(percent);
    }
  }

  // Reconstruct body
  const fullBody = new Uint8Array(received);
  let position = 0;
  for (let chunk of chunks) {
    fullBody.set(chunk, position);
    position += chunk.length;
  }

  return new TextDecoder().decode(fullBody);
}
