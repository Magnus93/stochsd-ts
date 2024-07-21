import { DefinitionError } from "../DefinitionError";
import { Engine } from "../Engine";
import { Maths } from "../Maths";
import { SVG } from "../SVG";
import { cos, distance, neswDirection, rotate, sin, translate } from "../transform";
import { hasRandomFunction } from "../utility";
import { Controller } from "./Controller";
import { AnchorPoint } from "./AnchorPoint";
import { AnchorType } from "./AnchorType";
import { BaseConnection } from "./BaseConnection";
import { BaseVisual } from "./BaseVisual";
import { defaultFill, defaultStroke } from "./default";
import { OrthoAnchorPoint } from "./OrthoAnchorPoint";
import { StockVisual } from "./StockVisual";

export class FlowVisual extends BaseConnection {
  middleAnchors: AnchorPoint[] = [] // List of anchors. Not start- and end-anchor. TYPE: [AnchorPoint]
  valveIndex!: number  	// index to indicate what inbetween path valve is placed
  variableSide!: boolean 	// bool to indicate what side of path variable is placed
  startCloud!: SVG.Cloud
  endCloud!: SVG.Cloud
  outerPath!: SVG.WidePath 	// Black path element
  innerPath!: SVG.WidePath 	// White path element
  arrowHeadPath!: SVG.ArrowHead // Head of Arrow element
  flowPathGroup!: SVGGElement // Group element with outer- inner- & arrowHeadPath within.
  valve!: SVGPathElement 
  variable!: SVGGElement 		// variable (only svg group-element with circle and text)
	constructor(public id: string, public type: string, pos0: [number, number], pos1: [number, number]) {
		super(id, type, pos0, pos1);
		this.updateDefinitionError();
		this.namePositions = [[0,40],[31,5],[0,-33],[-31,5]]; 	// Text placement when rotating text
	}

	isAcceptableStartAttach(attachVisual: BaseVisual) {
		return attachVisual instanceof StockVisual
	}	

	isAcceptableEndAttach(attachVisual: BaseVisual) {
		return attachVisual instanceof StockVisual
	}	

	getRadius() {
		return 20;
	}

	getAnchors() {
		let anchors = [this.startAnchor];
		anchors = anchors.concat(this.middleAnchors);
		anchors = anchors.concat([this.endAnchor]);
		return anchors;
	}

	getPreviousAnchor(anchorId: string) { 
		let anchors = this.getAnchors();
		let anchor_ids = anchors.map(anchor => anchor.id);
		let prev_index = anchor_ids.indexOf(anchorId) - 1;
		return prev_index >= 0 ? anchors[prev_index] : null;
	}

	getNextAnchor(anchorId: string) { 
		let anchors = this.getAnchors();
		let anchor_ids = anchors.map(anchor => anchor.id);
		let index = anchor_ids.indexOf(anchorId);
		if (index === -1 && index === anchors.length-1) {
			return null;
		} else {
			return anchors[index+1];
		}
	}

	requestNewAnchorDim(reqValue: number, anchorId: string, dimIndex: number) {
		// reqValue is x or y 
		let anchor = Controller.onePointers[anchorId] as AnchorPoint
		let anchorAttach: StockVisual | undefined
		let newValue = reqValue;
		if (anchor.getAnchorType() === "start") {
			anchorAttach = this._startAttach as StockVisual
		} else if (anchor.getAnchorType() === "end") {
			anchorAttach = this._endAttach as StockVisual
		}
		// if anchor is attached limit movement 
		if (anchorAttach) {
			// stockX or stockY
			let stockDim = anchorAttach.getPos()[dimIndex];
			// stockWidth or stockHeight
			let stockSpanSize = anchorAttach.getSize()[dimIndex];
			newValue = Maths.clampValue(reqValue, stockDim-stockSpanSize/2, stockDim+stockSpanSize/2);
		} else {	
			// dont allow being closer than minDistance units to a neightbour node 
			let minDistance = 10;
			let prevAnchor = this.getPreviousAnchor(anchorId);
			let nextAnchor = this.getNextAnchor(anchorId);

			let requestPos = anchor.getPos();
			requestPos[dimIndex] = reqValue;
			if ((prevAnchor && distance(requestPos, prevAnchor.getPos()) < minDistance) ||
			  	(nextAnchor && distance(requestPos, nextAnchor.getPos()) < minDistance) ) {
				// set old value of anchor 
				newValue = anchor.getPos()[dimIndex];
			} else {
				// set requested value 
				newValue = reqValue;
			}
		}
		
		let pos = anchor.getPos();
		pos[dimIndex] = newValue;
		anchor.setPosition(pos);
		return newValue;
	}

