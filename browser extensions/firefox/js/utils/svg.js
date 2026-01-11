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
  }
};

