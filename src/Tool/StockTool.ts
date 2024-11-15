import { Engine } from "../Engine";
import { VisualController } from "../Visual/Controller";
import { OnePointCreateTool } from "./OnePointCreateTool";

export class StockTool extends OnePointCreateTool {
	static create(x: number, y: number) {
		// The right place to  create primitives and elements is in the tools-layers
		const name = VisualController.Name.findFree("Stock")
		const stock = Engine.model.Stock({ name })
		stock._node.setAttribute("x", x)
		stock._node.setAttribute("y", y)
	}
}