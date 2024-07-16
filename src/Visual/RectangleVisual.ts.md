import { TwoPointer } from "./TwoPointer";

export class RectangleVisual extends TwoPointer {
	constructor(public id: string, public type: string, pos0: [number, number], pos1: [number, number]) {
		super(id, type, pos0, pos1);
		this.dialog = new RectangleDialog(this.id);
		this.dialog.subscribePool.subscribe(()=>{
			this.updateGraphics();
		});
	}
	makeGraphics() {
		this.element = svg_rect(this.getMinX(), this.getMinY(), this.getWidth(), this.getHeight(), defaultStroke, "none", "element");

		// Invisible rect to more easily click
		this.clickRect = svg_rect(this.getMinX(), this.getMinY(), this.getWidth(), this.getHeight(), "transparent", "none");
		this.clickRect.setAttribute("stroke-width", "10");

		this.coordRect = new CoordRect();
		this.coordRect.element = this.element;

		this.clickCoordRect = new CoordRect();
		this.clickCoordRect.element = this.clickRect;

		this.group = svg_group([this.element, this.clickRect]);
		this.group.setAttribute("node_id",this.id);
		this.element_array = [this.element];
		for(let key in this.element_array) {
			this.element_array[key].setAttribute("node_id",this.id);
		}

		$(this.group).dblclick((event) => {
			this.doubleClick();
		});
	}
	doubleClick() {
		this.dialog.show();
	}
	updateGraphics() {
		this.element.setAttribute("stroke-dasharray", this.primitive.getAttribute("StrokeDashArray"));
		this.element.setAttribute("stroke-width", this.primitive.getAttribute("StrokeWidth"));
		// Update rect to fit start and end position
		this.coordRect.x1 = this.startX;
		this.coordRect.y1 = this.startY;
		// Prevent width from being 0 (then rect is not visible)
		let endx = (this.startX != this.endX) ? this.endX : this.startX + 1;
		let endy = (this.startY != this.endY) ? this.endY : this.startY + 1;
		this.coordRect.x2 = endx;
		this.coordRect.y2 = endy;
		this.coordRect.update();

		this.clickCoordRect.x1 = this.startX;
		this.clickCoordRect.y1 = this.startY;
		this.clickCoordRect.x2 = endx;
		this.clickCoordRect.y2 = endy;
		this.clickCoordRect.update();
	}
}