	requestNewAnchorX(x: number, anchorId: string) {
		return this.requestNewAnchorDim(x, anchorId, 0);
	}

	requestNewAnchorY(y: number, anchorId: string) {
		return this.requestNewAnchorDim(y, anchorId, 1);
	}

	requestNewAnchorPos(newPosition: [number, number], anchorId: string) {
		let [x, y] = newPosition;
		let mainAnchor = Controller.onePointers[anchorId];

		let prevAnchor = this.getPreviousAnchor(anchorId);
		let nextAnchor = this.getNextAnchor(anchorId);

		let prevMoveInX = true;
		let nextMoveInX = true;

		if (prevAnchor && this.middleAnchors.length === 0) {
			let prevAnchorPos = prevAnchor.getPos()
			prevMoveInX = Math.abs(prevAnchorPos[0] - x) < Math.abs(prevAnchorPos[1] - y)
			nextMoveInX = !prevMoveInX
		} else if (nextAnchor && this.middleAnchors.length === 0) {
			let nextAnchorPos = nextAnchor.getPos()
			nextMoveInX = Math.abs(nextAnchorPos[0] - x) < Math.abs(nextAnchorPos[1] - y)
			prevMoveInX = !nextMoveInX
		} else {
			// if more than two anchor 
			let anchors = this.getAnchors()
			let [x1, y1] = anchors[0].getPos()
			let [x2, y2] = anchors[1].getPos()
			let flow_start_direction_x = Math.abs(x1 - x2) < Math.abs(y1 - y2);
			let index = anchors.map(anchor => anchor.id).indexOf(anchorId);			
			prevMoveInX = ((index%2) === 1) === flow_start_direction_x;
			nextMoveInX = ! prevMoveInX;
		}

		if (prevAnchor) {
			// Get direction of movement or direction of previous anchor 
			if ( prevMoveInX ) {
				x = this.requestNewAnchorX(x, prevAnchor.id);
			} else {
				y = this.requestNewAnchorY(y, prevAnchor.id);
			}
		}
		if (nextAnchor) {
			if ( nextMoveInX ) {
				x = this.requestNewAnchorX(x, nextAnchor.id);
			} else {
				y = this.requestNewAnchorY(y, nextAnchor.id);
			}
		}
		mainAnchor.setPosition([x,y]);
	}


	syncAnchorToPrimitive(anchorType: AnchorType) {
		// Save middle anchor points to primitive
		super.syncAnchorToPrimitive(anchorType);
		let middlePoints = "";
		for (let i = 0; i < this.middleAnchors.length; i++) {
			let pos = this.middleAnchors[i].getPos();
			let x = pos[0];
			let y = pos[1];
			middlePoints += `${x},${y} `;
		}
		Engine.Primitives.setAttribute(this.primitive!, "MiddlePoints", middlePoints);
	}

	getLinkMountPos([xTarget, yTarget]: [number, number]): [number, number] {
		// See "docs/code/mountPoints.svg" for math explanation 
		const [xCenter, yCenter] = this.getVariablePos();
		const rTarget = distance([xCenter, yCenter], [xTarget, yTarget]);
		const dXTarget = xTarget - xCenter
		const dYTarget = yTarget - yCenter
		const dXEdge = Maths.safeDivision(dXTarget*this.getRadius(), rTarget)
		const dYEdge = Maths.safeDivision(dYTarget*this.getRadius(), rTarget)
		const xEdge = dXEdge + xCenter
		const yEdge = dYEdge + yCenter
		return [xEdge, yEdge]
	}

