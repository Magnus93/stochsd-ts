import { Engine, Primitive } from "../../Engine/index.js";
import { deletePrimitive } from "../../utility.js";
import { BaseConnection } from "../BaseConnection.js";
import { BaseVisual } from "../BaseVisual.js";
import { OnePointer } from "../OnePointer.js"
import { TwoPointer } from "../TwoPointer.js"

export namespace VisualController {
  /* replaces object_array */
  export const onePointers: Record<string, OnePointer> = {}
  /* replaces connection_array */
  export const twoPointers: Record<string, TwoPointer> = {}

  /* replaces unselect_all */
  export function unselectAll() {
    for(let key in onePointers) {
      onePointers[key].unselect();
    }
    for(let key in twoPointers) {
      twoPointers[key].unselect();
    }
  }
  export function unselectAllOtherAnchors(parent_id: string, child_id_to_select: string) {
    unselectAll();
    let parent = twoPointers[parent_id];
    parent.select();
    for(let anchor of parent.getAnchors()) {
      if (anchor.id !== child_id_to_select) {
        anchor.unselect();
      }
    }
  }
  export function unselectAllBut(dont_unselect_id: string) {
    for(let key in onePointers) {
      if (key != dont_unselect_id) {
        onePointers[key].unselect();
      }
    }
    for(let key in twoPointers) {
      if (key != dont_unselect_id) {
        twoPointers[key].unselect();
      }
    }
  }
  /* replaces get_parent_id - used by anchor */
  export function getParentId(id: string) {
    return id.toString().split(".")[0]
  }
  /* replaces get_parent */
  export function getParent(child: BaseVisual) {
    return get(getParentId(child.id))
  }
  function is_family(id1: string, id2: string) {
    let parent_id1 = id1.toString().split(".")[0];
    let parent_id2 = id2.toString().split(".")[0];
    if (parent_id1 == parent_id2) {
      return true;
    } else {
      return false;
    }
  }
  export function unselectAllButFamily(id: string) {
    for(let key in onePointers) {
      if (!is_family(id,key)) {
        onePointers[key].unselect();
      }
    }
    for(let key in twoPointers) {
      if (!is_family(id,key)) {
        twoPointers[key].unselect();
      }
    }
  }
  export function rotateName(id: string) {
    let visual = get(id)!;
    if (visual.namePositionIndex<3) {
      visual.namePositionIndex++;
    } else {
      visual.namePositionIndex = 0;
    }
    updateNamePos(id);
  }
  /* replaces update_name_pos */
  export function updateNamePos(node_id: string) {
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
  export function findFreeName(basename: string) {
    let counter = 0;
    let testName: string;
    do {
      counter++;
      testName = basename+counter.toString();
    } while(Engine.model.find((p: Primitive) => Engine.getName(p) == testName).length > 0)
    return testName;
  }
  /* replaces get_object */
  export function get(id: string): OnePointer | TwoPointer | undefined {
    if (typeof onePointers[id] != "undefined") {
      return onePointers[id];
    }
    if (typeof twoPointers[id] != "undefined") {
      return twoPointers[id];
    }
  }
  /* replaces rel_move */
  export function relativeMove(node_id: string ,diff_x: number, diff_y: number) {
    let primitive = Engine.findById(node_id);
    /* if (primitive != null) {
      // If its a real primitive (stoch, variable etc) update it in the engine
      let oldPos = getCenterPosition(primitive); // TODO fix from insightmaker API
      let newPos = [oldPos[0]+diff_x,oldPos[1]+diff_y];
      setCenterPosition(primitive,newPos); // TODO fix from insightmaker API
    } else {
      // If its not a real primitive but rather an anchor point updated the position only graphically
      onePointers[node_id].position[0] += diff_x;
      onePointers[node_id].position[1] += diff_y;
    } */
    onePointers[node_id].updatePosition();
    onePointers[node_id].afterMove(diff_x, diff_y)
  }
  /* replaces get_selected_objects */
  export function getSelected() {
    const result: Record<string, BaseVisual> = {}
    for(let key in onePointers) {
      if (onePointers[key].isSelected()) {
        result[key] = onePointers[key];
      }
    }
    for(let key in twoPointers) {
      if (twoPointers[key].isSelected()) {
        result[key] = twoPointers[key];
      }
    }
    return result;
  }

  /* replaces get_selected_ids */
  export function getSelectedIds() {
    return Object.keys(getSelected());
  }

  /* replaces get_only_selected_anchor_id */
  export function getOnlySelectedAnchorId() {
    // returns null if more is selected than one anchor is selected, else returns object {parent_id: ... , child_id: ... }
    let selection = getSelected();
    let keys = [];
    for(let key in selection) { 
      keys.push(key);
    }
    if (keys.length === 1 && selection[keys[0]].getType() === "dummy_anchor") {
      // only one anchor in selection
      return {"parent_id": getParentId(keys[0]), "child_id": keys[0] };
    } else if (keys.length === 2) {
      if (get(keys[0])?.getType() === "dummy_anchor" && get(keys[1])?.getType() === "dummy_anchor") {
        // both anchors are dummies 
        return null;
      } else if(getParentId(keys[0]) === getParentId(keys[1])) {
        // one anchor and parent object selected 
        let parent_id = null;
        let child_id = null;
        if (getParentId(keys[0]) === keys[0]) {
          child_id = keys[1];
          parent_id = keys[0];
        } else {
          child_id = keys[0];
          parent_id = keys[1];
        }
        return { "parent_id": parent_id, "child_id": child_id };
      }
    } 
    return null;
  }
  /* replaces get_only_link_selected */
  export function getOnlyLinkSelected() {
    const object_ids = getSinglePrimitiveIdSelected();
    if (object_ids !== null && get(object_ids?.parent_id ?? "")?.getType() === "link") {
      return object_ids;
    } 
    return null;
  }
  /* replaces get_single_primitive_id_selected */
  export function getSinglePrimitiveIdSelected() {
    // will give object { "parent_id": ..., "children_ids": [...] } or null if more objects selected 
    let selection = getSelected();
    let keys = [];
    for(let key in selection) { 
      keys.push(key);
    }
    let object_ids: { children_ids: string[], parent_id?: string } = { children_ids: [] };
    if (keys.length > 0) {
      object_ids.parent_id = getParentId(keys[0]);
      for(let key of keys) {
        if ( getParentId(key) !== object_ids.parent_id ) {
          return null;
        } else if ( getParentId(key) !== key ) {
          object_ids.children_ids.push(key);
        }
      }
      return object_ids;
    } 
    return null;
  }
  /* replaces update_relevant_objects */
  export function updateRelevantVisuals(ids: string[]) {
    for(let key in onePointers) {
      // dont update dummy_anchors, the twopointer parent of the dummy anchor has responsibility of the dummy_anchors 
      if (onePointers[key].type !== "dummy_anchor") {
        onePointers[key].update();
      }
    }
    updateTwoPointers(ids);
  }
  // only updates diagrams, tables, and XyPlots if needed 
  /* replaces update_twopointer_objects */
  export function updateTwoPointers(ids: string[]) {
    for(let key in twoPointers) {
      let onlyIfRelevant = ["timeplot", "xyplot", "compareplot", "histoplot","table"];
      if( onlyIfRelevant.includes(twoPointers[key].type) ) {
        if (ids.includes(key)) {
          twoPointers[key].update();
        }
      } else {
        twoPointers[key].update();
      }
    }
  }
  /* replaces get_all_objects */
  export function getAll() {
    const result: Record<string, BaseVisual> = {}
    for(let key in onePointers) {
      result[key] = onePointers[key];
    }
    for(let key in twoPointers) {
      result[key] = twoPointers[key];
    }
    return result;
  }
  /* replaces get_root_objects */
  export function getRootVisuals() {
    let result: Record<string, BaseVisual> = {}
    let all = getAll();
    for(let key in all) {
      if (key.indexOf(".") == -1) {
        result[key]=all[key];
      }
    }
    return result;
  }
    /* replaces get_selected_root_objects */
    export function getSelectedRootVisuals() {
      let result: Record<string, TwoPointer | OnePointer> = {};
      const all = getAll();
      for(let key in all) {
        const parent = getParent(all[key])!
        
        // If any element is selected we add its parent
        if (all[key].isSelected()) {
          result[parent!.id] = parent;
        }
      }
      return result;
    }
    /* replaces find_start_connections */
    export function findStartConnections(visual: BaseVisual): BaseConnection[] {
      let connections = []
      for(let conn of Object.values(VisualController.twoPointers)) {
        if (conn instanceof BaseConnection && conn.getStartAttach() == visual) {
          connections.push(conn);
        }
      }
      return connections;
    }
    /* replaces find_end_connections */
    export function findEndConnections(visual: BaseVisual): BaseConnection[] {
      let connections = []
      for(let conn of Object.values(VisualController.twoPointers)) {
        if (conn instanceof BaseConnection && conn.getEndAttach() == visual) {
          connections.push(conn);
        }
      }
      return connections;
    }
  /* replaces delete_selected_objects */
  export function deleteSelected() {
    // Delete all objects that are selected
    let selection = getSelectedRootVisuals();
    for(let key in selection) {
      // check if object not already deleted
      // e.i. link gets deleted automatically if any of it's attachments gets deleted
      if (get(key)) {
        deletePrimitive(key)
      }
    }
  }
}