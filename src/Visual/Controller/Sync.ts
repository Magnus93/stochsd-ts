import { Engine, Flow, Link, Primitive, Stock } from "../../Engine";
import { ConstantVisual } from "../ConstantVisual";
import { ConverterVisual } from "../ConverterVisual";
import { EllipseVisual } from "../EllipseVisual";
import { FlowVisual } from "../FlowVisual";
import { LineVisual } from "../LineVisual";
import { LinkVisual } from "../LinkVIsual";
import { NumberboxVisual } from "../NumberboxVisual";
import { RectangleVisual } from "../RectangleVisual";
import { StockVisual } from "../StockVisual";
import { TextAreaVisual } from "../TextAreaVisual";
import { VariableVisual } from "../VariableVisual";
import { get } from "./get";
import { Name } from "./Name";
import { Selection } from "./Selection";
import { Update } from "./Update";


export namespace Sync {
	// This function is important. It takes all the relevant primitives from the engine
	// And make visual objects from them
	// This is executed after loading a file or loading a whole new state such as after undo
	/* replaces syncAllVisuals */
	export function allVisuals() {
		/* replaces saveblePrimitiveTypes */
		const savablePrimitiveTypes = ["TextArea", "Rectangle", "Ellipse", "Line", "Setting", "Stock", "Variable", "Converter", "Ghost", "Flow", "Link", "Text", "Numberbox", "Table",/*"Diagram",*/"TimePlot", "ComparePlot", "XyPlot", "HistoPlot"]
		for (let type of savablePrimitiveTypes) {
			let primitives = Engine.model.find((p: Primitive) => Engine.Primitives.getNodeName(p) == type);
			for (let p of primitives) {
				try {
					singleVisual(p)
				} catch (exception) {
					// removePrimitive(p) // TODO add back
					alert(`Error while loading corrupted primitive of type ${type}. Removing corrupted primitive to avoid propagated errors.`)
					//~ alert("Error while loading corrupted primitive of type "+type+". Removing corrupted primitive to avoid propagated errors. \n\nError happened at: "+exception.stack);
					throw exception;
				}
			}
		}
		Update.all()
		Selection.unselectAll()
	}

