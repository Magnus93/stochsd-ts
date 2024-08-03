import { HTMLComponent } from "../../HTMLComponent";
import { jqDialog } from "../jqDialog";
import { SubscribePool } from "./SubscribePool";
import { Engine, Primitive } from "../../../Engine";

// This is the super class dor ComparePlotDialog and TableDialog
export class DisplayDialog extends jqDialog {
	primitive: Primitive
	displayIdList: string[] = [];
	subscribePool = new SubscribePool();
	acceptedPrimitiveTypes = ["Stock", "Flow", "Variable", "Converter"];
	displayLimit = undefined;
	components: HTMLComponent[][] = [];
	constructor(id: string) {
		super();
		this.primitive = Engine.findById(id)
		this.displayLimit = undefined;
		this.components = [];
	}
	getDefaultPlotPeriod() {
		return 1 // getTimeStep(); // TODO
	}
	clearRemovedIds() {
		for (let id of this.displayIdList) {
			if (!Engine.findById(id)) {
				this.setDisplayId(id, false);
			}
		}
	}
	getAcceptedPrimitiveList() {
		return Engine.model.find(
			(p: Primitive) => this.acceptedPrimitiveTypes.includes(Engine.getNodeName(p)) && this.acceptsId(p.id)
		)
	}
	acceptsId(id: string) {
		let type: string = Engine.getNodeName(Engine.findById(id))
		return (this.acceptedPrimitiveTypes.indexOf(type) != -1);
	}
	removeIdToDisplay(id: string) {
		let idxToRemove = this.displayIdList.indexOf(id);
		idxToRemove !== -1 && this.displayIdList.splice(idxToRemove, 1);
	}
	addIdToDisplay(id: string) {
		let index = this.displayIdList.indexOf(id)
		index === -1 && this.displayIdList.push(id)
	}
	setDisplayId(id: string, value: boolean) {
		let oldIdIndex = this.displayIdList.indexOf(id);
		switch (value) {
			case true:
				// Check that the id can be added
				if (!this.acceptsId(id)) {
					return;
				}
				// Check if id already in this.displayIdList
				if (oldIdIndex != -1) {
					return;
				}
				// Add the value
				this.displayIdList.push(id.toString());

				break;
			case false:
				// Check if id is not in the list
				if (oldIdIndex == -1) {
					return;
				}
				this.displayIdList.splice(oldIdIndex, 1);
				break;
		}
	}
	getDisplayId(id: string) {
		id = id.toString();
		return this.displayIdList.indexOf(id) != -1
	}
	setIdsToDisplay(idList: string[]) {
		this.displayIdList = [];
		idList.forEach((id) => this.setDisplayId(id, true))
	}
	getIdsToDisplay() {
		this.clearRemovedIds();
		return this.displayIdList;
	}
	afterClose() {
		this.subscribePool.publish("window closed");
	}
	makeApply() {
		this.components.forEach(column => column.forEach(component => component.applyChange()));
	}
	beforeShow() {
		this.setHtml(`<div class="table">
			<div class="table-row">
				${this.components.map(column => `<div class="table-cell">
					${column.map(component => component.render()).join(`<div class="vertical-space"></div>`)}
				</div>`).join("")}
			</div>
		</div>`);
		this.components.forEach(column => column.forEach(component => component.bindEvents()));
		this.bindEnterApplyEvents();
	}
}