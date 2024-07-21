import { Engine } from "../../Engine/index";
import { deletePrimitive } from "../../utility";
import * as visual from "./get";
import { Name as VisualName } from "./Name"
import { Update as VisualUpdate } from "./Update"
import { Selection as VisualSelection } from "./Selection"
import { Sync as VisualSync } from "./Sync";

export namespace Controller {
  /* replaces object_array */
  export const onePointers = visual.onePointers
  /* replaces connection_array */
  export const twoPointers = visual.twoPointers

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
  export const getChildren = visual.getChildren
  export import Name = VisualName
  export import Update = VisualUpdate
  export import Selection = VisualSelection
  export import Sync = VisualSync
  
  /* replaces rel_move */
  export function relativeMove(node_id: string ,diff_x: number, diff_y: number) {
    let primitive = Engine.Primitives.findById(node_id);
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