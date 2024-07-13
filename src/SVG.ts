/*

This file may distributed and/or modified under the
terms of the Affero General Public License (http://www.gnu.org/licenses/agpl-3.0.html).

*/
import { Settings } from "./Settings";
import * as TwoD from "./transform"

export namespace SVG {
  export function fromString(svg: SVGElement, inString: string) {
    var container = document.createElementNS("http://www.w3.org/2000/svg", 'temp'); //Create a path in SVG's namespace
    container.innerHTML = inString;
    const newElement = container.children[0];
    svg.appendChild(newElement);
    return newElement;
  }
  export class Group extends SVGGElement {
    constructor(svg: SVGElement, elements: Element[], transform?: string, markclass?: string) {
      super()
      for(let i=0; i<elements.length; i++) {
        this.appendChild(elements[i]);
      }
      if(transform) {
        this.setAttribute("transform", transform);
      }
      if(markclass) {
        this.setAttribute("class", markclass)
      }
      svg.appendChild(this)
    }
  }
  export function translate(element: Element, x: number, y: number) {
    element.setAttribute("transform",`translate("${x}","${y}") rotate(0)`);
  }
  export function transform(element: Element, x: number, y: number, r: number, s: number) {
    element.setAttribute("transform", "translate("+x+","+y+") rotate("+r+") scale("+s+")");
  }
  export class Curve extends SVGPathElement {
    constructor(svg: SVGElement, public way: "oneway" | "twoway", public x1: number, public y1: number, public x2: number, public y2: number, public x3: number, public y3: number, public x4: number, public y4: number, extraAttributes: {[k:string]: string} | null=null) {
      super()
      this.setAttribute("stroke","black");
      // fill must be "none" otherwise it may cover up objects behind
      this.setAttribute("fill",this.way == "oneway" ? "none" : "transparent");
      // Is set last so it can override default attributes
      if(extraAttributes) {
        for(var key in extraAttributes) {
          this.setAttribute(key,extraAttributes[key]); //Set path's data
        }
      }
      this.update();
      svg.appendChild(this);
    }
    update() {
      let d = `M${this.x1},${this.y1} C${this.x2},${this.y2} ${this.x3},${this.y3} ${this.x4},${this.y4}` 
      if (this.way == "twoway") {
        // Only twoway should curve should be used as a click object
        d += `C ${this.x3},${this.y3} ${this.x2},${this.y2} ${this.x1},${this.y1}`;
      }
      this.setAttribute("d",d);
    };
  }
  export class Path extends SVGPathElement {
    constructor(svg: SVGElement, public dstring: string, stroke: string, fill: string, markclass: string, extraAttributes?: Record<string, string>) {
      super()
      this.setAttribute("class", markclass); //Set path's data
      this.setAttribute("stroke","black");
      this.setAttribute("fill","transparent");
      this.setAttribute("fill",fill);
      this.setAttribute("stroke",stroke);
  
      if(extraAttributes) {
        for(var key in extraAttributes) {
          this.setAttribute(key, extraAttributes[key]); //Set path's data
        }
      }
  
      this.update();
      svg.appendChild(this);
    }
    update() {
      this.setAttribute("d", this.dstring);
    };
  }
  export class Text extends SVGTextElement {
    constructor(svg: SVGElement, x: number, y: number, text: string, markclass: string, extraAttributes?: Record<string, string>) {
      super();
      this.setAttribute("class",markclass);
      this.setAttribute("x", `${x}`);
      this.setAttribute("y", `${y}`);
      this.innerHTML = text;
      this.setAttribute("text-anchor", "middle");
      this.setAttribute("style", "font-size: " + Settings.primitiveFontSize + "px");
    
      if(extraAttributes != undefined) {
        for(var key in extraAttributes) {
          this.setAttribute(key, extraAttributes[key]);
        }
      }
      svg.appendChild(this);
    }
  }
  export class ForeignScrollable extends SVGGElement {
    cutDiv: HTMLDivElement;
    contentDiv: HTMLDivElement;
    scrollDiv: HTMLDivElement;
    innerDiv: HTMLDivElement;
    constructor(svg: SVGElement, x: number, y: number, width: number, height: number, innerHTML: string, fill="white") {
      super()
      // foreignObject tag must be camel case to work which is weird
      // Using a tag on top might be better http://stackoverflow.com/questions/6538918/can-i-embed-html-into-an-html5-svg-fragment
      let foreign = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
      foreign.setAttribute("style", "width: 100%; height: 100%; pointer-events: none;");
  
      this.cutDiv = document.createElement("div");
      // This div is nessecary to avoid overflow in some browsers
      this.cutDiv.setAttribute("style","overflow: hidden; pointer-events: all;");
      this.cutDiv.setAttribute("class","cutDiv");
  
      // This div holds the scrolling and sets the background color
      this.scrollDiv = document.createElement("div");
      this.scrollDiv.setAttribute(`style`, `background-color: ${fill}; overflow: auto;`);
      this.scrollDiv.setAttribute("class","scrollDiv");
  
      // This div is on the inside of the scroll div and reacts to things such as clicks
      this.innerDiv = document.createElement("div");
      this.innerDiv.setAttribute(`style`, `width: 100%; height: 100%; overflow: visible; background-color: ${fill}`);
      this.innerDiv.setAttribute("class","innerDiv");
  
      // This div is where we put the content
      this.contentDiv = document.createElement("div");
      this.contentDiv.innerHTML=innerHTML;
      this.contentDiv.setAttribute(`style`, `overflow: visible; background-color: ${fill}`);
      this.contentDiv.setAttribute("class","contentDiv");
  
      this.innerDiv.appendChild(this.contentDiv);
      this.scrollDiv.appendChild(this.innerDiv);
      this.cutDiv.appendChild(this.scrollDiv);
      foreign.appendChild(this.cutDiv);
      this.appendChild(foreign);
  
      this.setAttribute("x", `${x}`);
      this.setAttribute("y", `${y}`);	
      this.setAttribute("width", `${width}`);
      this.setAttribute("height", `${height}`);
      svg.appendChild(this);
    }
    setX(x: number) { 
      this.cutDiv.style.marginLeft = `${x}px`; 
    }
    setY(y: number) {
      this.cutDiv.style.marginTop = `${y}px`; 
    }
    setWidth(w: number)  {
      this.cutDiv.style.width = `${w}px`; 
    }
    setHeight(h: number) {
      this.cutDiv.style.height = `${h}px`; 
    }
  }
  export class Foreign extends SVGGElement {
    cutDiv: HTMLDivElement
    contentDiv: HTMLDivElement
    constructor(svg: SVGGElement, x: number, y: number, width: number, height: number, innerHtml: string, fill="white") {
      super();
      // covers entire screen - never moves
      // if foreignObject moves in Chrome then automatic scroll
      let foreign = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
      foreign.setAttribute("style", `height: 100%; width: 100%; pointer-events: none;`);
    
      this.cutDiv = document.createElement("div");
      this.cutDiv.setAttribute("style", `background: ${fill}; overflow: hidden; pointer-events: all;`);
    
      this.contentDiv = document.createElement("div");
      this.contentDiv.innerHTML = innerHtml;
      let padding = 8;
      this.contentDiv.setAttribute("style", `
        position: relative; 
        left: ${padding}px; 
        top: ${padding}px; 
        width: calc( 100% - ${2*padding}px );
        height: calc( 100% - ${2*padding}px );
      `);
      this.contentDiv.setAttribute("class", "contentDiv");
    
      this.appendChild(foreign);
      foreign.appendChild(this.cutDiv);
      this.cutDiv.appendChild(this.contentDiv);
    
      this.cutDiv = this.cutDiv;
      this.contentDiv = this.contentDiv;
    
      this.setAttribute("x", `${x}`);
      this.setAttribute("y", `${y}`);	
      this.setAttribute("width", `${width}`);
      this.setAttribute("height", `${height}`);
      svg.appendChild(this);
    }
    setX(x: number) { 
      this.cutDiv.style.marginLeft = `${x}px`; 
    }
    setY(y: number) {
      this.cutDiv.style.marginTop = `${y}px`; 
    }
    setWidth(w: number)  {
      this.cutDiv.style.width = `${w}px`; 
    }
    setHeight(h: number) {
      this.cutDiv.style.height = `${h}px`; 
    }
  }
  
