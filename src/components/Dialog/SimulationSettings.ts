import { formatNumber } from "../../formatNumber";
import { Settings } from "../../Settings";
import { HTMLString } from "../HTMLString";
import { jqDialog } from "./jqDialog";

export class SimulationSettings extends jqDialog {
  startInput!: JQuery<HTMLInputElement>
  lengthInput!: JQuery<HTMLInputElement>
  stepInput!: JQuery<HTMLInputElement>
  warningDiv!: JQuery<HTMLDivElement>
  methodSelect!: JQuery<HTMLSelectElement>
	constructor() {
		super();
		this.setTitle("Simulation Settings");
	}
	beforeShow() {
		let start = 0 // getTimeStart(); // TODO fix
		let length = 0 // getTimeLength(); // TODO fix
		let step = 0 // getTimeStep(); // TODO fix
		let timeUnit = 0 // getTimeUnits(); // TODO fix
		this.setHtml(`
		<table class="modern-table">
		<tr>
			<td>Start Time</td>
			<td style="padding:1px;">
				<input class="input-start enter-apply" name="start" style="width:100px;" value="${start}" type="number">
				&nbsp ${timeUnit} &nbsp
			</td>
		</tr><tr>
			<td>Length</td>
			<td style="padding:1px;">
				<input class="input-length enter-apply" name="length" style="width:100px;" value="${length}" type="number">
				&nbsp ${timeUnit} &nbsp
			</td>
		</tr><tr>
			<td>Time Step</td>
			<td style="padding:1px;">
				<input class="input-step enter-apply" name="step" style="width:100px;" value="${step}" type="number">
				&nbsp ${timeUnit} &nbsp
			</td>
		</tr><tr>
			<td>Method</td>
			<td style="padding:1px;"><select class="input-method enter-apply" style="width:104px">
			<option value="RK1">Euler</option> <!-- // TODO set selected -->
			<option value="RK4">RK4</option> <!-- // TODO set selected -->
			</select></td>
		</tr>
		</table>
		<div class="simulation-settings-warning"></div>
		`);
		
		this.bindEnterApplyEvents();

		this.startInput = $(this.dialogContent).find(".input-start") as JQuery<HTMLInputElement>;
		this.lengthInput = $(this.dialogContent).find(".input-length") as JQuery<HTMLInputElement>;
		this.stepInput = $(this.dialogContent).find(".input-step") as JQuery<HTMLInputElement>;
		this.warningDiv = $(this.dialogContent).find(".simulation-settings-warning") as JQuery<HTMLDivElement>;
		this.methodSelect = $(this.dialogContent).find(".input-method") as JQuery<HTMLSelectElement>;

		this.startInput.keyup(() => this.checkValidTimeSettings());
		this.lengthInput.keyup(() => this.checkValidTimeSettings());
		this.stepInput.keyup(() => this.checkValidTimeSettings());
		this.methodSelect.change(() => this.checkValidTimeSettings());

		this.checkValidTimeSettings();
	}

	checkValidTimeSettings() {
		if (isNaN(Number(this.startInput.val())) || this.startInput.val()?.trim() === "") {
			this.warningDiv.html(HTMLString.warning(`Start <b>${this.startInput.val()}</b> is not a decimal number.`, true));
			return false;
		} else if (isNaN(Number(this.lengthInput.val())) || this.lengthInput.val()?.trim() === "") {
			this.warningDiv.html(HTMLString.warning(`Length <b>${this.lengthInput.val()}</b> is not a decimal number.`, true));
			return false;
		} else if (isNaN(Number(this.stepInput.val())) || this.stepInput.val()?.trim() === "") {
			this.warningDiv.html(HTMLString.warning(`Step <b>${this.stepInput.val()}</b> is not a decimal number.`, true));
			return false;
		} else if (Number(this.lengthInput.val()) <= 0) {
			this.warningDiv.html(HTMLString.warning(`Length must be &gt;0`, true));
			return false;
		} else if (Number(this.stepInput.val()) <= 0) {
			this.warningDiv.html(HTMLString.warning(`Step must be &gt;0`, true));
			return false;
		} else if( Settings.limitSimulationSteps && Number(this.lengthInput.val())/Number(this.stepInput.val()) > 1e5) {
			let iterations = Math.ceil(Number(this.lengthInput.val())/Number(this.stepInput.val()));
			let iters_str = formatNumber(iterations, {use_e_format_upper_limit: 1e5, precision: 3});
			this.warningDiv.html(HTMLString.warning(`
				This Length requires ${iters_str} time steps. <br/>
				The limit is 10<sup>5</sup> time steps per simulation.
			`, true));
			return false;

		}else if( Settings.limitSimulationSteps && Number(this.lengthInput.val())/Number(this.stepInput.val()) > 1e4) {
			let iterations = Math.ceil(Number(this.lengthInput.val())/Number(this.stepInput.val()));
			let iters_str = formatNumber(iterations, {use_e_format_upper_limit: 1e4, precision: 3});
			this.warningDiv.html(HTMLString.note(`
				This Length requires ${iters_str} time steps. <br/>
				More than 10<sup>4</sup> time steps per simulation <br/>
				may significantly slow down the simulation.`
			));
			return true;
		} else if ($(this.methodSelect).find(":selected").val() === "RK4") {
			this.warningDiv.html(HTMLString.note(`
				Do not use RK4 without a good reason, <br/>
				and NEVER if the model contains discontinuities <br/>
				(e.g. <b>Pulse</b>, <b>Step</b> or <b>Random numbers</b>)!
			`));
			return true;
		}

		this.warningDiv.html("");
		return true;
	}

	makeApply() {
		let validSettings = this.checkValidTimeSettings();
		if (validSettings) {
			// setTimeStart(this.startInput.val()); // TODO fix
			// setTimeLength(this.lengthInput.val()); // TODO fix
			// setTimeStep(this.stepInput.val()); // TODO fix
			let method = $(".input-method :selected").val();
			// setAlgorithm(method); // TODO fix
		}
	}
}