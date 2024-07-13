import $ from "jquery";
import { do_global_log } from "./debug";
import { SVG } from "./SVG";
import { ToolBox } from "./tools";


// NOTE: values for event.which should be used
// event.button will give incorrect results 
/* replaces mouse */
export const mouseWhichEnum = <const>{"left": 1, "middle": 2, "right": 3};
export class Mouse {
  /* replace last_click_object_clicked */
  static lastClickObjectClicked = false;
  /* replace last_clicked_element - object from object_array */
  static lastClickedElement = null;
  /* replace leftmouseisdown */
  static leftIsDown = false
  /* replace mousedown_x and mousedown_y */
  static downPosition = { x: 0, y: 0 };
  /* replace lastMouseX and lastMouseY */
  static lastPosition = { x: 0, y: 0 };
  /* replace empty_click_down */
  static emptyClickDown = false;

  static init() {
    $(SVG.svgElement).on("mousedown", this.downHandler)
    $("html").on("mousemove", (this.moveHandler));
	  $("html").on("mouseup", (this.upHandler));
  }

  /* replaces mouseDownHandler */
  static downHandler(event: JQuery.MouseDownEvent) {
    do_global_log("mouseDownHandler");
    /* if (! isTimeUnitOk(getTimeUnits()) && Preferences.get("forceTimeUnit")) {
      event.preventDefault();
      timeUnitDialog.show();
      return;
    } */ // TODO add back when TimeUnit fixed
    let offset = $(SVG.svgElement).offset()!;
    let x = event.pageX-offset.left;
    let y = event.pageY-offset.top;
    do_global_log("x:"+x+" y:"+y);
    switch (event.which) { // TODO replace which with event.button
      case mouseWhichEnum.left:
        // if left mouse button down
        Mouse.leftIsDown = true;
        ToolBox.currentTool.leftMouseDown(x,y);
        break;
      case mouseWhichEnum.right: 
        // if right mouse button down
        ToolBox.currentTool.rightMouseDown(x,y);
        break;
    }
  }
  /* replaces mouseMoveHandler */
  static moveHandler(event: JQuery.MouseMoveEvent) {
    const offset = $(SVG.svgElement).offset()!;
    const x = event.pageX-offset.left;
    const y = event.pageY-offset.top;
    Mouse.lastPosition = { x, y };
    
    if (Mouse.leftIsDown) {
      ToolBox.currentTool.mouseMove(x, y, event.shiftKey);
    }
  }
  /* replaces mouseUpHandler */
  static upHandler(event: JQuery.MouseUpEvent) {
    if (event.which === mouseWhichEnum.left) {
      if (!Mouse.leftIsDown) {
        return;
      }
      // does not work to store UndoState here, because mouseUpHandler happens even when we are outside the svg (click buttons etc)
      do_global_log("mouseUpHandler");
      let offset = $(SVG.svgElement).offset()!;
      let x = event.pageX-offset.left;
      let y = event.pageY-offset.top;
      
      ToolBox.currentTool.leftMouseUp(x, y, event.shiftKey);
      Mouse.leftIsDown = false;
      // InfoBar.update(); // TODO add InfoBar
      // History.storeUndoState(); // TODO add History
    }	
  }

}