  export class Circle extends SVGCircleElement {
    constructor(svg: SVGElement, cx: number, cy: number, r: number, stroke: string, fill: string, markclass: string, extraAttributes: Record<string, string>) {
      super();
      this.setAttribute("class",markclass);
      this.setAttribute("cx", `${cx}`);
      this.setAttribute("cy", `${cy}`);
      this.setAttribute("r", `${r}`);
      this.setAttribute("fill", fill);
      this.setAttribute("stroke", stroke);
      this.setAttribute("data-attr", "selected");
      if (extraAttributes) {
        for(var key in extraAttributes) {
          this.setAttribute(key, extraAttributes[key]);
        }
      }
      svg.appendChild(this);
    }
  }
  export class Ellipse extends SVGEllipseElement {
    constructor(svg: SVGElement, cx: number, cy: number, rx: number, ry: number, stroke: string, fill: string, markclass: string, extraAttributes: Record<string, string>) {
      super();
      this.setAttribute("class", markclass);
      this.setAttribute("cx", `${cx}`);
      this.setAttribute("cy", `${cy}`);
      this.setAttribute("rx", `${rx}`);
      this.setAttribute("ry", `${ry}`);
      this.setAttribute("fill", fill);
      this.setAttribute("stroke", stroke);
      this.setAttribute("data-attr", "selected");
      if (extraAttributes) {
        for (let key in extraAttributes) {
          this.setAttribute(key, extraAttributes[key]);
        }
      }
      svg.appendChild(this);
    }
  }
  export class Line extends SVGLineElement {
    constructor(svg: SVGElement, x1: number, y1: number, x2: number, y2: number, stroke: string, fill: string,markclass: string, extraAttributes: Record<string, string>) {
      super();
      this.setAttribute("class",markclass);
      this.setAttribute("x1", `${x1}`);
      this.setAttribute("y1", `${y1}`);
      this.setAttribute("x2", `${x2}`);
      this.setAttribute("y2", `${y2}`);
      this.setAttribute("fill", fill);
      this.setAttribute("stroke", stroke);
      this.setAttribute("data-attr", "selected");
      this.setAttribute("stroke-width", "1");
  
      if(extraAttributes!=undefined) {
        for(var key in extraAttributes) {
          this.setAttribute(key,extraAttributes[key]);
        }
      }
      svg.appendChild(this);
    }
  }
  export class ArrowHead extends SVGPathElement {
    templateArrowPoints: TwoD.Point[]
    arrowPoints: TwoD.Point[]
    constructor(svg: SVGElement, stroke: string, fill: string, extraAttributes?: Record<string, string>) {
      super();
      this.setAttribute("stroke", stroke);
      this.setAttribute("fill", fill);
      this.templateArrowPoints = [[12, -2],[12, -6], [0,0], [12, 6],[12, 2]];
      this.arrowPoints = [];
  
      if (extraAttributes) {
        for(var key in extraAttributes) {
          this.setAttribute(key, extraAttributes[key]);
        }
      }
  
      svg.appendChild(this);
      return this;
    }
    setTemplatePoints(newPoints: TwoD.Point[]) {
      this.templateArrowPoints = newPoints;
    }
  
