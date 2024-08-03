import { jqDialog } from "./jqDialog";

class XAlertDialog extends jqDialog {
	constructor(public message: string, public closeHandler?: () => void) {
		super();
		this.setTitle("Alert");
		this.setHtml(message);
	}
	afterClose() {
		this.closeHandler?.();
	}
	beforeCreateDialog() {
		this.dialogParameters.buttons = {
			"OK": () => {
				$(this.dialog).dialog('close')
				$(this.dialog).remove()
			}
		};
	}
}
export function xAlert(message: string, closeHandler?: () => void) {
	new XAlertDialog(message, closeHandler).show()
}