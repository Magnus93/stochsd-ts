import { Engine, Primitive } from "../../Engine/index";
import { deletePrimitive } from "../../utility";
import { BaseConnection } from "../BaseConnection";
import { BaseVisual } from "../BaseVisual";
import { OnePointer } from "../OnePointer"
import { TwoPointer } from "../TwoPointer"
import * as visual from "./get";
import { Name as VisualName } from "./Name";

export namespace VisualController {
  /* replaces object_array */
  export const onePointers = visual.onePointers
  /* replaces connection_array */
  export const twoPointers = visual.twoPointers

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
  export const get = visual.get
  export const getAll = visual.getAll
  export const getSelected = visual.getSelected
  export const getSelectedIds = visual.getSelectedIds
  export const getRootVisuals = visual.getRootVisuals
  export const getSelectedRootVisuals = visual.getSelectedRootVisuals
  export const getOnlyLinkSelected = visual.getOnlyLinkSelected
  export const getOnlySelectedAnchorId = visual.getOnlySelectedAnchorId
  export const getSinglePrimitiveIdSelected = visual.getSinglePrimitiveIdSelected
  export const findStartConnections = visual.findStartConnections
  export const findEndConnections = visual.findEndConnections
  export const getParentId = visual.getParentId
  export const getParent = visual.getParent
  export import Name = VisualName
  
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