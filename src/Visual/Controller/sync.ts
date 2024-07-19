import { Primitive } from "../../Engine";

// This function is important. It takes all the relevant primitives from the engine
// And make visual objects from them
// This is executed after loading a file or loading a whole new state such as after undo
export function syncAllVisuals() { // TODO add
	/* for(let type of saveblePrimitiveTypes) {
		let primitive_list = primitives(type);
		for(key in primitive_list) {
			try {
				syncVisual(primitive_list[key]);
			} catch(exception) {
				removePrimitive(primitive_list[key]);
				alert("Error while loading corrupted primitive of type "+type+". Removing corrupted primitive to avoid propagated errors.");
				//~ alert("Error while loading corrupted primitive of type "+type+". Removing corrupted primitive to avoid propagated errors. \n\nError happened at: "+exception.stack);
				throw exception;
			}
		}
	}
	update_all_objects();
	unselect_all(); */
}

// Take a primitive from the engine(tprimitve) and makes a visual object from it
export function syncVisual(tprimitive: Primitive) { // TODO add
	 /*let stochsd_object = get_object(tprimitive.id);
	if (stochsd_object != false) {
		return false;
	}

	addMissingPrimitiveAttributes(tprimitive);

	let nodeType = tprimitive.value.nodeName;
	switch(nodeType) {
		case "Numberbox":
		{
			let position = getCenterPosition(tprimitive);
			let visualObject = new NumberboxVisual(tprimitive.id, "numberbox",position);
			visualObject.setColor(tprimitive.getAttribute("Color"));
			visualObject.render();
		}
		break;
		case "Table":
		case "XyPlot":
		case "HistoPlot":
		{
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
			let source_pos = getSourcePosition(tprimitive);
			let target_pos = getTargetPosition(tprimitive);
			
			let connection = new dimClass(tprimitive.id, nodeType.toLowerCase(), source_pos, target_pos);
			
			connection.setColor(tprimitive.getAttribute("Color"));
			
			// Insert correct primtives
			let primitivesString = tprimitive.getAttribute("Primitives");
			if (primitivesString !== "") {
				let idsToDisplay = primitivesString.split(",");
				connection.dialog.setIdsToDisplay(idsToDisplay);
			}

			connection.update();
			connection.render();
		}
		break;
		case "Diagram":
		case "TimePlot":
		case "ComparePlot":
		{
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
			let source_pos = getSourcePosition(tprimitive);
			let target_pos = getTargetPosition(tprimitive);
			
			let connection = new dimClass(tprimitive.id, nodeType.toLowerCase(), source_pos, target_pos);
			
			connection.setColor(tprimitive.getAttribute("Color"));
			
			// Insert correct primtives
			let primitivesString = tprimitive.getAttribute("Primitives");
			let idsToDisplay = primitivesString.split(",");
			let sidesString = tprimitive.getAttribute("Sides");
			if (primitivesString) {
				if (sidesString) {
					connection.dialog.setIdsToDisplay(idsToDisplay, sidesString.split(","));
				} else {
					connection.dialog.setIdsToDisplay(idsToDisplay);
				}
			}
			
			connection.update();
			connection.render();
		}
		break;
		case "Line":
		case "Rectangle":
		case "Ellipse":
		{
			dimClass = null;
			switch(nodeType) {
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
			let source_pos = getSourcePosition(tprimitive);
			let target_pos = getTargetPosition(tprimitive);
			
			let connection = new dimClass(tprimitive.id, nodeType.toLowerCase(), source_pos, target_pos);	
			
			connection.setColor(tprimitive.getAttribute("Color"));

			connection.update();
		}
		break;
		case "TextArea":
		{
			let source_pos = getSourcePosition(tprimitive);
			let target_pos = getTargetPosition(tprimitive);
			
			let connection = new TextAreaVisual(tprimitive.id, "text", source_pos, target_pos);
			
			connection.setColor(tprimitive.getAttribute("Color"));
			
			connection.update();
		}
		break;
		case "Stock":
		{
			let position = getCenterPosition(tprimitive);
			let visualObject = new StockVisual(tprimitive.id, "stock",position);
			set_name(tprimitive.id,tprimitive.getAttribute("name"));
			
			visualObject.setColor(tprimitive.getAttribute("Color"));

			visualObject.name_pos = Number(tprimitive.getAttribute("RotateName"));
			update_name_pos(tprimitive.id);
		}
		break;
		case "Converter":
		{
			let position = getCenterPosition(tprimitive);
			let visualObject = new ConverterVisual(tprimitive.id, "converter",position);
			set_name(tprimitive.id,tprimitive.getAttribute("name"));
			
			visualObject.setColor(tprimitive.getAttribute("Color"));

			visualObject.name_pos = Number(tprimitive.getAttribute("RotateName"));
			update_name_pos(tprimitive.id);
		}
		break;
		case "Ghost":
		{
			let source_primitive = findID(tprimitive.getAttribute("Source"));
			let source_type = source_primitive.value.nodeName;
			//~ do_global_log("id is "+tprimitive.id);
			let position = getCenterPosition(tprimitive);
			let visualObject = null;
			switch(source_type) {
					case "Converter":
						visualObject = new ConverterVisual(tprimitive.id, "converter",position,{"is_ghost":true});
						break;
					case "Variable":
						if (source_primitive.getAttribute("isConstant") == "true") {
							visualObject = new ConstantVisual(tprimitive.id, "variable", position, {"is_ghost":true});
						} else {
							visualObject = new VariableVisual(tprimitive.id, "variable", position, {"is_ghost":true});
						}
						break;
					case "Stock":
						visualObject = new StockVisual(tprimitive.id, "stock",position,{"is_ghost":true});
						break;
			}
			set_name(tprimitive.id,tprimitive.getAttribute("name"));

			visualObject.setColor(tprimitive.getAttribute("Color"));			

			visualObject.name_pos = Number(tprimitive.getAttribute("RotateName"));
			update_name_pos(tprimitive.id);
		}
		break;
		case "Variable":
		{
			//~ do_global_log("VARIABLE id is "+tprimitive.id);
			let position = getCenterPosition(tprimitive);
			let visualObject;
			if (tprimitive.getAttribute("isConstant") == "false") {
				visualObject = new VariableVisual(tprimitive.id, "variable", position);
			} else {
				visualObject = new ConstantVisual(tprimitive.id, "constant", position);
			}
			set_name(tprimitive.id,tprimitive.getAttribute("name"));
			
			visualObject.setColor(tprimitive.getAttribute("Color"));

			visualObject.name_pos = Number(tprimitive.getAttribute("RotateName"));
			update_name_pos(tprimitive.id);
		}
		break;
		case "Flow":

			let source_pos = getSourcePosition(tprimitive);
			let target_pos = getTargetPosition(tprimitive);

			let connection = new FlowVisual(tprimitive.id, "flow", source_pos, target_pos);

			connection.name_pos = Number(tprimitive.getAttribute("RotateName"));
			update_name_pos(tprimitive.id);

			connection.loadMiddlePoints();
			
			connection.setColor(tprimitive.getAttribute("Color"));
			connection.valveIndex = parseInt(tprimitive.getAttribute("ValveIndex"));
			connection.variableSide = (tprimitive.getAttribute("VariableSide") === "true");
			
			if (tprimitive.source != null) {
				// Attach to object
				connection.setStartAttach(get_object(tprimitive.source.getAttribute("id")));
			}
			if (tprimitive.target != null) {
				// Attach to object
				connection.setEndAttach(get_object(tprimitive.target.getAttribute("id")));
			}
			connection.update();

			set_name(tprimitive.id,getName(tprimitive));
		break;
		case "Link":
		{
			let source_pos = getSourcePosition(tprimitive);
			let target_pos = getTargetPosition(tprimitive);

			let connection = new LinkVisual(tprimitive.id, "link", source_pos, target_pos);
			
			connection.setColor(tprimitive.getAttribute("Color"));

			if (tprimitive.source != null) {
				// Attach to object
				connection.setStartAttach(get_object(tprimitive.source.getAttribute("id")));
			}
			if (tprimitive.target != null) {
				// Attach to object
				connection.setEndAttach(get_object(tprimitive.target.getAttribute("id")));
			}
			let bezierPoints = [
				tprimitive.getAttribute("b1x"),
				tprimitive.getAttribute("b1y"),
				tprimitive.getAttribute("b2x"),
				tprimitive.getAttribute("b2y")
			];

			if (bezierPoints.indexOf(null) == -1) {
				connection.setHandle1Pos([Number(bezierPoints[0]),Number(bezierPoints[1])]);
				connection.setHandle2Pos([Number(bezierPoints[2]),Number(bezierPoints[3])]);
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
	}*/
}