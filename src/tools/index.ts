import { errorPopUp } from "../debug/debug";
import { BaseTool } from "./BaseTool";

export class ToolBox {
  static tools = <const>{
    // "mouse":MouseTool,
    // "delete":DeleteTool,
    // "undo":UndoTool,
    // "redo":RedoTool,
    // "stock":StockTool,
    // "converter":ConverterTool,
    // "variable":VariableTool,
    // "constant":ConstantTool,
    // "flow":FlowTool,
    // "link":LinkTool,
    // "rotatename":RotateNameTool,
    // "movevalve":MoveValveTool,
    // "straightenlink": StraightenLinkTool,
    // "ghost":GhostTool,
    // "text":TextAreaTool,
    // "rectangle":RectangleTool,
    // "ellipse":EllipseTool,
    // "line":LineTool,
    // "table":TableTool,
    // "timeplot":TimePlotTool,
    // "compareplot":ComparePlotTool,
    // "xyplot":XyPlotTool,
    // "histoplot":HistoPlotTool,
    // "numberbox":NumberboxTool,
    // "run":RunTool,
    // "step":StepTool,
    // "reset":ResetTool
  } as any
  static currentTool: BaseTool
	static init() {
		
	}
	static setTool(toolName: string, whichMouseButton: number) {
		if (toolName in this.tools) {
			$(".tool-button").removeClass("pressed");
			$("#btn_"+toolName).addClass("pressed");
			
			// this.currentTool.leaveTool(); // TODO add back - not working
			this.currentTool = this.tools[toolName];
			// this.currentTool.enterTool(whichMouseButton); // TODO add back - not working
		} else {
			errorPopUp("The tool "+toolName+" does not exist");
		}
	}
	static getTool() {
	
	}
}