	moveValve() {
		if (this.variableSide) {
			this.valveIndex = (this.valveIndex+1)%(this.middleAnchors.length+1);
		}
		this.variableSide = !this.variableSide;

		Engine.Primitives.setAttribute(this.primitive!, "ValveIndex", `${this.valveIndex}`);
		Engine.Primitives.setAttribute(this.primitive!, "VariableSide", `${this.variableSide}`);

    Controller.Update.relevant([])
	}

	createMiddleAnchorPoint(x: number, y: number) {
		let index = this.middleAnchors.length;
		let newAnchor = new OrthoAnchorPoint(
			this.id+".point"+index, 
			"dummy_anchor", 
			[x, y], 
			"orthoMiddle", 
			index
		);
		this.middleAnchors.push(newAnchor);
	}

	setStartAttach(newStartAttach?: StockVisual) {
		super.setStartAttach(newStartAttach);
		// needs to update Links a few times to follow along
		for (let i = 0; i < 4; i++) Controller.Update.relevantTwoPointers([]);
	}

	setEndAttach(newEndAttach?: StockVisual) {
		super.setEndAttach(newEndAttach);
		for (let i = 0; i < 4; i++) Controller.Update.relevantTwoPointers([]);
	}

	removeLastMiddleAnchorPoint() {
		// set valveIndex to 0 to avoid valveplacement bug 
		if (this.valveIndex === this.middleAnchors.length) {
			this.valveIndex = this.middleAnchors.length-1;
		}
		let removedAnchor = this.middleAnchors.pop();
		deleteOnePointer(removedAnchor!.id);
	}
	
	parseMiddlePoints(middlePointsString: string): [number, number][] {
		if (middlePointsString == "") {
			return [];
		}
		// example input: "15,17 19,12 "
		
		// example ["15,17", "19,12"]
		let stringPoints = middlePointsString.trim().split(" ");
		
		// example [["15", "17"], ["19", "12"]]
		let stringDimension = stringPoints.map(stringPos => stringPos.split(","));
		
		// example [[15,17], [19,12]]
		let points = stringDimension.map((dim): [number, number] => [parseInt(dim[0]), parseInt(dim[1])]);

		return points;
	}

	loadMiddlePoints() {
		let middlePointsString = Engine.Primitives.getAttribute(this.primitive!, "MiddlePoints");
		if (! middlePointsString) {
			return [];
		}
		let points = this.parseMiddlePoints(middlePointsString);
		for (let point of points) {
			let index = this.middleAnchors.length;
			let newAnchor = new OrthoAnchorPoint(
				this.id+".point"+index, 
				"dummy_anchor", 
				point,
				"orthoMiddle", 
				index
			);
			this.middleAnchors.push(newAnchor);
		}
	}

	getBoundRect() {
		let pos = this.getVariablePos();
		let radius = this.getRadius();
		return {
			"minX": pos[0] - radius, 
			"maxX": pos[0] + radius,
			"minY": pos[1] - radius,
			"maxY": pos[1] + radius
		};
	}

	getValvePos() {
		let points = this.getAnchors().map(anchor => anchor.getPos());
		let valveX = (points[this.valveIndex][0]+points[this.valveIndex+1][0])/2;
		let valveY = (points[this.valveIndex][1]+points[this.valveIndex+1][1])/2;
		return [valveX, valveY];
	}

	getValveRotation() {
		const points = this.getAnchors().map(anchor => anchor.getPos());
		const dir = neswDirection(points[this.valveIndex], points[this.valveIndex+1]);
		let valveRot = 0;
		if (dir == "north" || dir == "south") {
			valveRot = 90;
		}
		return valveRot;
	}

