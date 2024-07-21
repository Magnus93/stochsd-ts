import { Engine } from "../Engine";
import { Maths } from "../Maths";
import { SVG } from "../SVG";
import { distance } from "../transform";
import { defaultFill, defaultStroke } from "./default";
import { ValuedOnePointer } from "./ValuedOnePointer";


export class VariableVisual extends ValuedOnePointer {
	constructor(public id: string, public type: string, public position: [number, number], extras?: any) {
		super(id, type, position, extras);
		this.updateDefinitionError();
		this.namePositions = [[0, 34],[23, 5],[0, -25],[-23, 5]];
	}

	getRadius() {
		return 20;
	}

	getBoundRect() {
	let pos = this.getPos();
	let radius = this.getRadius();
		return {
			"minX": pos[0] - radius,
			"maxX": pos[0] + radius,
			"minY": pos[1] - radius,
			"maxY": pos[1] + radius
		};
	}

	getImage (): Element[] {
		return [
			SVG.circle(0,0,this.getRadius(), this.color, defaultFill, "element"),
			SVG.text(0,0, Engine.Primitives.getAttribute(this.primitive!, "name"), "name_element", {"fill": this.color}),
			SVG.circle(0,0,this.getRadius()-2, "none", this.color, "highlight"),
			SVG.icons(defaultStroke, defaultFill, "icons")
		];
	}

	getLinkMountPos([xTarget, yTarget]: [number, number]): [number, number] {
		// See "docs/code/mountPoints.svg" for math explanation 
		const [xCenter, yCenter] = this.getPos();
		const rTarget = distance([xCenter, yCenter], [xTarget, yTarget]);
		const dXTarget = xTarget - xCenter;
		const dYTarget = yTarget - yCenter;
		const dXEdge = Maths.safeDivision(dXTarget*this.getRadius(), rTarget);
		const dYEdge = Maths.safeDivision(dYTarget*this.getRadius(), rTarget);
		const xEdge = dXEdge + xCenter; 
		const yEdge = dYEdge + yCenter;
		return [xEdge, yEdge]; 
	}
}