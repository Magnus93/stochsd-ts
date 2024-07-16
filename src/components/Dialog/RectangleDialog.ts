import { GeometryDialog } from "./GeometryDialog";

export class RectangleDialog extends GeometryDialog {
	beforeShow() {
		this.setTitle("Rectangle Properties");
		super.beforeShow();
	}
}