	getVariablePos() {
		const points = this.getAnchors().map(anchor => anchor.getPos());
		const dir = neswDirection(points[this.valveIndex], points[this.valveIndex+1]);
		let variableOffset = [0, 0];
		if (dir == "north" || dir == "south") {
			if (this.variableSide) {
				variableOffset = [this.getRadius(), 0];
			} else {
				variableOffset = [-this.getRadius(), 0];
			}
		} else {
			if (this.variableSide) {
				variableOffset = [0, -this.getRadius()];
			} else {
				variableOffset = [0, this.getRadius()];
			}
		} 
		let [valveX, valveY] = this.getValvePos();
		return [valveX+variableOffset[0], valveY+variableOffset[1]];
	}

	setColor(color: string) {
		this.color = color;
		Engine.Primitives.setAttribute(this.primitive!, "Color", this.color);
		this.startCloud.setAttribute("stroke", color);
		this.endCloud.setAttribute("stroke", color);
		this.outerPath.setAttribute("stroke", color);
		this.arrowHeadPath.setAttribute("stroke", color);
		this.valve.setAttribute("stroke", color);
		this.variable.getElementsByClassName("element")[0].setAttribute("stroke", color);
		this.variable.getElementsByClassName("highlight")[0].setAttribute("fill", color);
		this.nameElement?.setAttribute("fill", color);
		this.getAnchors().map(anchor => anchor.setColor(color));
	}

	makeGraphics() {
		this.startCloud = SVG.cloud(this.color, defaultFill, {"class": "element"});
		this.endCloud = SVG.cloud(this.color, defaultFill, {"class": "element"});
		this.outerPath = SVG.widePath(5, this.color, {"class": "element"});
		this.innerPath = SVG.widePath(3, "white"); // Must have white ohterwise path is black
		this.arrowHeadPath = SVG.arrowHead(this.color, defaultFill, {"class": "element"});
		this.flowPathGroup = SVG.group([this.startCloud, this.endCloud, this.outerPath, this.innerPath, this.arrowHeadPath]);
		this.valve = SVG.path("M8,8 -8,-8 8,-8 -8,8 Z", this.color, defaultFill, "element");
		this.nameElement = SVG.text(0, -this.getRadius(), "vairable", "name_element");
		this.icons = SVG.icons(defaultStroke, defaultFill, "icons");
		this.variable = SVG.group(
			[SVG.circle(0, 0, this.getRadius(), this.color, "white", "element"), 
			SVG.circle(0, 0, this.getRadius()-2, "none", this.color, "highlight"),
			this.icons,	
			this.nameElement]
		);
		this.icons.setColor("white");
		this.middleAnchors = [];
		this.valveIndex = 0;
		this.variableSide = false;
		
		$(this.nameElement).dblclick((event) => {	
			this.nameDoubleClick();
		});
		
		this.group = SVG.group([this.flowPathGroup, this.valve, this.variable]);
		this.group.setAttribute("node_id",this.id);

		$(this.group).on("dblclick", () => {
			this.doubleClick();
		});
		this.updateGraphics();
	}
	
	getDirection(): [number, number] {
		// This function is used to determine which way the arrowHead should aim 
		let points = this.getAnchors().map(anchor => anchor.getPos());
		let len = points.length;
		let p1 = points[len-1];
		let p2 = points[len-2];
		return [p2[0]-p1[0], p2[1]-p1[1]];
	}

	shortenLastPoint(shortenAmount: number) {
		let points = this.getAnchors().map(anchor => anchor.getPos());
		let last = points[points.length-1];
		let secondLast = points[points.length-2];
		let sine = sin(last, secondLast);
		let cosine = cos(last, secondLast);
		let newLast = rotate([shortenAmount, 0], sine, cosine);
		newLast = translate(newLast, last);
		points[points.length-1] = newLast;
		return points;
	}