	// Take a primitive from the engine(tprimitve) and makes a visual object from it
	/* replaces syncVisual */
	export function singleVisual(primitive: Primitive) { // TODO add
		let visual = get(primitive.id);
		if (visual) {
			return false;
		}

		// addMissingPrimitiveAttributes(tprimitive) // TODO add this function

		// TODO fix rest of function
		let nodeType = Engine.Primitives.getNodeName(primitive)
		switch (nodeType) {
			case "Numberbox":
				{
					let position = Engine.Primitives.getCenterPosition(primitive);
					let visualObject = new NumberboxVisual(primitive.id, "numberbox", position);
					visualObject.setColor(Engine.Primitives.getAttribute(primitive, "Color"));
					visualObject.render();
				}
				break;
			case "Table":
			case "XyPlot":
			case "HistoPlot": // TODO add Plots
				/* {
					dimClass = null;
					switch(nodeType) {
						case "Table":
							dimClass = TableVisual;
						break;
						case "XyPlot":
							dimClass = XyPlotVisual;
						break;
						case "HistoPlot":
							dimClass = HistoPlotVisual;
						break;
					}
					let source_pos = getSourcePosition(primitive);
					let target_pos = getTargetPosition(primitive);
					
					let connection = new dimClass(primitive.id, nodeType.toLowerCase(), source_pos, target_pos);
					
					connection.setColor(primitive.getAttribute("Color"));
					
					// Insert correct primtives
					let primitivesString = primitive.getAttribute("Primitives");
					if (primitivesString !== "") {
						let idsToDisplay = primitivesString.split(",");
						connection.dialog.setIdsToDisplay(idsToDisplay);
					}
		
					connection.update();
					connection.render();
				} */
				break;
			case "Diagram":
			case "TimePlot":
			case "ComparePlot":	// TODO add Plots
				/* {
					dimClass = null;
					switch(nodeType) {
						case "Diagram":
						case "TimePlot":
							dimClass = TimePlotVisual;
						break;
						case "ComparePlot":
							dimClass = ComparePlotVisual;
						break;
					}
					let source_pos = getSourcePosition(primitive);
					let target_pos = getTargetPosition(primitive);
					
					let connection = new dimClass(primitive.id, nodeType.toLowerCase(), source_pos, target_pos);
					
					connection.setColor(primitive.getAttribute("Color"));
					
					// Insert correct primtives
					let primitivesString = primitive.getAttribute("Primitives");
					let idsToDisplay = primitivesString.split(",");
					let sidesString = primitive.getAttribute("Sides");
					if (primitivesString) {
						if (sidesString) {
							connection.dialog.setIdsToDisplay(idsToDisplay, sidesString.split(","));
						} else {
							connection.dialog.setIdsToDisplay(idsToDisplay);
						}
					}
					
					connection.update();
					connection.render();
				} */
				break;
			case "Line":
			case "Rectangle":
			case "Ellipse":
				{
					let dimClass = null;
					switch (nodeType) {
						case "Line":
							dimClass = LineVisual;
							break;
						case "Rectangle":
							dimClass = RectangleVisual;
							break;
						case "Ellipse":
							dimClass = EllipseVisual;
							break;
					}
					let sourcePosition = Engine.Primitives.getStartPosition(primitive as any) // TODO add Primitives somehow
					let targetPosition = Engine.Primitives.getEndPosition(primitive as any) // TODO add Primitives somehow

					let connection = new dimClass(primitive.id, nodeType.toLowerCase(), sourcePosition, targetPosition);

					connection.setColor(Engine.Primitives.getAttribute(primitive, "Color"));

					connection.update();
				}
				break;
			case "TextArea":
				{
					let source_pos = Engine.Primitives.getStartPosition(primitive as any) // TODO fix
					let target_pos = Engine.Primitives.getEndPosition(primitive as any) // TODO fix

					let connection = new TextAreaVisual(primitive.id, "text", source_pos, target_pos);

					connection.setColor(Engine.Primitives.getAttribute(primitive, "Color"));

					connection.update();
				}
				break;
			case "Stock":
				{
					let position = Engine.Primitives.getCenterPosition(primitive);
					let visual = new StockVisual(primitive.id, "stock", position)
					Name.set(primitive.id, Engine.Primitives.getAttribute(primitive, "name"))

					visual.setColor(Engine.Primitives.getAttribute(primitive, "Color"))

					visual.namePositionIndex = Number(Engine.Primitives.getAttribute(primitive, "RotateName"))
					Name.updatePosition(primitive.id)
				}
				break;
			case "Converter":
				{
					let position = Engine.Primitives.getCenterPosition(primitive)
					let visualObject = new ConverterVisual(primitive.id, "converter", position)
					Name.set(primitive.id, Engine.Primitives.getAttribute(primitive, "name"))

					visualObject.setColor(Engine.Primitives.getAttribute(primitive, "Color"))

					visualObject.namePositionIndex = Number(Engine.Primitives.getAttribute(primitive, "RotateName"))
					Name.updatePosition(primitive.id)
				}
				break;
			case "Ghost":
				{
					let sourcePrimitive = Engine.Primitives.findById(Engine.Primitives.getAttribute(primitive, "Source"))
					let sourceType = Engine.Primitives.getNodeName(sourcePrimitive)
					//~ do_global_log("id is "+tprimitive.id);
					let position = Engine.Primitives.getCenterPosition(primitive);
					let visual = null;
					switch (sourceType) {
						case "Converter":
							visual = new ConverterVisual(primitive.id, "converter", position, { isGhost: true })
							break;
						case "Variable":
							if (Engine.Primitives.getAttribute(sourcePrimitive, "isConstant") == "true") {
								visual = new ConstantVisual(primitive.id, "variable", position, { isGhost: true })
							} else {
								visual = new VariableVisual(primitive.id, "variable", position, { isGhost: true })
							}
							break;
						case "Stock":
							visual = new StockVisual(primitive.id, "stock", position, { isGhost: true });
							break;
					}
					Name.set(primitive.id, Engine.Primitives.getAttribute(primitive, "name"))

					visual!.setColor(Engine.Primitives.getAttribute(primitive, "Color"))

					visual!.namePositionIndex = Number(Engine.Primitives.getAttribute(primitive, "RotateName"))
					Name.updatePosition(primitive.id)
				}
				break;
			case "Variable":
				{
					//~ do_global_log("VARIABLE id is "+tprimitive.id);
					let position = Engine.Primitives.getCenterPosition(primitive);
					let visual;
					if (Engine.Primitives.getAttribute(primitive, "isConstant") == "false") {
						visual = new VariableVisual(primitive.id, "variable", position);
					} else {
						visual = new ConstantVisual(primitive.id, "constant", position);
					}
					Name.set(primitive.id, Engine.Primitives.getAttribute(primitive, "name"));

					visual.setColor(Engine.Primitives.getAttribute(primitive, "Color"));

					visual.namePositionIndex = Number(Engine.Primitives.getAttribute(primitive, "RotateName"));
					Name.updatePosition(primitive.id);
				}
				break;
			case "Flow":

				let source_pos = Engine.Primitives.getStartPosition(primitive as Flow)
				let target_pos = Engine.Primitives.getEndPosition(primitive as Flow)

				let connection = new FlowVisual(primitive.id, "flow", source_pos, target_pos)

				connection.namePositionIndex = Number(Engine.Primitives.getAttribute(primitive, "RotateName"))
				Name.updatePosition(primitive.id);

				connection.loadMiddlePoints();

				connection.setColor(Engine.Primitives.getAttribute(primitive, "Color"));
				connection.valveIndex = parseInt(Engine.Primitives.getAttribute(primitive, "ValveIndex"));
				connection.variableSide = (Engine.Primitives.getAttribute(primitive, "VariableSide") === "true");

				if ((primitive as Flow).start != null) {
					// Attach to object
					const stockId = Engine.Primitives.getAttribute((primitive as Flow).start as Primitive, "id")
					connection.setStartAttach(get(stockId) as StockVisual)
				}
				if ((primitive as Flow).end != null) {
					// Attach to object
					const stockId = Engine.Primitives.getAttribute((primitive as Flow).end as Primitive, "id")
					connection.setEndAttach(get(stockId) as StockVisual)
				}
				connection.update()

				Name.set(primitive.id, Engine.Primitives.getName(primitive))
				break;
			case "Link":
				{
					let source_pos = Engine.Primitives.getStartPosition(primitive as Link)
					let target_pos = Engine.Primitives.getEndPosition(primitive as Link)

					let connection = new LinkVisual(primitive.id, "link", source_pos, target_pos)

					connection.setColor(Engine.Primitives.getAttribute(primitive, "Color"))

					if ((primitive as Link).start != null) {
						// Attach to object
						connection.setStartAttach(get((primitive as Link).start.getAttribute("id")))
					}
					if ((primitive as Link).end != null) {
						// Attach to object
						connection.setEndAttach(get((primitive as Link).end.getAttribute("id")))
					}
					let bezierPoints = [
						Engine.Primitives.getAttribute(primitive, "b1x"),
						Engine.Primitives.getAttribute(primitive, "b1y"),
						Engine.Primitives.getAttribute(primitive, "b2x"),
						Engine.Primitives.getAttribute(primitive, "b2y")
					]

					if ((bezierPoints as any[]).indexOf(undefined) == -1) {
						connection.setHandle1Pos([Number(bezierPoints[0]), Number(bezierPoints[1])]);
						connection.setHandle2Pos([Number(bezierPoints[2]), Number(bezierPoints[3])]);
					} else {
						// bezierPoints does not exist. Create them
						connection.resetBezierPoints();
					}
					for (let i = 0; i < 8; i++) {
						// the anchor and the handle are co-dependent 
						// This means that moving the handle moves the anchor which moves the handle ... etc.
						// this continues until a stable position is reached.
						// To get around this the Link gets calculated a few times to reach a stable position.
						connection.update();
					}
				}
				break;
		}
	}
}