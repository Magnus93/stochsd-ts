import { Maths } from "../Maths";
import { SVG } from "../SVG";
import { neg, translate } from "../transform";
import { VisualController } from "../VisualController";
import { defaultFill, defaultStroke } from "./default";
import { ValuedOnePointer } from "./ValuedOnePointer";

export class StockVisual extends ValuedOnePointer {
	constructor(public id: string, public type: string, public position: [number, number], extras: any) {
		super(id, type, position, extras);
		this.updateDefinitionError();
		this.namePositions = [[0, 32], [27, 5], [0, -24], [-27, 5]];
	}

	getSize() {
		return [50, 38];
	}

	getBoundRect() {
		let pos = this.getPos()
		let size = this.getSize();
		return {
			"minX": pos[0] - size[0]/2, 
			"maxX": pos[0] + size[0]/2, 
			"minY": pos[1] - size[1]/2, 
			"maxY": pos[1] + size[1]/2 
		};
	}

	setPos(position: [number, number]) {
		let diff = translate(neg(this.position), position);
		super.setPos(position);
		let startConnections = VisualController.findStartConnections(this);
		for(let conn of startConnections) {
			// if (conn instanceof FlowVisual && conn.isSelected() === false) { // TODO add FlowVisual
				// let oldConnPos = conn.startAnchor.getPos()
				// let newConnPos = translate(oldConnPos, diff)
				// conn.requestNewAnchorPos(newConnPos, conn.startAnchor.id)
			// }
		}
		let endConnections = VisualController.findEndConnections(this)
		for(let conn of endConnections) {
			// if (conn instanceof FlowVisual && conn.isSelected() === false) { // TODO add FlowVisual
				// let oldAnchorPos = conn.endAnchor.getPos()
				// let newAnchorPos = translate(oldAnchorPos, diff)
				// conn.requestNewAnchorPos(newAnchorPos, conn.endAnchor.id)
			// }
		}
	}

	// Used for FlowVisual
	getFlowMountPos([xTarget, yTarget]: [number, number]): [number, number] {
		const [xCenter, yCenter] = this.getPos();
		const [width, height] = this.getSize();
		const boxSlope = Maths.safeDivision(height, width);
		const targetSlope = Maths.safeDivision(yTarget-yCenter, xTarget-xCenter);
		let xEdge;
		let yEdge; 
		if (Maths.isInLimits(-boxSlope, targetSlope, boxSlope)) { // Left or right of box
			xEdge = Maths.sign(xTarget-xCenter)*width/2 + xCenter;
			if (Maths.isInLimits(yCenter-height/2, yTarget, yCenter+height/2)) { // if within box y-limits
				yEdge = yTarget;
			} else {
				yEdge = yCenter + Maths.sign(yTarget-yCenter)*height/2
			}
		} else { // above or below box
			if (Maths.isInLimits(xCenter-width/2, xTarget, xCenter+width/2)) {	// If within box x-limits
				xEdge = xTarget;
			} else {
				xEdge = xCenter + Maths.sign(xTarget-xCenter)*width/2;
			}
			yEdge = Maths.sign(yTarget-yCenter) * (height/2) + yCenter;
		}
		return [xEdge, yEdge];
	}

	// Used for LinkVisual
	getLinkMountPos([xTarget, yTarget]: [number, number]) {
		// See "docs/code/mountPoints.svg" for math explanation 
		const [xCenter, yCenter] = this.getPos();
		const [width, height] = this.getSize();
		const boxSlope = Maths.safeDivision(height, width);
		const targetSlope = Maths.safeDivision(yTarget-yCenter, xTarget-xCenter);
		let xEdge;
		let yEdge; 
		if (Maths.isInLimits(-boxSlope, targetSlope, boxSlope)) {
			const xSign = Maths.sign(xTarget-xCenter); // -1 if target left of box and 1 if target right of box 
			xEdge = xSign * (width/2) + xCenter;
			yEdge = xSign * (width/2) * targetSlope + yCenter;
		} else {
			const ySign = Maths.sign(yTarget-yCenter); // -1 if target above box and 1 if target below box
			xEdge = ySign * Maths.safeDivision(height/2, targetSlope) + xCenter;
			yEdge = ySign * (height/2) + yCenter;
		}
		return [xEdge, yEdge];
	}

	getImage(): Element[] {
		// let textElem = svg_text(0, 39, "stock", "name_element");
		let textElem = SVG.text(0, 39, this.primitive.getAttribute("name"), "name_element");
		textElem.setAttribute("fill", this.color);
		let size = this.getSize();
		let w = size[0];
		let h = size[1];
		return [
			SVG.rect(-w/2,-h/2, w, h,  this.color, defaultFill, "element"),
			SVG.rect(-w/2+2, -h/2+2, w-4, h-4, "none", this.color, "highlight"),
			textElem,
			SVG.icons(defaultStroke, defaultFill, "icons")
		];
	}
}