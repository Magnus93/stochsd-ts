import { Dialog } from "../components";
import { CoordRect } from "../CoordRect";
import { Engine } from "../Engine";
import { SVG } from "../SVG";
import { defaultStroke } from "./default";
import { TwoPointer } from "./TwoPointer";

export class RectangleVisual extends TwoPointer {
	constructor(public id: string, public type: string, pos0: [number, number], pos1: [number, number]) {
		super(id, type, pos0, pos1);
		this.dialog = new Dialog.Rectangle(this.id);
		this.dialog.subscribePool.subscribe(() => {
			this.updateGraphics();
		});
	}
	group!: SVGGElement
	rectCoord!: CoordRect<SVGRectElement>
	clickCoord!: CoordRect<SVGRectElement>
	makeGraphics() {
		this.rectCoord = new CoordRect(SVG.rect(this.getMinX(), this.getMinY(), this.getWidth(), this.getHeight(), defaultStroke, "none", "element"));

		// Invisible rect to more easily click
		this.clickCoord = new CoordRect(SVG.rect(this.getMinX(), this.getMinY(), this.getWidth(), this.getHeight(), "transparent", "none"));
		this.clickCoord.element!.setAttribute("stroke-width", "10");

		this.group = SVG.group([this.rectCoord.element, this.clickCoord.element])
		this.group.setAttribute("node_id", this.id)
		this.elements = [this.rectCoord.element]
		for (let key in this.elements) {
			this.elements[key].setAttribute("node_id", this.id);
		}

		$(this.group).on("dblclick", () => {
			this.doubleClick();
		});
	}
	doubleClick() {
		this.dialog.show();
	}
	updateGraphics() {
		this.clickCoord.element.setAttribute("stroke-dasharray", Engine.getAttribute(this.primitive!, "StrokeDashArray"));
		this.clickCoord.element.setAttribute("stroke-width", Engine.getAttribute(this.primitive!, "StrokeWidth"));
		// Update rect to fit start and end position
		this.rectCoord.x1 = this.startX;
		this.rectCoord.y1 = this.startY;
		// Prevent width from being 0 (then rect is not visible)
		let endx = (this.startX != this.endX) ? this.endX : this.startX + 1;
		let endy = (this.startY != this.endY) ? this.endY : this.startY + 1;
		this.rectCoord.x2 = endx;
		this.rectCoord.y2 = endy;
		this.rectCoord.update();

		this.clickCoord.x1 = this.startX;
		this.clickCoord.y1 = this.startY;
		this.clickCoord.x2 = endx;
		this.clickCoord.y2 = endy;
		this.clickCoord.update();
	}
}