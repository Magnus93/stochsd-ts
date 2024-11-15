import { BaseTool } from "../BaseTool"
import { Mouse } from "../../Mouse"
import { do_global_log } from "../../debug"
import { RectSelector } from "./RectSelector"
import { VisualController } from "../../Visual/Controller"
import { Box } from "../Box"
import { BaseConnection } from "../../Visual/BaseConnection"

export class MouseTool extends BaseTool {
	static init() {
		RectSelector.init();
	}

	static leftMouseDown(x: number, y: number) {
		Mouse.downPosition = { x, y }
		do_global_log("last_click_object_clicked " + Mouse.lastClickObjectClicked);
		if (!Mouse.lastClickObjectClicked) {
			RectSelector.start();
		}

		let selectedAnchor = VisualController.getOnlySelectedAnchorId();
		// Only one anchor is selected AND that that anchor has attaching capabilities 
		const parent = selectedAnchor && VisualController.twoPointers[selectedAnchor.parent_id]
		if (selectedAnchor && parent instanceof BaseConnection) {
			// Detach anchor 
			// switch(VisualController.onePointers[selectedAnchor.child_id].getAnchorType()) { // TODO 
			// 	case "start":
			// 		parent.setStartAttach(undefined);
			// 	break;
			// 	case "end":
			// 		parent.setEndAttach(undefined);
			// 	break;
			// }
		}
		// Reset it for use next time
		Mouse.lastClickObjectClicked = false;
	}
	static mouseMove(x: number, y: number, shiftKey: boolean) {
		const diffX = x - Mouse.downPosition.x;
		const diffY = y - Mouse.downPosition.y;
		Mouse.downPosition.x = x;
		Mouse.downPosition.y = y;

		if (Mouse.emptyClickDown) {
			RectSelector.move();
			return;
		}
		// We only come here if some object is being dragged
		// Otherwise we will trigger empty_click_down
		let only_selected_anchor = VisualController.getOnlySelectedAnchorId();
		let only_selected_link = VisualController.getOnlyLinkSelected();
		if (only_selected_anchor) {
			// Use equivalent tool type
			// 	RectangleVisual => RectangleTool
			// 	LinkVisual => LinkTool
			let parent = VisualController.twoPointers[only_selected_anchor["parent_id"] ?? ""];
			let tool = Box.tools[parent.type];
			tool.mouseMoveSingleAnchor(x, y, shiftKey, only_selected_anchor["child_id"]);
			parent.update();
		} else if (only_selected_link) {
			// special exception for links of links is being dragged directly 
			/*
			LinkTool.mouseRelativeMoveSingleAnchor(diffX, diffY, shiftKey, only_selected_link["parent_id"] ?? ""+".b1_anchor"); // TODO add LinkTool
			LinkTool.mouseRelativeMoveSingleAnchor(diffX, diffY, shiftKey, only_selected_link["parent_id"] ?? ""+".b2_anchor"); // TODO add LinkTool
			*/
			let parent = VisualController.twoPointers[only_selected_link["parent_id"] ?? ""];
			parent.update();
		} else {
			let move_array = VisualController.getSelected();
			this.defaultRelativeMove(move_array, diffX, diffY);
		}
	}
	static defaultRelativeMove(move_objects: Record<string, any>, diffX: number, diffY: number) { // TODO fix type
		let objectMoved = false;
		for (let key in move_objects) {
			if (move_objects[key].draggable == undefined) {
				continue;
			}
			if (move_objects[key].draggable == false) {
				do_global_log("skipping because of no draggable");
				continue;
			}

			objectMoved = true;
			// This code is not very optimised. If we want to optimise it we should just find the objects that needs to be updated recursivly
			VisualController.relativeMove(key, diffX, diffY);
		}
		if (objectMoved) {
			// TwoPointer objects depent on OnePointer object (e.g. AnchorPoint, Stock, Auxiliary etc.)
			// Therefore they must be updated seprately 
			let ids = [];
			for (let key in move_objects) {
				ids.push(move_objects[key].id);
			}
			VisualController.Update.relevant(ids);
		}
	}
	static leftMouseUp(x: number, y: number) {
		// Check if we selected only 1 anchor element and in that case detach it;
		let selectedAnchor = VisualController.getOnlySelectedAnchorId();
		if (selectedAnchor) {
			const parent = VisualController.twoPointers[selectedAnchor.parent_id]
			if (parent instanceof BaseConnection) {
				let tool = Box.tools[parent.getType()];
				tool.mouseUpSingleAnchor(x, y, false, selectedAnchor.child_id);
			}
		}

		if (Mouse.emptyClickDown) {
			RectSelector.stop();
			Mouse.emptyClickDown = false;
		}

	}
	static rightMouseDown(x: number, y: number) {
		let only_selected_anchor = VisualController.getOnlySelectedAnchorId();
		// if (
		// 	only_selected_anchor &&
		// 	VisualController.twoPointers[only_selected_anchor["parent_id"]].getType() === "flow" &&
		// 	VisualController.onePointers[only_selected_anchor["child_id"]].getAnchorType() === "end" // TODO fix getAnchorType
		// ) {
		// 		FlowTool.rightMouseDown(x, y); // TODO add FlowTool
		// }
	}
}