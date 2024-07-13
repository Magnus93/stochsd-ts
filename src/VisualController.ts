export class VisualController {
  /* replaces object_array */
  static onePointers: Record<string, any> = {} // TODO fix typedef
  /* replaces connection_array */
  static twoPointers: Record<string, any> = {} // TODO fix typedef

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
  /* replaces get_parent_id */
  static getParentById(id: string) {
    return id.toString().split(".")[0];;
  }
  /* replaces get_parent */
  static getParent(child: any) { // TODO - fix to Visual type
    return this.get(this.getParentById(child.id));
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
  static rotateName(node_id: string) {
    let object = this.get(node_id);
    if (object.name_pos<3) {
      object.name_pos++;
    } else {
      object.name_pos = 0;
    }
    this.updateNamePos(node_id);
  }
  static updateNamePos(node_id: string) {
    let object = this.get(node_id);
    let name_element = object.name_element;
    // Some objects does not have name element
    if (name_element == null) {
      return;
    }
    // For fixed names (used only by text element)
    if (object.name_centered) {
      name_element.setAttribute("x",0); //Set path's data
      name_element.setAttribute("y",0); //Set path's data
      name_element.setAttribute("text-anchor", "middle");
      return;
    }
  
    let visualObject = this.get(node_id);
    let pos = visualObject.namePosList[visualObject.name_pos];
    name_element.setAttribute("x",pos[0]); //Set path's data
    name_element.setAttribute("y",pos[1]); //Set path's data
  
    switch(this.get(node_id).name_pos) {
      case 0:
        // Below
        name_element.setAttribute("text-anchor", "middle");
      break;
      case 1:
        // To the right
        name_element.setAttribute("text-anchor", "start");
      break;
      case 2:
        // Above
        name_element.setAttribute("text-anchor", "middle");
      break;
      case 3:
        // To the left
        name_element.setAttribute("text-anchor", "end");
      break;
    }
  }
  /* replaces get_object */
  static get(id: string) {
    if (typeof this.onePointers[id] != "undefined") {
      return this.onePointers[id];
    }
    if (typeof this.twoPointers[id] != "undefined") {
      return this.twoPointers[id];
    }
    return false;
  }
  /* replaces rel_move */
  static relativeMove(node_id: string ,diff_x: number, diff_y: number) {
    /* let primitive = findID(node_id); // TODO fix from insightmaker API - replaced by Model.getId
    if (primitive != null) {
      // If its a real primitive (stoch, variable etc) update it in the engine
      let oldPos = getCenterPosition(primitive); // TODO fix from insightmaker API
      let newPos = [oldPos[0]+diff_x,oldPos[1]+diff_y];
      setCenterPosition(primitive,newPos); // TODO fix from insightmaker API
    } else {
      // If its not a real primitive but rather an anchor point updated the position only graphically
      this.onePointers[node_id].pos[0] += diff_x;
      this.onePointers[node_id].pos[1] += diff_y;
    }
    this.onePointers[node_id].updatePosition();
    this.onePointers[node_id].afterMove(diff_x,diff_y); */
  }
  /* replaces get_selected_objects */
  static getSelected() {
    const result: Record<string, any> = {}; // TODO fix type to VIsuals
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
      return {"parent_id": this.getParentById(keys[0]), "child_id": keys[0] };
    } else if (keys.length === 2) {
      if (this.get(keys[0]).getType() === "dummy_anchor" && this.get(keys[1]).getType() === "dummy_anchor") {
        // both anchors are dummies 
        return null;
      } else if(this.getParentById(keys[0]) === this.getParentById(keys[1])) {
        // one anchor and parent object selected 
        let parent_id = null;
        let child_id = null;
        if (this.getParentById(keys[0]) === keys[0]) {
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
    if (object_ids !== null && this.get(object_ids?.parent_id ?? "").getType() === "link") {
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
      object_ids.parent_id = this.getParentById(keys[0]);
      for(let key of keys) {
        if ( this.getParentById(key) !== object_ids.parent_id ) {
          return null;
        } else if ( this.getParentById(key) !== key ) {
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
}