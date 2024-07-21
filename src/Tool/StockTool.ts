import { Engine } from "../Engine";
import { Visual } from "../Visual";
import { OnePointCreateTool } from "./OnePointCreateTool";

export class StockTool extends OnePointCreateTool {	
	static create(x: number, y: number) {
		// The right place to  create primitives and elements is in the tools-layers
		const name = Visual.Controller.Name.findFree("Stock")
    const stock = Engine.model.Stock({ name })
		// const stock = Engine.createStock() // TODO ?
    stock._node.setAttribute("x", x)
    stock._node.setAttribute("y", y)
	}
}