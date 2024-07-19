import { BaseConnection } from "../BaseConnection";
import { BaseVisual } from "../BaseVisual";
import { OnePointer } from "../OnePointer";
import { TwoPointer } from "../TwoPointer";


/* replaces object_array */
export const onePointers: Record<string, OnePointer> = {}
/* replaces connection_array */
export const twoPointers: Record<string, TwoPointer> = {}

/* replaces get_object */
export function get(id: string): OnePointer | TwoPointer | undefined {
  if (typeof onePointers[id] != "undefined") {
    return onePointers[id];
  }
  if (typeof twoPointers[id] != "undefined") {
    return twoPointers[id];
  }
}

/* replaces get_selected_objects */
export function getSelected() {
  const result: Record<string, BaseVisual> = {}
  for (let key in onePointers) {
    if (onePointers[key].isSelected()) {
      result[key] = onePointers[key];
    }
  }
  for (let key in twoPointers) {
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

/* replaces get_all_objects */
export function getAll() {
  const result: Record<string, BaseVisual> = {}
  for (let key in onePointers) {
    result[key] = onePointers[key];
  }
  for (let key in twoPointers) {
    result[key] = twoPointers[key];
  }
  return result;
}

/* replaces get_only_selected_anchor_id */
export function getOnlySelectedAnchorId() {
  // returns null if more is selected than one anchor is selected, else returns object {parent_id: ... , child_id: ... }
  let selection = getSelected();
  let keys = [];
  for (let key in selection) {
    keys.push(key);
  }
  if (keys.length === 1 && selection[keys[0]].getType() === "dummy_anchor") {
    // only one anchor in selection
    return { "parent_id": getParentId(keys[0]), "child_id": keys[0] };
  } else if (keys.length === 2) {
    if (get(keys[0])?.getType() === "dummy_anchor" && get(keys[1])?.getType() === "dummy_anchor") {
      // both anchors are dummies 
      return null;
    } else if (getParentId(keys[0]) === getParentId(keys[1])) {
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

/* replaces get_root_objects */
export function getRootVisuals() {
  let result: Record<string, BaseVisual> = {}
  let all = getAll();
  for (let key in all) {
    if (key.indexOf(".") == -1) {
      result[key] = all[key];
    }
  }
  return result;
}

/* replaces get_selected_root_objects */
export function getSelectedRootVisuals() {
  let result: Record<string, TwoPointer | OnePointer> = {};
  const all = getAll();
  for (let key in all) {
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
  for (let conn of Object.values(twoPointers)) {
    if (conn instanceof BaseConnection && conn.getStartAttach() == visual) {
      connections.push(conn);
    }
  }
  return connections;
}
/* replaces find_end_connections */
export function findEndConnections(visual: BaseVisual): BaseConnection[] {
  let connections = []
  for (let conn of Object.values(twoPointers)) {
    if (conn instanceof BaseConnection && conn.getEndAttach() == visual) {
      connections.push(conn);
    }
  }
  return connections;
}

/* replaces get_parent_id - used by anchor */
export function getParentId(id: string) {
  return id.toString().split(".")[0]
}
/* replaces get_parent */
export function getParent(child: BaseVisual) {
  return get(getParentId(child.id))
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
  for (let key in selection) {
    keys.push(key);
  }
  let object_ids: { children_ids: string[], parent_id?: string } = { children_ids: [] };
  if (keys.length > 0) {
    object_ids.parent_id = getParentId(keys[0]);
    for (let key of keys) {
      if (getParentId(key) !== object_ids.parent_id) {
        return null;
      } else if (getParentId(key) !== key) {
        object_ids.children_ids.push(key);
      }
    }
    return object_ids;
  }
  return null;
}