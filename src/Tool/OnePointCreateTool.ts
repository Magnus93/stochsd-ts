import { BaseTool } from "./BaseTool"
import { mouseWhichEnum } from "../Mouse"
import { Visual } from "../Visual"
import { Box } from "./Box"

export class OnePointCreateTool extends BaseTool {
  static rightClickMode = false
	
	static enterTool(whichMouseButton: number) {
		this.rightClickMode = (whichMouseButton === mouseWhichEnum.right)
	}
	static create(x: number, y: number) {
		// This function should be overwritten
	}
	static leftMouseDown(x: number, y: number) {
		Visual.Controller.Selection.unselectAll()
		this.create(x, y)
    Visual.Controller.Update.relevant([])
		// InfoBar.update() // TODO
	}
	static leftMouseUp(x: number, y: number) {
		if (! this.rightClickMode) {
			Box.setTool("mouse")
		}
	}
	static rightMouseDown(x: number, y: number) {
		Visual.Controller.Selection.unselectAll()
		Box.setTool("mouse")
		// InfoBar.update() // TODO
	}
}