/** Create a DOM Element
 * @param {string} type - Type of DOM element, eg. 'div', 'input', etc...
 * @param {Array<{ key: string, value: string }>} attributes - Attributes of the element, eg. 'onchange', 'title', etc...
 * @param {string} text - Text for inside the element
 * @returns {HTMLElement} - The created DOM element.
 */
function createDOMElement({ type = "div", attributes = null, text = null }) {
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


class Modal{
  constructor(options){
    this.settings = {
      ...{
        title: "Modal",
        buttons: undefined,
        content: undefined,
        customClass: undefined,
        outsideClose: true,
        onClose: undefined,
        onOpen: undefined,
        width: 150,
        height: 100,
        autoOpen: true,
        overlayer: true
      },
      ...options,
    };

    this.#buildModal();
    this.popupEl = null;

    this.OutsideClick = this.#outsideClickListener.bind(this)

    if (typeof this.settings.autoOpen != "undefined"){
      if (this.settings.autoOpen){
        this.open();
      }
    }
  }

  #buildModal() {
    this.CtnDiv = createDOMElement({attributes:{class:"modal_ctn"}})
    const InnerCtnDiv = createDOMElement({attributes:{class:"modal_innerctn"}})
    const ContentDiv = createDOMElement({attributes:{class:"content_ctn"}})
    const BtnDiv = createDOMElement({attributes:{class:"btn_ctn"}})
    if(this.settings.customClass != undefined){
      this.CtnDiv.classList.add(this.settings.customClass)
    }
    
    this.CtnDiv.appendChild(InnerCtnDiv)
    InnerCtnDiv.appendChild(ContentDiv)
    InnerCtnDiv.appendChild(BtnDiv)
  }

  #loadContent(fallback) {
    if (this.popupEl != null){
      var contentCtn = this.popupEl.getElementsByClassName("content_ctn");
      
      switch(typeof this.settings.content){
        case "string": contentCtn[0].innerHTML = this.settings.content; break;
        case "string": contentCtn[0].appendChild(this.settings.content); break;
      }
            
      this.#loadButtons();

      if (typeof fallback == "function")fallback();
    }
  }

  #loadButtons() {
    var btnCtn = this.popupEl.getElementsByClassName("btn_ctn");

    if (
      typeof this.settings.buttons != "undefined" &&
      typeof this.settings.buttons == "object" &&
      this.settings.buttons.length > 0
    ) {
      this.settings.buttons.forEach((btn) => {
        var button = createDOMElement({type: 'button', attributes:{class:"modal_ctn"}, text: btn?.title})
        
        if(btn.tooltip != undefined){
            button.setAttribute('title') = btn.tooltip
        }

        if (btn.customClass != undefined){
            button.classList.add(btn.customClass)
        }

        btnCtn[0].appendChild(button)//  insertAdjacentHTML("beforeend", buttonHTML);
        if (typeof btn.click != "undefined")
            button.addEventListener("click", () => {
            btn.click(this);
          });
      });
    }
  }

  open() {
    
    const body = document.getElementsByTagName("body");
    if(this.settings.overlayer){
        this.OverDiv = createDOMElement({attributes: {
            class:"overlay",
            onclick: this.settings.outsideClose && this.settings.overlayer? this.close.bind(this) :"" 
        }})
        this.OverDiv.appendChild(this.CtnDiv);
        body[0].appendChild(this.OverDiv);
      }else{
        body[0].appendChild(this.CtnDiv);
        this.#EventListener()
      }

    this.popupEl = body[0].lastChild;

    this.#loadContent(() => {
      if (typeof this.settings.onOpen == "function") {
        this.settings.onOpen(this);
      }
    });
  }

  close() {
    if (this.settings.onClose != undefined && typeof this.settings.onClose == "function") {
        this.settings.onClose();
    }
	    
    this.popupEl.remove();
  }

  #EventListener(){
    if(!this.settings.overlayer){
      document.addEventListener('click', this.OutsideClick);
    }
  }

  #outsideClickListener(e){
    if(!e.target.closest('.modal_ctn') && e.target != this.elem){
      this.close()
    }
  }
}