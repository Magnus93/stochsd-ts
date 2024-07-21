import { Engine } from "../Engine";
import { Maths } from "../Maths";
import { SVG } from "../SVG";
import { defaultFill, defaultStroke } from "./default";
import { ValuedOnePointer } from "./ValuedOnePointer";

export class ConverterVisual extends ValuedOnePointer {
	constructor(public id: string, public type: string, public position: [number, number], extras?: any) {
		super(id, type, position, extras);
		this.updateDefinitionError();
		this.namePositions = [[0, 29],[23, 5],[0, -21],[-23, 5]];
	}
	getImage() {
		return [
			SVG.path("M-20 0  L-10 -15  L10 -15  L20 0  L10 15  L-10 15  Z", this.color, defaultFill, "element"),
			SVG.path("M-20 0  L-10 -15  L10 -15  L20 0  L10 15  L-10 15  Z", "none", this.color, "highlight", {"transform": "scale(0.87)"}),
			SVG.icons(defaultStroke, defaultFill, "icons"),
			SVG.text(0,0, Engine.Primitives.getAttribute(this.primitive!, "name"), "name_element", {"fill": this.color}),
		];
	}

	getLinkMountPos([xTarget, yTarget]: [number, number]): [number, number] {
		// See "docs/code/mountPoints.svg" for math explanation 
		const [xCenter, yCenter] = this.getPos();
		const hexSlope = Maths.safeDivision(15.0, 10);  // placement of corner is at (10,15)
		const targetSlope = Maths.safeDivision(yTarget-yCenter, xTarget-xCenter);
		let xEdgeRel; 	// Relative x Position to center of Visual object.
		let yEdgeRel; 	// Relative y Position to center of Visual object.  
		if (hexSlope < targetSlope || targetSlope < -hexSlope) {
			const ySign = Maths.sign(yTarget - yCenter); 	// -1 if target above hexagon and 1 if target below hexagon 
			xEdgeRel = ySign*Maths.safeDivision(15, targetSlope);
			yEdgeRel = ySign*15; 
		} else if (0 < targetSlope && targetSlope < hexSlope) {
			const xSign = Maths.sign(xTarget - xCenter); // -1 if target left of hexagon and 1 if target right of hexagon
			xEdgeRel = xSign*Maths.safeDivision(30, (3/2)+targetSlope);
			yEdgeRel = xEdgeRel*targetSlope;
		} else {
			const xSign = Maths.sign(xTarget - xCenter); // -1 if target left of hexagon and 1 if target right of hexagon
			xEdgeRel = xSign*Maths.safeDivision(30, (3/2)-targetSlope);
			yEdgeRel = xEdgeRel*targetSlope;
		}
		const xEdge = xEdgeRel + xCenter;
		const yEdge = yEdgeRel + yCenter;
		return [xEdge, yEdge];
	}
	attachEvent() {
		let linkedPrimitives = Engine.Primitives.getLinkedPrimitives(this.primitive!);
		if (linkedPrimitives.length > 0) {
			Engine.Primitives.setAttribute(this.primitive!, "Source", linkedPrimitives[0].id);
		}
	}
	nameDoubleClick() {
		// openPrimitiveDialog(this.id, "name") // TODO add PrimitiveDialog
	}
	doubleClick() {
		// openPrimitiveDialog(this.id, "value") // TODO add PrimitiveDialog
	}
}