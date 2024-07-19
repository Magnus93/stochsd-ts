import { onePointers, twoPointers } from "./get";

export namespace Selection {
    /* replaces unselect_all */
    export function unselectAll() {
      for(let key in onePointers) {
        onePointers[key].unselect();
      }
      for(let key in twoPointers) {
        twoPointers[key].unselect();
      }
    }
    /* replaces unselect_all_other_anchors */
    export function allOtherAnchors(parentId: string, childIdToSelect: string) {
      unselectAll();
      let parent = twoPointers[parentId];
      parent.select();
      for(let anchor of parent.getAnchors()) {
        if (anchor.id !== childIdToSelect) {
          anchor.unselect();
        }
      }
    }
    /* replaces unselect_all_but */
    export function unselectAllExcept(dont_unselect_id: string) {
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
}