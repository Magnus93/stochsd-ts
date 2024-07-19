import { AnchorType } from "./AnchorType"
import { DisplayDialog } from "../components/Dialog/DisplayDialog"
import { Engine, Flow, Link } from "../Engine"
import { VisualController } from "./Controller"
import { BaseVisual } from "./BaseVisual"
import { AnchorPoint } from "./AnchorPoint"

export class TwoPointer extends BaseVisual {
  startAnchor!: AnchorPoint
  endAnchor!: AnchorPoint
  dialog!: DisplayDialog;
	constructor(public id: string, public type: string, pos0: [number, number], pos1: [number, number]) {
		super(id, type, pos0);
		this.id = id;
		this.type = type;
		this.selected = false;
		VisualController.twoPointers[this.id] = this;

		// anchors must exist before make graphics 
		this.createInitialAnchors(pos0, pos1);

		this.makeGraphics();
		$(this.group!).on("mousedown", function(event) {
			let node_id = this.getAttribute("node_id");
			// primitive_mousedown(node_id, event); // TODO add this function
		});
		
		// this is done so anchor is ontop 
		this.startAnchor.reloadImage();
		this.endAnchor.reloadImage();
	}

	createInitialAnchors(pos0: [number, number], pos1: [number, number]) {
		this.startAnchor = new AnchorPoint(this.id+".start_anchor", "dummy_anchor", pos0, "start")
		this.endAnchor = new AnchorPoint(this.id+".end_anchor", "dummy_anchor", pos1, "end")
	}

	getAnchors() {
		return [this.startAnchor, this.endAnchor];
	}

	getBoundRect() {
		return {
			"minX": this.getMinX(),
			"maxX": this.getMinX() + this.getWidth(),
			"minY": this.getMinY(),
			"maxY": this.getMinY() + this.getHeight()
		};
	}

	setColor(color: string) {
		super.setColor(color);
		this.startAnchor.setColor(color);
		this.endAnchor.setColor(color);
	}
	
	get startX() { return this.startAnchor.getPos()[0]; }
	get startY() { return this.startAnchor.getPos()[1]; }
	get endX() { return this.endAnchor.getPos()[0]; }
	get endY() { return this.endAnchor.getPos()[1]; }

	getPos() { return [(this.startX + this.endX)/2,(this.startY + this.endY)/2]; }
	getMinX() { return Math.min(this.startX, this.endX); }
	getMinY() { return Math.min(this.startY, this.endY); }
	getWidth() { return Math.abs(this.startX - this.endX); }
	getHeight() { return Math.abs(this.startY - this.endY); }

	unselect() {
		this.selected = false;
		for(let anchor of this.getAnchors()) {
			anchor.setVisible(false);
		}
	}
	select() {
		this.selected = true;
		for(let anchor of this.getAnchors()) {
			anchor.select();
			anchor.setVisible(true);
		}
	}
	
	update() {
		this.updateGraphics();
	}
	makeGraphics() {
		
	}
	updateGraphics() {
		
	}
	syncAnchorToPrimitive(anchorType: AnchorType) {
		// This function should sync anchor position to primitive 
		let primitive = Engine.findById(this.id) as Flow | Link
		if (!primitive) return;
		switch(anchorType) {
			case "start":
				Engine.setStartPosition(primitive, this.startAnchor.getPos())
			break;
			case "end":
				Engine.setEndPosition(primitive, this.endAnchor.getPos())
			break;
		}
	}
}