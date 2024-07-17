import { defaultStroke } from "./default";
import { SVG } from "../SVG";
import { DefinitionError } from "../DefinitionError";
import { do_global_log, errorPopUp } from "../debug";
import { VisualController } from "../VisualController";

export class BaseVisual {
  selected = false
  nameRadius: number = 30;
  color = defaultStroke
  primitive: any // TODO fix
  elements: Element[]
  selectorElements: Element[] // Elements visible when selected
  nameElement?: SVGTextElement
  icons?: SVG.Icons
  group?: SVGGElement
  namePositions: [number, number][]
  isGhost = false
	constructor(public id: string, public type: string, pos: [number, number]) {
		this.color = defaultStroke;
		// Warning: this.primitive can be null, since all DIM objects does not have a IM object such as anchors and flow_auxiliarys
		// We should therefor check if this.primitive is null, in case we dont know which class we are dealing with
		// this.primitive = findID(this.id); // TODO 
		
		this.elements = [];
		this.selectorElements = [];
		this.icons; 	// svg group with icons such as ghost and questionmark
		this.group;
		this.namePositions = [[0, this.nameRadius+8], [this.nameRadius, 0], [0, -this.nameRadius], [-this.nameRadius, 0]];
	}

	setColor(color: string) {
		this.color = color;
		for (let element of this.elements) {
			if (element.getAttribute("class") == "element") {
				element.setAttribute("stroke", this.color);
			} else if(element.getAttribute("class") == "name_element") {
				element.setAttribute("fill", this.color);
			} else if(element.getAttribute("class") == "highlight") {
				element.setAttribute("fill", this.color);
			}
		}
		if (this.primitive) {
			// AnchorPoint has no primitve
			this.primitive.setAttribute("Color", this.color);
		}
	}

	updateDefinitionError() {
		let definitionErrorTypes = ["stock", "variable", "constant", "flow", "converter"];
		if (definitionErrorTypes.includes(this.type)) {
			DefinitionError.check(this.primitive);
			DefinitionError.has(this.primitive);
		}
	}

	getBoundRect() {
		// Override this function
		// This functions returns a hash map, e.i. {"minX": 10, "maxX": 20, "minY": 40, "maxY": 50}
		// The hashmap dictates in what rect mouse can click to create connections
	}

  getPosition() {
    // Override this function
    return [0, 0]
  }

	getLinkMountPos(closeToPoint: [number, number]) {
		return this.getPosition();
	}
	
	isSelected() {
		return this.selected;
	}
	select() {
		this.selected = true
	}
	unselect() {
		this.selected = false
	}

	clean() {
    // TODO fix
		// // Clean all children
		// let children = getChildren(this.id);
		// for(let id in children) {
		// 	children[id].clean();
		// 	delete object_array[id];
		// }
		
		// this.clearImage();
	}
	clearImage() {
		// Do the cleaning
		for(let i in this.selectorElements) {
			this.selectorElements[i].remove();
		}
		for(let key in this.elements) {
			this.elements[key].remove();
		}
		this.group?.remove();
	}
	doubleClick(id: string) {
		// This function has to be overriden
	}
	afterNameChange() {
		// Do nothing. this method is supposed to be overriden by subclasses
	}
	afterMove(diffX: number, diffY: number) {
		// Override this		
	}
	attachEvent() {
		// This happens every time a connection is connected or disconnected
		// Or when the connections starting point is connected or disconnected
		// Override this
	}
  /* replaces name_pos */
  #namePositionIndex: number = 0
	get namePositionIndex(): number {
		return this.namePositionIndex
	}
	
	set namePositionIndex(value: number) {
		//~ alert("name pos for "+this.id+" "+getStackTrace());
		//~ do_global_log("updating name pos to "+value);
		this.namePositionIndex = Number(value);
    // TODO fix
		// if (this.primitive) {
		// 	this.primitive.setAttribute("RotateName", value.toString());
		// }
	}
	getType() {
		return this.type;
	}
	nameDoubleClick() {
					
		if (this.isGhost) {
			errorPopUp("You must rename a ghost by renaming the original.");
			return;
		}
		let id = VisualController.getParentById(this.id)
		// definitionEditor.open(id, ".name-field"); // TODO implement definition editor
		// event.stopPropagation(); // TODO is this needed?
	}
	
	setName(value: string) {
			if (this.nameElement == null) {
				do_global_log("Element has no name");
				return;
			}
			this.nameElement.innerHTML = value;
	}
	
	attributeChangeHandler(attributeName: string, value: string) {
		// Override this
	}
}