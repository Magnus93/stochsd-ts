import { Maths } from "../Maths";
import { SVG } from "../SVG";
import { defaultFill, defaultStroke } from "./default";
import { VariableVisual } from "./VariableVisual";

export class ConstantVisual extends VariableVisual {
	constructor(public id: string, public type: string, public position: [number, number], extras?: any) {
		super(id, type, position, extras);
		this.namePositions = [[0, 36],[25, 5],[0, -29],[-25, 5]];
	}

	getImage() {
		let r = this.getRadius();
		let rs = r - 3; // Selector radius 
		return [
			SVG.path(`M0,${r} ${r},0 0,-${r} -${r},0Z`, this.color, defaultFill, "element"),
			SVG.text(0, 0, this.primitive.getAttribute("name"), "name_element", {"fill": this.color}),
			SVG.path(`M0,${rs} ${rs},0 0,-${rs} -${rs},0Z`, "none", this.color, "highlight"),
			SVG.icons(defaultStroke, defaultFill, "icons")
		];
	}

	getRadius() {
		return 22;
	}

	getLinkMountPos([xTarget, yTarget]: [number, number]) {
		const [xCenter, yCenter] = this.getPos();
		const targetSlope = Maths.safeDivision(yCenter-yTarget, xCenter-xTarget);
		
		// "k" in the formula: y = kx + m
		const edgeSlope = -Maths.sign(targetSlope);

		// Where the line intercepts the x-axis ("m" in the formula: y = kx + m)
		const edgeIntercept = this.getRadius()*Maths.sign(yTarget - yCenter);
		
		// Relative coodinates relative center of ConstantVisual
		const xEdgeRel = Maths.safeDivision(edgeIntercept, targetSlope-edgeSlope);
		const yEdgeRel = edgeSlope*xEdgeRel + edgeIntercept;
		
		const xEdge = xEdgeRel + xCenter;
		const yEdge = yEdgeRel + yCenter;
		return [xEdge, yEdge];
	}
}