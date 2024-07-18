import $ from "jquery"
import { errorPopUp } from "../debug/debug";
import { BaseTool } from "./BaseTool";

export class Box {
  static tools: Record<string, typeof BaseTool> = {}
  static get currentTool() {
    return this.tools[this.current] ?? this.tools["mouse"]
  }
  private static current: string
  static add(name: string, tool: typeof BaseTool) {
    this.tools[name] = tool
  }
	static init() {
    Object.values(this.tools).map(t => t.init());
    $(".tool-button").on("mousedown", function(event) {
      let toolName = $(this).attr("data-tool") as string;
      Box.setTool(toolName, event.which);
    });
    this.setTool("mouse");
	}
	static setTool(name: string, whichMouseButton?: number) {
		if (name in this.tools) {
			$(".tool-button").removeClass("pressed");
			$("#btn_"+name).addClass("pressed");
			
			this.currentTool.leaveTool();
			this.current = name;
			this.currentTool.enterTool(whichMouseButton);
		} else {
			errorPopUp("The tool "+name+" does not exist");
		}
	}
	static getTool() {
	
	}
}