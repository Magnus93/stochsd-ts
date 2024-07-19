import { onePointers, twoPointers } from "./get";

export namespace Update {
  /* replaces update_all_objects */
  export function all() {
    for(let key in onePointers) {
      onePointers[key].update();
    }
    for(let key in twoPointers) {
      twoPointers[key].update();
    }
  }

  /* replaces update_relevant_objects */
  export function relevant(ids: string[]) {
    for(let key in onePointers) {
      // dont update dummy_anchors, the twopointer parent of the dummy anchor has responsibility of the dummy_anchors 
      if (onePointers[key].type !== "dummy_anchor") {
        onePointers[key].update();
      }
    }
    relevantTwoPointers(ids);
  }
  // only updates diagrams, tables, and XyPlots if needed 
  /* replaces update_twopointer_objects */
  export function relevantTwoPointers(ids: string[]) {
    for(let key in twoPointers) {
      let onlyIfRelevant = ["timeplot", "xyplot", "compareplot", "histoplot", "table"]
      if( onlyIfRelevant.includes(twoPointers[key].type) ) {
        if (ids.includes(key)) {
          twoPointers[key].update()
        }
      } else {
        twoPointers[key].update()
      }
    }
  }
}