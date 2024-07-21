import { SVG } from "../SVG";
import { Controller } from "./Controller";
import { AnchorType } from "./AnchorType";
import { BaseConnection } from "./BaseConnection";
import { OnePointer } from "./OnePointer";

export class AnchorPoint extends OnePointer {
	isSquare: boolean
	constructor(public id: string, public type: string, public position: [number, number], public anchorType: AnchorType) {
		super(id, type, position);
		this.anchorType = anchorType;
		this.isSquare = false;
	}
	isAttached() {
		let parent = Controller.getParent(this);
		if (!(parent instanceof BaseConnection)) {
			return;
		}
		switch (this.anchorType) {
			case "start":
				if (parent.getStartAttach()) {
					return true;
				} else {
					return false;
				}
				break;
			case "end":
				if (parent.getEndAttach()) {
					return true;
				} else {
					return false;
				}
				break;
			default:
				// It's not a start or end anchor so it cannot be attached
				return false;
		}
	}
	setAnchorType(anchorType: AnchorType) {
		this.anchorType = anchorType
	}
	getAnchorType() {
		return this.anchorType
	}
	setVisible(value: boolean) {
		if (value) {
			for (let element of this.elements) {
				// Show all elements except for selectors
				if (element.getAttribute("class") != "highlight") {
					element.setAttribute("visibility", "visible")
				}
			}
		}
		else {
			// Hide elements
			for (let element of this.elements) {
				element.setAttribute("visibility", "hidden")
			}
		}
	}
	updatePosition() {
		this.update();
		let parent = Controller.getParent(this)
		if (parent instanceof BaseConnection) {
			parent.syncAnchorToPrimitive(this.anchorType)
		}
	}
	getImage() {
		if (this.isSquare) {
			return [
				SVG.rect(-4, -4, 8, 8, this.color, "white", "element"),
				SVG.rect(-4, -4, 8, 8, "none", this.color, "highlight")
			];
		} else {
			return [
				SVG.circle(0, 0, 5, this.color, "white", "element"),
				SVG.circle(0, 0, 5, "none", this.color, "highlight")
			];
		}

	}
	makeSquare() {
		this.isSquare = true;
		this.reloadImage();
	}
	reloadImage() {
		this.clearImage();
		this.loadImage();
	}
	afterMove(diffX: number, diffY: number) {
		// This is an attempt to make bezier points move with the anchors points but id does not work well with undo
		// commented out until fixed
		let parentId = Controller.getParentId(this.id);
		let parent = Controller.get(parentId) as BaseConnection

		// if (parent instanceof LinkVisual) { // TODO add LinkVisual
		// 	switch (this.anchorType) {
		// 		case "start":
		// 			{
		// 				let oldPos = parent.b1_anchor.getPos();
		// 				parent.b1_anchor.setPosition([oldPos[0] + diffX, oldPos[1] + diffY]);
		// 			}
		// 			break;
		// 		case "end":
		// 			{
		// 				let oldPos = parent.b2_anchor.getPos();
		// 				parent.b2_anchor.setPosition([oldPos[0] + diffX, oldPos[1] + diffY]);
		// 			}
		// 			break;
		// 	}
		// }
	}
}