    setPos(pos: [number, number], directionVector: TwoD.Point = [1,0]) {
      let sine = TwoD.sin([0,0], directionVector);
      let cosine = TwoD.cos([0,0], directionVector);
      this.arrowPoints = TwoD.rotatePoints(this.templateArrowPoints, sine, cosine);
      this.arrowPoints = TwoD.translatePoints(this.arrowPoints, pos);
    };
  
    update() {
      let d = "M"+this.arrowPoints[0][0]+","+this.arrowPoints[0][1];
      for (let i = 1; i < this.arrowPoints.length; i++) {
        d += "L"+this.arrowPoints[i][0]+","+this.arrowPoints[i][1]+" ";
      }
      // d += "Z";
      this.setAttribute("d", d);
    };
  }
  export class WidePath extends SVGPathElement {
    points: TwoD.Point[]
    constructor(svg: SVGElement, width: number, color: string, extraAttributes?: Record<string, string>) {
      super();
      this.points = [];
      this.setAttribute("stroke", color);
      this.setAttribute("fill", "transparent");
      this.setAttribute("stroke-width", width.toString());
  
      // Is set last so it can override default attributes
      if(extraAttributes) {
        for(var key in extraAttributes) {
          this.setAttribute(key, extraAttributes[key]); //Set path's data
        }
      }
      svg.appendChild(this);
    }
    setPoints(points: TwoD.Point[]) {
      this.points = points;
    }
    update() {
      let points = this.points;
      if (points.length < 1) {return;}
      let d = "M"+points[0][0]+","+points[0][1];
      for (let i = 1; i < this.points.length; i++) {
        d += "L"+points[i][0]+","+points[i][1]+" ";
      }
      for (let i = this.points.length-2; 0 < i; i-- ) { 	// Draw path back upon itself - Reason: remove area in which to click on
        d += "L"+points[i][0]+","+points[i][1]+" ";
      }
      // d += "Z";
      this.setAttribute("d", d);
    }
  }
  export class Cloud extends SVGPathElement {
    visible: boolean
    pos: TwoD.Point
    defaultStroke: string
    defaultFill: string
    constructor(svg: SVGElement, stroke: string, fill: string, extraAttributes: Record<string, string>) {
      super();
      this.setAttribute("stroke", stroke);
      this.setAttribute("stroke-width", "1");
      this.setAttribute("fill", fill);
      this.setAttribute("d", "m -0.8447564,-11.14014 c -4.6214865,0.0079 -8.5150638,3.4528784 -9.0815386,8.0394981 -2.433142,0.4797384 -4.187489,2.61298232 -4.188373,5.0929775 -6.93e-4,2.8681392 2.323935,5.1936858 5.1920483,5.1941646 H 7.671332 C 11.368943,7.1872852 14.36665,4.1896043 14.365861,0.49198425 14.223787,-3.916487 10.814437,-6.550028 7.2876342,-6.1810461 5.7167742,-9.2242012 2.5799338,-11.137323 -0.84475524,-11.140887 Z");
      this.visible = true;
      this.pos = [0, 0];
      this.defaultStroke = stroke;
      this.defaultFill = fill;
  
      // Is set last so it can override default attributes
      if(extraAttributes) {
        for(var key in extraAttributes) {
          this.setAttribute(key, extraAttributes[key]); //Set path's data
        }
      }
      svg.appendChild(this);
    }
    setPos(pos: TwoD.Point, adjacentPos: TwoD.Point) {
      let offset: TwoD.Point = [0,0];
      switch (TwoD.neswDirection(adjacentPos, pos)) {
        case "north":
          offset = [0, 11];	
          break;
        case "east":
          offset = [14, -1];
          break;
        case "south":
          offset = [0, -7];
          break;
        default: // west
          offset = [-14, 0];	
          break;
      }
      this.pos = TwoD.translate(pos, offset);
    }
  
