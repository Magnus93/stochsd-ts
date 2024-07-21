import { Dialog } from "../components";
import { Visual } from "../Visual";
import { BaseTool } from "./BaseTool";
import { Box } from "./Box";

export class DeleteTool extends BaseTool {
	static enterTool() {
		const selectedIds = Object.keys(Visual.Controller.getSelectedRootVisuals());
		if (selectedIds.length == 0) {
			Dialog.xAlert("You must select at least one primitive to delete");
			Box.setTool("mouse");
			return;
		}
    Visual.Controller.deleteSelected();
		// History.storeUndoState(); // TODO add History
		// InfoBar.update(); // TODO add InfoBar
		Box.setTool("mouse");
	}
}