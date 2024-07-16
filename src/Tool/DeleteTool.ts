import { Dialog } from "../components";
import { VisualController } from "../VisualController";
import { BaseTool } from "./BaseTool";
import { Box } from "./Box";

export class DeleteTool extends BaseTool {
	static enterTool() {
		const selectedIds = Object.keys(VisualController.getSelectedRootVisuals());
		if (selectedIds.length == 0) {
			Dialog.xAlert("You must select at least one primitive to delete");
			Box.setTool("mouse");
			return;
		}
    VisualController.deleteSelected();
		// History.storeUndoState(); // TODO add History
		// InfoBar.update(); // TODO add InfoBar
		Box.setTool("mouse");
	}
}