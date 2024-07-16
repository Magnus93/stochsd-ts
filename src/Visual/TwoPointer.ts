import { anchorTypeEnum } from "../anchorTypeEnum";
import { DisplayDialog } from "../components/Dialog/DisplayDialog";
import { VisualController } from "../VisualController";
import { BaseVisual } from "./BaseVisual";

export class TwoPointer extends BaseVisual {
  start_anchor: any // TODO OnePointer
  end_anchor: any // TODO OnePointer
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
		this.start_anchor.reloadImage();
		this.end_anchor.reloadImage();
	}

	createInitialAnchors(pos0: [number, number], pos1: [number, number]) {
		// this.start_anchor = new AnchorPoint(this.id+".start_anchor", "dummy_anchor", pos0, anchorTypeEnum.start); // TODO add AnchorPoint
		// this.end_anchor = new AnchorPoint(this.id+".end_anchor", "dummy_anchor", pos1, anchorTypeEnum.end); // TODO add AnchorPoint
	}

	getAnchors() {
		return [this.start_anchor, this.end_anchor];
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
		this.start_anchor.setColor(color);
		this.end_anchor.setColor(color);
	}
	
	get startX() { return this.start_anchor.getPos()[0]; }
	get startY() { return this.start_anchor.getPos()[1]; }
	get endX() { return this.end_anchor.getPos()[0]; }
	get endY() { return this.end_anchor.getPos()[1]; }

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
	syncAnchorToPrimitive(anchorType: typeof anchorTypeEnum[keyof typeof anchorTypeEnum]) {
		// This function should sync anchor position to primitive 
		let primitive: any = null // findID(this.id); // TODO fix
		if (!primitive) return;
		switch(anchorType) {
			case anchorTypeEnum.start:
				// setSourcePosition(primitive, this.start_anchor.getPos()); // TODO functions from old insightmaker API
			break;
			case anchorTypeEnum.end:
				// setTargetPosition(primitive, this.end_anchor.getPos()); // TODO functions from old insightmaker API
			break;
		}
	}
}