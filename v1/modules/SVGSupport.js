

export class SVGSupport {

    constructor(svgElement) {
        this.svg = svgElement;
        this.document = svgElement.ownerDocument;
    }// constructor

    setSize(width, height){
        this.svg.setAttribute("width", width);
        this.svg.setAttribute("height", height);
    }

    createElement(tagName) {
        return this.document.createElementNS('http://www.w3.org/2000/svg', tagName);
    }

     drawSVGCircle(cx, cy, r, strokeColor, strokeWidth, fillColor){
        const circle = this.createElement("circle");

        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", r);
        circle.setAttribute("stroke", strokeColor);
        circle.setAttribute("stroke-width", strokeWidth);
        circle.setAttribute("fill", fillColor);

        this.svg.appendChild(circle);
    }

     drawSVGLine(x1, y1, x2, y2, strokeColor, strokeWidth){
        const line = this.createElement("line");

        line.setAttribute("x1", x1);
        line.setAttribute("x2", x2);
        line.setAttribute("y1", y1);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", strokeColor);
        line.setAttribute("stroke-width", strokeWidth);

        this.svg.appendChild(line);
    }


} // class SVGSupport
