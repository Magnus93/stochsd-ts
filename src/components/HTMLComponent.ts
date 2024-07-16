import { DisplayDialog } from "./Dialog/DisplayDialog";

export class HTMLComponent {
  componentId = "component-"+Math.ceil(Math.random()*(2**32)).toString(16)
  primitive: any // TODO fix type
	constructor(public parent: DisplayDialog) {
		this.primitive = parent.primitive;
	}
	find(selector: string) {
		return $(this.parent.dialogContent).find(selector);
	}
	render() { return "<p>EmptyComponent</p>"; }
	bindEvents() {}
	applyChange() {}
}