/**
 * Render a generic node
 * @param {string} nodeType 
 * @param {string} id 
 * @param {string} classList 
 * @returns {HTMLElement}
 */
function renderNode(nodeType, id = null, classList = []) {
    const node = document.createElement(nodeType);
    node.id = id;
    node.onchange
    node.classList = classList;
    return node;
}

/**
 * Render div
 * @param {string} id 
 * @param {string} classList 
 * @returns {HTMLDivElement}
 */
function renderDiv(id = null, classList = []) {
    return renderNode("div", id, classList);
}

/**
 * Render Radio button
 * @param {string} classList
 * @param {string} name
 * @param {string} value
 * @returns {HTMLInputElement}
 */
function renderRadio(classList = null, name = null, value = null){
    const radio = renderNode("input", null, classList);
    radio.type = "radio";
    radio.name = name;
    radio.value = value;
    return radio;
}

export {renderDiv, renderRadio, renderNode};