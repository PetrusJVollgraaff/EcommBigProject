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