    update() {
      this.setAttribute("transform","translate("+this.pos[0]+","+this.pos[1]+")");
    }
  
    setVisibility(isVisible: boolean) {
      this.visible = isVisible;
      if (this.visible) {
        this.setAttribute("visibility", "visible");
      } else {
        this.setAttribute("visibility", "hidden");
      } 
    }
  }
  export function ghost(stroke: string, fill: string, markclass: string = "") {
    let newElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    newElement.setAttribute("stroke", stroke);
    newElement.setAttribute("fill", fill);
    newElement.setAttribute("stroke-width", "1");
    newElement.setAttribute("d", "m 9.9828659,-2.772745 c 0,1.3775907 0.2255841,11.8988413 -0.2819803,13.083087 C 9.1933216,11.50264 7.203349,7.3618143 6.3090708,8.2640961 5.4067353,9.1663779 5.0844728,10.004211 3.8921001,10.511744 2.699728,11.011221 1.3945641,8.1996473 0.01689062,8.1996473 -1.3607825,8.1996473 -2.6659466,11.011221 -3.858319,10.511744 -5.050691,10.004211 -5.2601616,9.6014057 -6.1624971,8.6991239 -7.0648332,7.7968422 -9.2320496,11.542923 -9.7396135,10.350622 -10.239121,9.1583207 -9.9490844,-1.3951543 -9.9490844,-2.772745 c 0,-5.4942523 4.4633386,-9.957325 9.96597502,-9.957325 5.50263598,0 9.96597528,4.4630727 9.96597528,9.957325 z");
    newElement.setAttribute("class", markclass);
    return newElement;
  }
  
