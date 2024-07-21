import { do_global_log } from "../debug";
import { DefinitionError } from "../DefinitionError";
import { Engine } from "../Engine";
import { SVG } from "../SVG";
import { hasRandomFunction } from "../utility";
import { Controller } from "./Controller";
import { BaseVisual } from "./BaseVisual";


export class OnePointer extends BaseVisual {
  draggable: boolean
  nameCentered = false
  changeAttributeHandler: (attr: string, value: string) => void // TODO remove?
	constructor(public id: string, public type: string, public position: [number, number], extras?: { isGhost?: true }) {
		super(id, type, position);
		Controller.onePointers[id] = this;
		this.elements = [];
		this.selectorElements = [];
		this.group;
		this.draggable = true; // Default value, change it afterwords if you want
		this.isGhost = !!extras?.isGhost; // Default value
		do_global_log("is ghost "+this.isGhost);

		this.loadImage();

		this.select();
		
		// Handled for when attribute changes in corresponding SimpleNode - Ghost specific // TODO remove this and only have for ghost?
		this.changeAttributeHandler = (attribute: string, value: string) => {
			if (attribute == "name") {
				this.setName(value);
			}
		}
	}

	getBoundRect() {
		let [x, y] = this.getPos();
		return {"minX": x-10, "maxX": x+10, "minY": y-10, "maxY": y+10};
	}

	setPosition(position: [number, number]) {
		if (position[0] == this.position[0] && position[1] == this.position[1]) {
			// If the position has not changed we should not update it
			// This turned out to be a huge optimisation
			return;
		}
		// Recreating the array is intentional to avoid copying a reference
		//~ alert(" old pos "+this.pos[0]+","+this.pos[1]+" new pos "+pos[0]+","+pos[1]);
		this.position = [position[0], position[1]];
	}
		
	getPos(): [number, number] {
		// This must be done by splitting up the array and joining it again to avoid sending a reference
		// Earlier we had a bug that was caused by getPos was sent as reference and we got unwanted updates of the values
		return [this.position[0], this.position[1]];
	}


	loadImage() {
		let elements = this.getImage();
		if (elements.length == 0) {
			alert("getImage() must be overriden to add graphics to this object");
		}
		
		this.elements = elements;
		
		for(let key in elements) {
			if (elements[key].getAttribute("class") == "highlight") {
				this.selectorElements.push(elements[key]);
			}
		}
		
		for (let key in elements) {
			if (elements[key].getAttribute("class") == "icons") {
				this.icons = this.elements[key] as SVG.Icons
				break;
			}
		}
		
		if (this.isGhost && this.icons) {
			this.icons.set("ghost", "visible");
		}
		
			
		// Set name element
		this.nameElement
		for(let key in elements) {
			if (elements[key].getAttribute("class") == "name_element") {
				this.nameElement = elements[key] as SVGTextElement;
				$(this.nameElement).on("dblclick", () => {
					this.nameDoubleClick();
				});
			}
		}
		this.group = SVG.group(this.elements);
		this.group.setAttribute("class", "testgroup");
		this.group.setAttribute("node_id", this.id);
		
		this.update();

		for(let key in this.elements) {
			let element = this.elements[key];
			$(element).on("mousedown",(event) => {
				// primitive_mousedown(this.id, event); // TODO add this function
			});
		}
		$(this.group).on("dblclick", (event) => {
			if (!$(event.target).hasClass("name_element")) {
				this.doubleClick(this.id);
			}
		});
	}
	
	select() {
		this.selected = true;
		for(let i in this.selectorElements) {
			this.selectorElements[i].setAttribute("visibility", "visible");
		}
		if (this.icons) {
			this.icons.setColor("white");
		}
	}
	unselect() {
		this.selected = false;
		for(let i in this.selectorElements) {
			this.selectorElements[i].setAttribute("visibility", "hidden");
		}
		if (this.icons) {
			this.icons.setColor(this.color);
		}
	}
	update() {
		this.group!.setAttribute("transform", "translate("+this.position[0]+","+this.position[1]+")");
		
		let prim = this.isGhost ? Engine.Primitives.findById(Engine.Primitives.getAttribute(this.primitive!, "Source")) : this.primitive
		if (this.icons && prim) {
			const hasDefError = DefinitionError.has(prim);
			this.icons.set("questionmark", hasDefError ? "visible" : "hidden");
			this.icons.set("dice", ( ! hasDefError && hasRandomFunction(Engine.Primitives.getDefinition(prim) ?? "")) ? "visible" : "hidden");
		}

		if ( ! this.isGhost) {
			this.updateGhosts();
		}
	}
	updateGhosts() {
		let ghostIds = Engine.Primitives.findGhostsOfPrimitive(this.id);
		ghostIds.map(gId => { 
			if (Controller.onePointers[gId]) {
				Controller.onePointers[gId].update(); 
			}
		});
	}
	updatePosition() {
		this.update();
	}
	getImage(): Element[] {
		return [];
	}
}