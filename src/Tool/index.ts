import "./MouseTool"
import "./DeleteTool"

import { Box as ToolBox } from "./Box";
import { MouseTool } from "./MouseTool";
import { DeleteTool } from "./DeleteTool";

export namespace Tool {
  export function init() {
    ToolBox.add("mouse", MouseTool)
    ToolBox.add("delete", DeleteTool)
    // ToolBox.add("undo", UndoTool)
    // ToolBox.add("redo", RedoTool)
    // ToolBox.add("stock", StockTool)
    // ToolBox.add("converter", ConverterTool)
    // ToolBox.add("variable", VariableTool)
    // ToolBox.add("constant", ConstantTool)
    // ToolBox.add("flow", FlowTool)
    // ToolBox.add("link", LinkTool)
    // ToolBox.add("rotatename", RotateNameTool)
    // ToolBox.add("movevalve", MoveValveTool)
    // ToolBox.add("straightenlink",  StraightenLinkTool)
    // ToolBox.add("ghost", GhostTool)
    // ToolBox.add("text", TextAreaTool)
    // ToolBox.add("rectangle", RectangleTool)
    // ToolBox.add("ellipse", EllipseTool)
    // ToolBox.add("line", LineTool)
    // ToolBox.add("table", TableTool)
    // ToolBox.add("timeplot", TimePlotTool)
    // ToolBox.add("compareplot", ComparePlotTool)
    // ToolBox.add("xyplot", XyPlotTool)
    // ToolBox.add("histoplot", HistoPlotTool)
    // ToolBox.add("numberbox", NumberboxTool)
    // ToolBox.add("run", RunTool)
    // ToolBox.add("step", StepTool)
    // ToolBox.add("reset", ResetTool)
    ToolBox.init()
  }
  export const Box = ToolBox
}