  export function dice(stroke: string, fill: string, markclass: string = "") {
    let newElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    newElement.setAttribute("stroke", stroke);
    newElement.setAttribute("fill", fill);
    newElement.setAttribute("stroke-width", "1");
    newElement.setAttribute("d", "m -3.5463331,-9.2427435 -4.2426784,4.7879684 V 6.5315532 l 12.8085634,0.6925413 2.4411505,-6.1592462 0.052919,-9.52762 z m 0.2231778,0.4831683 10.0499019,0.6626308 -2.1719568,3.7180958 -11.338351,-0.441754 z m 5.8900524,1.0284584 a 1.4725126,0.6828872 0 0 0 -1.4725131,0.683338 1.4725126,0.6828872 0 0 0 1.4725131,0.6810374 1.4725126,0.6828872 0 0 0 1.4725131,-0.6810374 1.4725126,0.6828872 0 0 0 -1.4725131,-0.683338 z m -5.5265258,0.8535974 a 1.4725126,0.72416619 0 0 0 -1.472513,0.7247526 1.4725126,0.72416619 0 0 0 1.472513,0.7247525 1.4725126,0.72416619 0 0 0 1.4725131,-0.7247525 1.4725126,0.72416619 0 0 0 -1.4725131,-0.7247526 z m -4.2288736,2.645922 11.5868376,0.43025 -0.073626,10.491656 -11.4763991,-0.6879398 z m 2.9450262,1.4357003 a 1.472513,1.472513 0 0 0 -1.4725131,1.4725131 1.472513,1.472513 0 0 0 1.4725131,1.47251311 1.472513,1.472513 0 0 0 1.4725132,-1.47251311 1.472513,1.472513 0 0 0 -1.4725132,-1.4725131 z m 5.22742159,0.1840641 a 1.4725131,1.4725131 0 0 0 -1.35747298,0.8973128 1.4725131,1.4725131 0 0 0 -0.0506177,0.1403489 1.4725131,1.4725131 0 0 0 -0.0644225,0.4348514 A 1.4725131,1.4725131 0 0 0 0.98394549,0.33319327 1.4725131,1.4725131 0 0 0 2.4564586,-1.1393199 1.4725131,1.4725131 0 0 0 0.98394549,-2.611833 Z M -4.0225991,1.8425192 a 1.4725126,1.4725126 0 0 0 -1.4725131,1.4725132 1.4725126,1.4725126 0 0 0 1.4725131,1.4725131 1.4725126,1.4725126 0 0 0 1.472513,-1.4725131 1.4725126,1.4725126 0 0 0 -1.472513,-1.4725132 z m 4.93291896,0.2576899 a 1.472513,1.472513 0 0 0 -1.47251311,1.472513 1.472513,1.472513 0 0 0 0.522282,1.1250922 1.472513,1.472513 0 0 0 0.11734089,0.089731 A 1.472513,1.472513 0 0 0 0.91031986,5.0452349 1.472513,1.472513 0 0 0 2.3828329,3.5727221 1.472513,1.472513 0 0 0 0.91031986,2.1002091 Z");
    newElement.setAttribute("class", markclass);
    return newElement;
  }
  export function questionmark(svg: SVGElement, color: string) {
    return new Text(svg, 0, 6, "?", "questionmark", {"font-size": "18px", "font-weight": "bold", "stroke": color});;
  }
  export class Icons extends Group {
    elements: Record<"ghost" | "questionmark" | "dice", Element>
    constructor(svg: SVGElement, stroke: string, fill: string, markclass?: string) {
      super(svg, [
        ghost(stroke, fill, "ghost"),
        questionmark(svg, stroke),
        dice(fill, stroke)
      ], undefined, markclass)
      this.elements = {
        "ghost": this.children[0],
        "questionmark": this.children[1],
        "dice": this.children[2]
      }
    }
    setColor(color: string) {
      this.elements["ghost"].setAttribute("stroke", color);
      this.elements["questionmark"].setAttribute("style", `fill: ${color}`);
      this.elements["dice"].setAttribute("style", `fill: ${color}` );
    }
    set(icon: "ghost" | "questionmark" | "dice", visibility: "visible" | "hidden") {
      this.elements[icon].setAttribute("visibility", visibility);
    }
  }
}


