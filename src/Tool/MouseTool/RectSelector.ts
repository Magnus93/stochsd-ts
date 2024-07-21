import { CoordRect } from "../../CoordRect";
import {Mouse} from "../../Mouse"
import { Visual } from "../../Visual";
import { SVG } from "../../SVG"

export class RectSelector {
  static rect: CoordRect<SVGRectElement>
  
  static init() {
    this.rect = new CoordRect(SVG.rect(-30,-30,60,60, "black", "none", "rect-selector"));
    this.rect.element.setAttribute("stroke-dasharray", "4 4");
    this.rect.setVisible(false);
  }
  static start() {
    Mouse.emptyClickDown = true;
    Visual.Controller.Selection.unselectAll();
    this.rect.setVisible(true);
    this.rect.x1 = Mouse.downPosition.x;
    this.rect.y1 = Mouse.downPosition.y;
    this.rect.x2 = Mouse.downPosition.x;
    this.rect.y2 = Mouse.downPosition.y;
    this.rect.update();
  }

  static move() {
    this.rect.x2 = Mouse.downPosition.x;
    this.rect.y2 = Mouse.downPosition.y;
    this.rect.update();
    Visual.Controller.Selection.unselectAll();
    const selection = this.getVisualsWithin();
    for(let key in selection) {
      let parent = Visual.Controller.getParent(selection[key]) as Visual.TwoPointer
      parent!.select(); // We also select the parent but not all of its anchors
      selection[key].select();
    }
  }
  
  static stop() {
    this.rect.setVisible(false);
    const selection = this.getVisualsWithin();
    for(let key in selection) {
      selection[key].select();
    }
  }
  
  static isWithin(node_id: string) {
    return (
      Visual.Controller.onePointers[node_id].position[0] >= this.rect.xmin() &&
      Visual.Controller.onePointers[node_id].position[1] >= this.rect.ymin() &&
      Visual.Controller.onePointers[node_id].position[0] <= this.rect.xmin()+this.rect.width() &&
      Visual.Controller.onePointers[node_id].position[1] <= this.rect.ymin()+this.rect.height()
    );
  }
  
  /* replaces get_objects_in_rectselect */
  static getVisualsWithin() {
    const result: Record<string, Visual.OnePointer> = {}
    for(let key in Visual.Controller.onePointers) {
      if (this.isWithin(key)) {
        result[key] = Visual.Controller.onePointers[key];
      }
    }
    return result;
  }
}