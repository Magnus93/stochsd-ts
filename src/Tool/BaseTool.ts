export class BaseTool {
	static middleDownX = 0;
	static middleDownY = 0;
	static downScrollPosX = 0;
	static downScrollPosY = 0;

	static init() {
		// Overwrite if needed
	}

	static leftMouseDown(x: number, y: number) {
		// Is triggered when mouse goes down for this tool
	}
	static mouseMove(x: number, y: number, shiftKey: boolean) {
		// Is triggered when mouse moves
	}
	static mouseMoveSingleAnchor(x: number, y: number, shiftKey: boolean, nodeId: string) { }
	static mouseUpSingleAnchor(x: number, y: number, shiftKey: boolean, nodeId: string) { }
	static leftMouseUp(x: number, y: number, shiftKey: boolean) {
		// Is triggered when mouse goes up for this tool
	}
	static rightMouseDown(x: number, y: number) {
		// Is triggered when right mouse is clicked for this tool 
	}
	/** mouseButton from event.which */
	static enterTool(mouseButton?: number) {
		// Is triggered when the tool is selected
	}
	static leaveTool() {
		// Is triggered when the tool is deselected
	}
}