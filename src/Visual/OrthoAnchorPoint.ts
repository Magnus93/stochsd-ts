import { AnchorPoint } from "./AnchorPoint";
import { AnchorType } from "./AnchorType";

export class OrthoAnchorPoint extends AnchorPoint {
  changed = true
	constructor(public id: string, public type: string, public pos: [number, number], public anchorType: AnchorType, public index: number) {
		super(id, type, pos, anchorType)
	}
}