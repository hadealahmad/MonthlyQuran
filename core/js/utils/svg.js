// SVG Icon Creation Utilities

const SVGUtils = {
  /**
   * Create an SVG element with namespace
   * @param {string} viewBox - ViewBox attribute
   * @param {Array} children - Array of child element descriptors
   * @returns {SVGElement} SVG element
   */
  createSVG(viewBox, children = []) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');

    children.forEach(child => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', child.tag);
      Object.keys(child.attrs || {}).forEach(attr => {
        element.setAttribute(attr, child.attrs[attr]);
      });
      svg.appendChild(element);
    });

    return svg;
  },

  /**
   * Create checkbox unchecked icon
   * @returns {SVGElement} SVG element
   */
  createCheckboxUnchecked() {
    return this.createSVG('0 0 24 24', [
      {
        tag: 'rect',
        attrs: { x: '3', y: '3', width: '18', height: '18', rx: '2' }
      }
    ]);
  },

  /**
   * Create checkbox checked icon
   * @returns {SVGElement} SVG element
   */
  createCheckboxChecked() {
    return this.createSVG('0 0 24 24', [
      {
        tag: 'polyline',
        attrs: { points: '20 6 9 17 4 12' }
      }
    ]);
  },

  /**
   * Create sun icon
   * @returns {SVGElement} SVG element
   */
  createSunIcon() {
    return this.createSVG('0 0 24 24', [
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '5' } },
      { tag: 'line', attrs: { x1: '12', y1: '1', x2: '12', y2: '3' } },
      { tag: 'line', attrs: { x1: '12', y1: '21', x2: '12', y2: '23' } },
      { tag: 'line', attrs: { x1: '4.22', y1: '4.22', x2: '5.64', y2: '5.64' } },
      { tag: 'line', attrs: { x1: '18.36', y1: '18.36', x2: '19.78', y2: '19.78' } },
      { tag: 'line', attrs: { x1: '1', y1: '12', x2: '3', y2: '12' } },
      { tag: 'line', attrs: { x1: '21', y1: '12', x2: '23', y2: '12' } },
      { tag: 'line', attrs: { x1: '4.22', y1: '19.78', x2: '5.64', y2: '18.36' } },
      { tag: 'line', attrs: { x1: '18.36', y1: '5.64', x2: '19.78', y2: '4.22' } }
    ]);
  },

  /**
   * Create moon icon
   * @returns {SVGElement} SVG element
   */
  createMoonIcon() {
    return this.createSVG('0 0 24 24', [
      {
        tag: 'path',
        attrs: { d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' }
      }
    ]);
  },

  /**
   * Create minus icon (horizontal line)
   * @returns {SVGElement} SVG element
   */
  createMinusIcon() {
    return this.createSVG('0 0 24 24', [
      { tag: 'line', attrs: { x1: '5', y1: '12', x2: '19', y2: '12' } }
    ]);
  },

  /**
   * Create plus icon
   * @returns {SVGElement} SVG element
   */
  createPlusIcon() {
    return this.createSVG('0 0 24 24', [
      { tag: 'line', attrs: { x1: '12', y1: '5', x2: '12', y2: '19' } },
      { tag: 'line', attrs: { x1: '5', y1: '12', x2: '19', y2: '12' } }
    ]);
  },

  /**
   * Create book/read icon
   * @returns {SVGElement} SVG element
   */
  createBookIcon() {
    return this.createSVG('0 0 24 24', [
      { tag: 'path', attrs: { d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' } },
      { tag: 'path', attrs: { d: 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' } }
    ]);
  },

  /**
   * Create edit icon
   * @returns {SVGElement} SVG element
   */
  createEditIcon() {
    return this.createSVG('0 0 24 24', [
      { tag: 'path', attrs: { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' } },
      { tag: 'path', attrs: { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' } }
    ]);
  },

  /**
   * Create close icon
   * @returns {SVGElement} SVG element
   */
  createCloseIcon() {
    return this.createSVG('0 0 24 24', [
      { tag: 'line', attrs: { x1: '18', y1: '6', x2: '6', y2: '18' } },
      { tag: 'line', attrs: { x1: '6', y1: '6', x2: '18', y2: '18' } }
    ]);
  },


createPlayIcon() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    const polygon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon",
    );
    polygon.setAttribute("points", "5 3 19 12 5 21 5 3");
    svg.appendChild(polygon);

    return svg;
  },


  
  createPauseIcon() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    const rect1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    rect1.setAttribute("x", "6");
    rect1.setAttribute("y", "4");
    rect1.setAttribute("width", "4");
    rect1.setAttribute("height", "16");

    const rect2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    rect2.setAttribute("x", "14");
    rect2.setAttribute("y", "4");
    rect2.setAttribute("width", "4");
    rect2.setAttribute("height", "16");

    svg.appendChild(rect1);
    svg.appendChild(rect2);
    return svg;
  },

};