	update() {
		// This function is similar to TwoPointer::update but it takes attachments into account
		
		// Get start position from attach
		// _start_attach is null if we are not attached to anything
		
		let points = this.getAnchors().map(anchor => anchor.getPos());
		let connectionStartPos = points[1];
		let connectionEndPos = points[points.length-2]; 

    const startAttach = this.getStartAttach()
		if (startAttach && this.startAnchor != null) {
			let oldPos = this.startAnchor.getPos();
			let newPos = (startAttach as StockVisual).getFlowMountPos(connectionStartPos);
			if (oldPos[0] != newPos[0] || oldPos[1] != newPos[1]) {
				this.requestNewAnchorPos(newPos, this.startAnchor.id);
			}
		}
    const endAttach = this.getEndAttach()
		if (endAttach && this.endAnchor != null) {	
			let oldPos = this.endAnchor.getPos();
			let newPos = (endAttach as StockVisual).getFlowMountPos(connectionEndPos);
			if (oldPos[0] != newPos[0] || oldPos[1] != newPos[1]) {
				this.requestNewAnchorPos(newPos, this.endAnchor.id);
			}
		}
		super.update();
		// update anchors 
		this.getAnchors().map( anchor => anchor.updatePosition() );

		if(this.primitive && this.icons) {
			const hasDefError = DefinitionError.has(this.primitive);
			if (hasDefError) {
				this.icons.set("questionmark", "visible");
			} else {
				this.icons.set("questionmark", "hidden");
			}
			this.icons.set("dice", !hasDefError && hasRandomFunction(Engine.Primitives.getDefinition(this.primitive) ?? "") ? "visible" : "hidden");
		}
	}
	
	updateGraphics() {
		let points = this.getAnchors().map(anchor => anchor.getPos());
		if (this.getStartAttach() == null) {
			this.startCloud.setVisibility(true);
			this.startCloud.setPosition(points[0], points[1]);
		} else {
			this.startCloud.setVisibility(false);
		}
		if (this.getEndAttach() == null) {
			this.endCloud.setVisibility(true);
			this.endCloud.setPosition(points[points.length-1], points[points.length-2]);
		} else {
			this.endCloud.setVisibility(false);
		}
		this.outerPath.setPoints(this.shortenLastPoint(12));
		this.innerPath.setPoints(this.shortenLastPoint(8));
		this.arrowHeadPath.setPosition(points[points.length-1], this.getDirection());

		let [valveX, valveY] = this.getValvePos();
		let valveRot = this.getValveRotation();
		let [varX, varY] = this.getVariablePos();
		SVG.transform(this.valve, valveX, valveY, valveRot, 1);
		SVG.translate(this.variable, varX, varY);
		// Update
		this.startCloud.update();
		this.endCloud.update();
		this.outerPath.update();
		this.innerPath.update();
		this.arrowHeadPath.update();
	}
	
	unselect() {
		super.unselect();
		this.variable.getElementsByClassName("highlight")[0].setAttribute("visibility", "hidden");
		this.icons?.setColor(this.color);
	}

	select() {
		super.select();
		this.variable.getElementsByClassName("highlight")[0].setAttribute("visibility", "visible");
		this.icons?.setColor("white");
	}
	
	doubleClick() {
		// openPrimitiveDialog(this.id) // TODO add primitiveDialog
	}
}

/* replaces delete_connection */
function deleteConnection(key: string) {
	if (!(key in Controller.twoPointers)) {
		return;
	}
	let startAnchor = Controller.twoPointers[key].startAnchor;
	let endAnchor = Controller.twoPointers[key].endAnchor;
	let auxiliary = (Controller.twoPointers[key] as any).auxiliary; // TODO should this be removed?
	Controller.twoPointers[key].group?.remove();
	delete Controller.twoPointers[key];
	
	// Must be done last otherwise the anchors will respawn	
	deleteOnePointer(startAnchor.id);
	deleteOnePointer(endAnchor.id);
	deleteOnePointer(auxiliary.id);	
}
/* replaces delete_object */
function deleteOnePointer(nodeId: string) {
	let visualsToDelete = Controller.onePointers[nodeId];
	
	// Delete all references to the object in the connections
	if ("parent_id" in visualsToDelete) {
		deleteConnection(visualsToDelete.parent_id as string);
	}
	
	for(let i in visualsToDelete.selectorElements) {
		visualsToDelete.selectorElements[i].remove();
	}
	for(let key in visualsToDelete.elements) {
		visualsToDelete.elements[key].remove();
	}
	visualsToDelete.group?.remove();
	delete Controller.onePointers[nodeId];
}