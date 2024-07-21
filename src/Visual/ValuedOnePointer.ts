import { Controller } from "./Controller";
import { OnePointer } from "./OnePointer";

/* Replaces BasePrimitive */
export class ValuedOnePointer extends OnePointer {
	constructor(public id: string, type: string, public position: [number, number], extras: any) {
		super(id, type, position, extras);
	}
	doubleClick() {
		// openPrimitiveDialog(VisualController.getParentId(this.id)); // TODO add PrimitiveDialog
	}
}