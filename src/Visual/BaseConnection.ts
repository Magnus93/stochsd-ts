import { Engine, Flow, Link } from "../Engine/index.js";
import { BaseVisual } from "./BaseVisual";
import { StockVisual } from "./StockVisual.js";
import { TwoPointer } from "./TwoPointer";

export class BaseConnection extends TwoPointer {
  positionUpdateHandler: () => void
  constructor(public id: string, public type: string, pos0: [number, number], pos1: [number, number]) {
    super(id, type, pos0, pos1);
    this.positionUpdateHandler = () => {
      const primitive = Engine.findById(this.id) as Flow | Link
      const sourcePoint = Engine.getStartPosition(primitive)
      const targetPoint = Engine.getEndPosition(primitive)
      this.startAnchor.setPosition(sourcePoint);
      this.endAnchor.setPosition(targetPoint);
      alert("Position got updated");
    }
  }

  isAcceptableStartAttach(attachVisual: BaseVisual) {
    // function to decide if attachVisual is OK allowed to attach start to 
    return false;
  }
  isAcceptableEndAttach(attachVisual: BaseVisual) {
    return false;
  }
  protected _startAttach?: BaseVisual
  setStartAttach(newStartAttach: BaseVisual | undefined) {
    if (newStartAttach != null && this.getEndAttach() == newStartAttach) {
      return;		// Will not attach if other anchor is attached to same
    }
    if (newStartAttach != null && this.isAcceptableStartAttach(newStartAttach) === false) {
      return; 	// Will not attach if not acceptable attachType
    }

    // Update the attachment primitive
    this._startAttach = newStartAttach;

    let sourcePrimitive = null;
    if (this._startAttach != null) {
      sourcePrimitive = Engine.findById(this._startAttach.id)
    }
    (this.primitive as Flow | Link).start = sourcePrimitive

    // Trigger the attach event on the new attachment primitives
    this.triggerAttachEvents();
  }
  getStartAttach() {
    return this._startAttach;
  }
  protected _endAttach?: BaseVisual
  setEndAttach(newEndAttach: BaseVisual | undefined) {
    if (newEndAttach != null && this.getStartAttach() == newEndAttach) {
      return; 	// Will not attach if other anchor is attached to same 
    }
    if (newEndAttach != null && this.isAcceptableEndAttach(newEndAttach) === false) {
      return;		// Will not attach if not acceptable attachType
    }

    // Update the attachment primitive
    this._endAttach = newEndAttach;
    let targetPrimitive = null;
    if (this._endAttach != null) {
      targetPrimitive = Engine.findById(this._endAttach.id);
    }
    (this.primitive as Flow | Link).end = targetPrimitive

    // Trigger the attach event on the new attachment primitives
    this.triggerAttachEvents();
  }
  getEndAttach() {
    return this._endAttach;
  }
  triggerAttachEvents() {
    // We must always trigger both start and end, since a change in the start might affect the logics of the primitive attach at the end of a link or flow
    this.getStartAttach()?.attachEvent();
    this.getEndAttach()?.attachEvent();
  }
  clean() {
    this.triggerAttachEvents();
    super.clean();
  }
  updateGraphics() {

  }
}