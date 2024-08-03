import { CoordRect } from "../CoordRect";
import { Engine } from "../Engine";
import { SVG } from "../SVG";
import { defaultFill, defaultStroke } from "./default";
import { TwoPointer } from "./TwoPointer";

export class EllipseVisual extends TwoPointer {
	element!: SVGEllipseElement
	clickEllipse!: SVGEllipseElement
	selectCoordRect!: CoordRect<SVGRectElement>
	constructor(public id: string, public type: string, public pos0: [number, number], public pos1: [number, number]) {
		super(id, type, pos0, pos1);
		// this.dialog = new EllipseDialog(this.id) // TODO
		// this.dialog.subscribePool.subscribe(()=>{
		// 	this.updateGraphics();
		// });
	}
	makeGraphics() {
		let cx = (this.startX + this.endX) / 2;
		let cy = (this.startY + this.endY) / 2;
		let rx = Math.max(Math.abs(this.startX - this.endX) / 2, 1);
		let ry = Math.max(Math.abs(this.startY - this.endY) / 2, 1);
		this.element = SVG.ellipse(cx, cy, rx, ry, defaultStroke, "none", "element");
		this.clickEllipse = SVG.ellipse(cx, cy, rx, ry, "transparent", "none", "element", { "stroke-width": "10" });

		this.selectCoordRect = new CoordRect(SVG.rect(cx, cy, rx, ry, defaultStroke, defaultFill, "highlight", { "stroke-dasharray": "2 2" }));
		this.elements = [this.element];
		this.group = SVG.group([this.element, this.clickEllipse, this.selectCoordRect.element]);
		this.group.setAttribute("node_id", this.id);

		$(this.group).on("dblclick", () => {
			this.doubleClick();
		})
	}
	doubleClick() {
		this.dialog.show();
	}
	updateGraphics() {
		let cx = (this.startX + this.endX) / 2;
		let cy = (this.startY + this.endY) / 2;
		let rx = Math.max(Math.abs(this.startX - this.endX) / 2, 1);
		let ry = Math.max(Math.abs(this.startY - this.endY) / 2, 1);
		this.element.setAttribute("cx", `${cx}`)
		this.element.setAttribute("cy", `${cy}`)
		this.element.setAttribute("rx", `${rx}`)
		this.element.setAttribute("ry", `${ry}`)
		this.element.setAttribute("stroke-dasharray", Engine.getAttribute(this.primitive!, "StrokeDashArray"));
		this.element.setAttribute("stroke-width", Engine.getAttribute(this.primitive!, "StrokeWidth"));
		this.clickEllipse.setAttribute("cx", `${cx}`)
		this.clickEllipse.setAttribute("cy", `${cy}`)
		this.clickEllipse.setAttribute("rx", `${rx}`)
		this.clickEllipse.setAttribute("ry", `${ry}`)
		this.selectCoordRect.x1 = this.startX;
		this.selectCoordRect.y1 = this.startY;
		this.selectCoordRect.x2 = this.endX;
		this.selectCoordRect.y2 = this.endY;
		this.selectCoordRect.update();
	}

	select() {
		super.select();
		this.selectCoordRect.element.setAttribute("visibility", "visible")
	}
	unselect() {
		super.unselect();
		this.selectCoordRect.element.setAttribute("visibility", "hidden")
	}
}