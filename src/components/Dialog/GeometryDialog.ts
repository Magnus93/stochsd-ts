import { Engine } from "../../Engine";
import { DisplayDialog } from "./DisplayDialog";

export class GeometryDialog extends DisplayDialog {
	renderStrokeHtml() {
		let strokeWidths = ["1", "2", "3", "4", "5", "6"];
		let primWidth = Engine.getAttribute(this.primitive!, "StrokeWidth");
		return (`
			<table class="modern-table">
				<tr>
					<td>Line Width: </td>
					<td>
						<select class="width-select enter-apply">
						${strokeWidths.map(w => (`
							<option value="${w}" ${primWidth === w ? "selected" : ""}>${w}</option>
						`))}
						</select>
					</td>
				</tr>
				<tr>
					<td>Dashes: </td>
					<td>
						<select class="dash-select enter-apply">
						<option value="" 	${Engine.getAttribute(this.primitive!, "StrokeDashArray") === "" ? "selected" : ""}	 >––––––</option>
						<option value="8 4" ${Engine.getAttribute(this.primitive!, "StrokeDashArray") === "8 4" ? "selected" : ""}>– – – –</option>
						</select>
					</td>
				</tr>
			</table>
		`);
	}

	beforeShow() {
		this.setHtml(`<div>${this.renderStrokeHtml()}</div>`);
		this.bindEnterApplyEvents();
	}
	makeApply() {
		let dashArray = $(this.dialogContent).find(".dash-select :selected").val() as string
		let strokeWidth = $(this.dialogContent).find(".width-select :selected").val() as string
		Engine.setAttribute(this.primitive!, "StrokeDashArray", dashArray);
		Engine.setAttribute(this.primitive!, "StrokeWidth", strokeWidth);
	}
}