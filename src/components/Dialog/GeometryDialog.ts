import { DisplayDialog } from "./DisplayDialog";

export class GeometryDialog extends DisplayDialog {
	renderStrokeHtml() {
		let strokeWidths = ["1", "2", "3", "4", "5", "6"];
		let primWidth = this.primitive.getAttribute("StrokeWidth");
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
						<option value="" 	${this.primitive.getAttribute("StrokeDashArray") === "" ? "selected" : ""}	 >––––––</option>
						<option value="8 4" ${this.primitive.getAttribute("StrokeDashArray") === "8 4" ? "selected" : ""}>– – – –</option>
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
		let dashArray = $(this.dialogContent).find(".dash-select :selected").val();
		let strokeWidth = $(this.dialogContent).find(".width-select :selected").val();
		this.primitive.setAttribute("StrokeDashArray", dashArray);
		this.primitive.setAttribute("StrokeWidth", strokeWidth);
	}
}