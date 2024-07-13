import { CoordRect } from "../../CoordRect";
import {Mouse} from "../../Mouse"
import { VisualController } from "../../VisualController";
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
    VisualController.unselectAll();
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
    VisualController.unselectAll();
    const selection = this.getVisualsWithin();
    for(let key in selection) {
      let parent = VisualController.getParent(selection[key]);
      parent.select(false); // We also select the parent but not all of its anchors
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
      VisualController.onePointers[node_id].pos[0] >= this.rect.xmin() &&
      VisualController.onePointers[node_id].pos[1] >= this.rect.ymin() &&
      VisualController.onePointers[node_id].pos[0] <= this.rect.xmin()+this.rect.width() &&
      VisualController.onePointers[node_id].pos[1] <= this.rect.ymin()+this.rect.height()
    );
  }
  
  /* replaces get_objects_in_rectselect */
  static getVisualsWithin() {
    let result: Record<string, any> = {}; // TODO fix type
    for(let key in VisualController.onePointers) {
      if (this.isWithin(key)) {
        result[key] = VisualController.onePointers[key];
      }
    }
    return result;
  }
}