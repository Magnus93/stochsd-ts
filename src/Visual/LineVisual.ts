import { Engine } from "../Engine";
import { SVG } from "../SVG";
import { cos, neg, rotate, sin, translate } from "../transform";
import { defaultFill, defaultStroke } from "./default";
import { TwoPointer } from "./TwoPointer";

export class LineVisual extends TwoPointer {
  line!: SVGLineElement
  clickLine!: SVGLineElement
  arrowHeadStart!: SVG.ArrowHead
  arrowHeadEnd!: SVG.ArrowHead
	constructor(public id: string, public type: string, public pos0: [number ,number], pos1: [number ,number]) {
		super(id, type, pos0, pos1);
		// this.dialog = new LineDialog(this.id); // TODO 
		// this.dialog.subscribePool.subscribe(()=>{
			// this.updateGraphics();
		// });
	}
	makeGraphics() {
		this.line = SVG.line(this.startX, this.startY, this.endX, this.endY, defaultStroke, defaultFill, "element");
		this.clickLine = SVG.line(this.startX, this.startY, this.endX, this.endY, "transparent", "none", "element", {"stroke-width": "10"});
		this.arrowHeadStart = SVG.arrowHead(defaultStroke, defaultStroke, {"class": "element"});
		this.arrowHeadEnd = SVG.arrowHead(defaultStroke, defaultStroke, {"class": "element"});
		const arrowPathPoints: [number, number][] = [[8, 0],[13, -5], [0,0], [13, 5]];
		this.arrowHeadStart.setTemplatePoints(arrowPathPoints);
		this.arrowHeadEnd.setTemplatePoints(arrowPathPoints);
		
		this.group = SVG.group([this.line, this.arrowHeadStart, this.arrowHeadEnd, this.clickLine]);
		this.group.setAttribute("node_id",this.id);
		this.elements = [this.line, this.arrowHeadStart, this.arrowHeadEnd];
		for(let key in this.elements) {
			this.elements[key].setAttribute("node_id",this.id);
		}
		$(this.group).on("dblclick", () => {
			this.doubleClick();
		});
	}
	doubleClick() {
		this.dialog.show();
	}
	updateGraphics() {
		this.line.setAttribute("stroke-width", Engine.getAttribute(this.primitive!, "StrokeWidth"));
		this.line.setAttribute("stroke-dasharray", Engine.getAttribute(this.primitive!, "StrokeDashArray"));

		let lineStartPos = [this.startX, this.startY];
		let lineEndPos = [this.endX, this.endY];
		let arrowHeadStart = Engine.getAttribute(this.primitive!, "ArrowHeadStart") === "true";
		let arrowHeadEnd = Engine.getAttribute(this.primitive!, "ArrowHeadEnd") === "true";
		this.arrowHeadStart.setAttribute("visibility", arrowHeadStart ? "visible" : "hidden");
		this.arrowHeadEnd.setAttribute("visibility", arrowHeadEnd ? "visible" : "hidden");
		if (arrowHeadStart || arrowHeadEnd) {
			/* Shorten line as not to go past arrowHeadEnd */
			let shortenAmount = 8;
			let sine = 		sin([this.endX, this.endY], [this.startX, this.startY]);
			let cosine = 	cos([this.endX, this.endY], [this.startX, this.startY]);
			let endOffset = rotate([shortenAmount, 0], sine, cosine);
			if (arrowHeadStart) {
				lineStartPos = translate(neg(endOffset), [this.startX, this.startY])
				this.arrowHeadStart.setPosition([this.startX, this.startY], [this.endX-this.startX, this.endY-this.startY])
				this.arrowHeadStart.update()
			}
			if (arrowHeadEnd) {
				lineEndPos = translate(endOffset, [this.endX, this.endY])
				this.arrowHeadEnd.setPosition([this.endX, this.endY], [this.startX-this.endX, this.startY-this.endY])
				this.arrowHeadEnd.update()
			}
		}
		
		this.line.setAttribute("x1", `${lineStartPos[0]}`)
		this.line.setAttribute("y1", `${lineStartPos[1]}`)
		this.line.setAttribute("x2", `${lineEndPos[0]}`)
		this.line.setAttribute("y2", `${lineEndPos[1]}`)
		this.clickLine.setAttribute("x1", `${this.startX}`)
		this.clickLine.setAttribute("y1", `${this.startY}`)
		this.clickLine.setAttribute("x2", `${this.endX}`)
		this.clickLine.setAttribute("y2", `${this.endY}`)
	}
	setColor(color: string) {
		super.setColor(color);
		this.arrowHeadStart.setAttribute("fill", color)
		this.arrowHeadEnd.setAttribute("fill", color)
	}
}