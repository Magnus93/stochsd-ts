import { Engine, Primitive } from "../../Engine";
import { get } from "./get";

export namespace Name {
  /* replaces rotate_name */
  export function rotate(id: string) {
    let visual = get(id)!;
    if (visual.namePositionIndex<3) {
      visual.namePositionIndex++;
    } else {
      visual.namePositionIndex = 0;
    }
    updatePosition(id);
  }
  /* replaces update_name_pos */
  export function updatePosition(node_id: string) {
    let visual = get(node_id)!
    let nameElement = visual.nameElement;
    // Some objects does not have name element
    if (!nameElement) {
      return;
    }
    // For fixed names (used only by text element)
    if ("nameCentered" in visual && visual.nameCentered) {
      nameElement.setAttribute("x", "0")
      nameElement.setAttribute("y", "0")
      nameElement.setAttribute("text-anchor", "middle");
      return;
    }
  
    const visualObject = get(node_id)!
    const pos = visualObject.namePositions[visualObject.namePositionIndex]
    nameElement.setAttribute("x", `${pos[0]}`)
    nameElement.setAttribute("y", `${pos[1]}`)
  
    switch(get(node_id)?.namePositionIndex) {
      case 0:
        // Below
        nameElement.setAttribute("text-anchor", "middle");
      break;
      case 1:
        // To the right
        nameElement.setAttribute("text-anchor", "start");
      break;
      case 2:
        // Above
        nameElement.setAttribute("text-anchor", "middle");
      break;
      case 3:
        // To the left
        nameElement.setAttribute("text-anchor", "end");
      break;
    }
  }
  /* replaces findFreeName from API */
  export function findFree(basename: string) {
    let counter = 0;
    let testName: string;
    do {
      counter++;
      testName = basename+counter.toString();
    } while(Engine.model.find((p: Primitive) => Engine.getName(p) == testName).length > 0)
    return testName;
  }
}