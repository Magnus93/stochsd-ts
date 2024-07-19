import { Engine, Primitive } from "../Engine/index.js";
import { deletePrimitive } from "../utility.js";
import { BaseConnection } from "../Visual/BaseConnection.js";
import { BaseVisual } from "../Visual/BaseVisual.js";
import { OnePointer } from "../Visual/OnePointer.js"
import { TwoPointer } from "../Visual/TwoPointer.js"

export class VisualController {
  /* replaces object_array */
  static onePointers: Record<string, OnePointer> = {}
  /* replaces connection_array */
  static twoPointers: Record<string, TwoPointer> = {}

  /* replaces unselect_all */
  static unselectAll() {
    for(let key in this.onePointers) {
      this.onePointers[key].unselect();
    }
    for(let key in this.twoPointers) {
      this.twoPointers[key].unselect();
    }
  }
  static unselectAllOtherAnchors(parent_id: string, child_id_to_select: string) {
    this.unselectAll();
    let parent = this.twoPointers[parent_id];
    parent.select();
    for(let anchor of parent.getAnchors()) {
      if (anchor.id !== child_id_to_select) {
        anchor.unselect();
      }
    }
  }
  static unselectAllBut(dont_unselect_id: string) {
    for(let key in this.onePointers) {
      if (key != dont_unselect_id) {
        this.onePointers[key].unselect();
      }
    }
    for(let key in this.twoPointers) {
      if (key != dont_unselect_id) {
        this.twoPointers[key].unselect();
      }
    }
  }
  /* replaces get_parent_id - used by anchor */
  static getParentId(id: string) {
    return id.toString().split(".")[0]
  }
  /* replaces get_parent */
  static getParent(child: BaseVisual) {
    return this.get(this.getParentId(child.id))
  }
  private static is_family(id1: string, id2: string) {
    let parent_id1 = id1.toString().split(".")[0];
    let parent_id2 = id2.toString().split(".")[0];
    if (parent_id1 == parent_id2) {
      return true;
    } else {
      return false;
    }
  }
  static unselectAllButFamily(id: string) {
    for(let key in this.onePointers) {
      if (!this.is_family(id,key)) {
        this.onePointers[key].unselect();
      }
    }
    for(let key in this.twoPointers) {
      if (!this.is_family(id,key)) {
        this.twoPointers[key].unselect();
      }
    }
  }
  static rotateName(id: string) {
    let visual = this.get(id)!;
    if (visual.namePositionIndex<3) {
      visual.namePositionIndex++;
    } else {
      visual.namePositionIndex = 0;
    }
    this.updateNamePos(id);
  }
  /* replaces update_name_pos */
  static updateNamePos(node_id: string) {
    let visual = this.get(node_id)!
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
  
    const visualObject = this.get(node_id)!
    const pos = visualObject.namePositions[visualObject.namePositionIndex]
    nameElement.setAttribute("x", `${pos[0]}`)
    nameElement.setAttribute("y", `${pos[1]}`)
  
    switch(this.get(node_id)?.namePositionIndex) {
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
  static findFreeName(basename: string) {
    let counter = 0;
    let testName: string;
    do {
      counter++;
      testName = basename+counter.toString();
    } while(Engine.model.find((p: Primitive) => Engine.getName(p) == testName).length > 0)
    return testName;
  }
  /* replaces get_object */
  static get(id: string): OnePointer | TwoPointer | undefined {
    if (typeof this.onePointers[id] != "undefined") {
      return this.onePointers[id];
    }
    if (typeof this.twoPointers[id] != "undefined") {
      return this.twoPointers[id];
    }
  }
  /* replaces rel_move */
  static relativeMove(node_id: string ,diff_x: number, diff_y: number) {
    let primitive = Engine.findById(node_id);
    /* if (primitive != null) {
      // If its a real primitive (stoch, variable etc) update it in the engine
      let oldPos = getCenterPosition(primitive); // TODO fix from insightmaker API
      let newPos = [oldPos[0]+diff_x,oldPos[1]+diff_y];
      setCenterPosition(primitive,newPos); // TODO fix from insightmaker API
    } else {
      // If its not a real primitive but rather an anchor point updated the position only graphically
      this.onePointers[node_id].position[0] += diff_x;
      this.onePointers[node_id].position[1] += diff_y;
    } */
    this.onePointers[node_id].updatePosition();
    this.onePointers[node_id].afterMove(diff_x, diff_y)
  }
  /* replaces get_selected_objects */
  static getSelected() {
    const result: Record<string, BaseVisual> = {}
    for(let key in this.onePointers) {
      if (this.onePointers[key].isSelected()) {
        result[key] = this.onePointers[key];
      }
    }
    for(let key in this.twoPointers) {
      if (this.twoPointers[key].isSelected()) {
        result[key] = this.twoPointers[key];
      }
    }
    return result;
  }

  /* replaces get_selected_ids */
  static getSelectedIds() {
    return Object.keys(this.getSelected());
  }

  /* replaces get_only_selected_anchor_id */
  static getOnlySelectedAnchorId() {
    // returns null if more is selected than one anchor is selected, else returns object {parent_id: ... , child_id: ... }
    let selection = this.getSelected();
    let keys = [];
    for(let key in selection) { 
      keys.push(key);
    }
    if (keys.length === 1 && selection[keys[0]].getType() === "dummy_anchor") {
      // only one anchor in selection
      return {"parent_id": this.getParentId(keys[0]), "child_id": keys[0] };
    } else if (keys.length === 2) {
      if (this.get(keys[0])?.getType() === "dummy_anchor" && this.get(keys[1])?.getType() === "dummy_anchor") {
        // both anchors are dummies 
        return null;
      } else if(this.getParentId(keys[0]) === this.getParentId(keys[1])) {
        // one anchor and parent object selected 
        let parent_id = null;
        let child_id = null;
        if (this.getParentId(keys[0]) === keys[0]) {
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
  static getOnlyLinkSelected() {
    const object_ids = this.getSinglePrimitiveIdSelected();
    if (object_ids !== null && this.get(object_ids?.parent_id ?? "")?.getType() === "link") {
      return object_ids;
    } 
    return null;
  }
  /* replaces get_single_primitive_id_selected */
  static getSinglePrimitiveIdSelected() {
    // will give object { "parent_id": ..., "children_ids": [...] } or null if more objects selected 
    let selection = this.getSelected();
    let keys = [];
    for(let key in selection) { 
      keys.push(key);
    }
    let object_ids: { children_ids: string[], parent_id?: string } = { children_ids: [] };
    if (keys.length > 0) {
      object_ids.parent_id = this.getParentId(keys[0]);
      for(let key of keys) {
        if ( this.getParentId(key) !== object_ids.parent_id ) {
          return null;
        } else if ( this.getParentId(key) !== key ) {
          object_ids.children_ids.push(key);
        }
      }
      return object_ids;
    } 
    return null;
  }
  /* replaces update_relevant_objects */
  static updateRelevantVisuals(ids: string[]) {
    for(let key in this.onePointers) {
      // dont update dummy_anchors, the twopointer parent of the dummy anchor has responsibility of the dummy_anchors 
      if (this.onePointers[key].type !== "dummy_anchor") {
        this.onePointers[key].update();
      }
    }
    this.updateTwoPointers(ids);
  }
  // only updates diagrams, tables, and XyPlots if needed 
  /* replaces update_twopointer_objects */
  static updateTwoPointers(ids: string[]) {
    for(let key in this.twoPointers) {
      let onlyIfRelevant = ["timeplot", "xyplot", "compareplot", "histoplot","table"];
      if( onlyIfRelevant.includes(this.twoPointers[key].type) ) {
        if (ids.includes(key)) {
          this.twoPointers[key].update();
        }
      } else {
        this.twoPointers[key].update();
      }
    }
  }
  /* replaces get_all_objects */
  static getAll() {
    const result: Record<string, BaseVisual> = {}
    for(let key in this.onePointers) {
      result[key] = this.onePointers[key];
    }
    for(let key in this.twoPointers) {
      result[key] = this.twoPointers[key];
    }
    return result;
  }
  /* replaces get_root_objects */
  static getRootVisuals() {
    let result: Record<string, BaseVisual> = {}
    let all = this.getAll();
    for(let key in all) {
      if (key.indexOf(".") == -1) {
        result[key]=all[key];
      }
    }
    return result;
  }
    /* replaces get_selected_root_objects */
    static getSelectedRootVisuals() {
      let result: Record<string, TwoPointer | OnePointer> = {};
      const all = this.getAll();
      for(let key in all) {
        const parent = this.getParent(all[key])!
        
        // If any element is selected we add its parent
        if (all[key].isSelected()) {
          result[parent!.id] = parent;
        }
      }
      return result;
    }
    /* replaces find_start_connections */
    static findStartConnections(visual: BaseVisual): BaseConnection[] {
      let connections = []
      for(let conn of Object.values(VisualController.twoPointers)) {
        if (conn instanceof BaseConnection && conn.getStartAttach() == visual) {
          connections.push(conn);
        }
      }
      return connections;
    }
    /* replaces find_end_connections */
    static findEndConnections(visual: BaseVisual): BaseConnection[] {
      let connections = []
      for(let conn of Object.values(VisualController.twoPointers)) {
        if (conn instanceof BaseConnection && conn.getEndAttach() == visual) {
          connections.push(conn);
        }
      }
      return connections;
    }
  /* replaces delete_selected_objects */
  static deleteSelected() {
    // Delete all objects that are selected
    let selection = this.getSelectedRootVisuals();
    for(let key in selection) {
      // check if object not already deleted
      // e.i. link gets deleted automatically if any of it's attachments gets deleted
      if (this.get(key)) {
        deletePrimitive(key)
      }
    }
  }
}