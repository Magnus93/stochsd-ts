import { formatNumber } from "../formatNumber";
import { SVG } from "../SVG";
import { VisualController } from "./Controller";
import { defaultFill } from "./default";
import { ValuedOnePointer } from "./ValuedOnePointer";

export class NumberboxVisual extends ValuedOnePointer {
	element!: SVGRectElement
	runHandler: () => void
	constructor(public id: string, public type: string, public position: [number, number], extras?: any) {
		super(id, type, position, extras);
		this.nameCentered = true;
		VisualController.updateNamePos(id);
		this.setSelectionSizeToText();
		
		this.runHandler = () => {
			this.render();
		}
		// RunResults.subscribeRun(id, this.runHandler); // TODO Add RunResults

		// this.dialog = new NumberboxDialog(this.id); // TODO add NumberboxDialog
		// this.dialog.subscribePool.subscribe(()=>{
		// 	this.render();
		// });
	}
	setSelectionSizeToText() {
		let boundingRect = this.nameElement!.getBoundingClientRect();
		let elementRect = this.elements[0];
		let selectorRect = this.selectorElements[0];
		let marginX = 10;
		let marginY = 2;
		for(let rect of [elementRect,selectorRect]) {
			rect.setAttribute("width", `${boundingRect.width+marginX*2}`)
			rect.setAttribute("height", `${boundingRect.height+marginY*2}`)
			rect.setAttribute("x", `${-boundingRect.width/2-marginX}`)
			rect.setAttribute("y", `${-boundingRect.height/2-marginY}`)
		}
	}
	render() {
		if (this.targetID == null) {
			this.nameElement!.innerHTML = "&mdash;";
			this.setSelectionSizeToText();
			return;		
		}
		let valueString = "";
		let lastValue: number | undefined = undefined // = RunResults.getLastValue(this.targetID) // TODO add RunResults
		if (lastValue || lastValue === 0) {
			let roundToZero = this.primitive.getAttribute("RoundToZero");
			let roundToZeroAtValue = -1;
			if (roundToZero === "true") {
				roundToZeroAtValue = this.primitive.getAttribute("RoundToZeroAtValue");
				if (isNaN(roundToZeroAtValue)) {
					roundToZeroAtValue = 0 // getDefaultAttributeValue("numberbox", "RoundToZeroAtValue") // TODO add getDefaultAttributeValue
				} else {
					roundToZeroAtValue = Number(roundToZeroAtValue);
				}
			}
			let number_length = JSON.parse(this.primitive.getAttribute("NumberLength"));
			let number_options = {
				"round_to_zero_limit": roundToZeroAtValue, 
				"precision": number_length["usePrecision"] ? number_length["precision"] : undefined,
				"decimals": number_length["usePrecision"] ? undefined : number_length["decimal"]
			};
			valueString = formatNumber(lastValue, number_options);
		} else {
			valueString += "_";
		}
		let output = `${valueString}`;
		this.nameElement!.innerHTML = output;
		this.setSelectionSizeToText();

		// update color in case hide frame changes 
		this.setColor(this.color);

	}
	get targetID() {
		return Number(this.primitive.getAttribute("Target"));
	}
	set targetID(newTargetID) {
		this.primitive.setAttribute("Target",newTargetID);
		this.render();
	}
	afterNameChange() {
		this.setSelectionSizeToText();
	}
	getImage() {
		this.element = SVG.rect(-20,-15,40,30, this.color, defaultFill, "element");
		return [
			this.element,
			SVG.rect(-20,-15,40,30, "none", this.color, "highlight"),
			SVG.text(0,0, "", "name_element",{"alignment-baseline": "middle", "style": "font-size: 16px", "fill": this.color}),
		];	
	}
	setColor(color: string) {
		super.setColor(color);
		if (this.selected) {
			this.nameElement!.setAttribute("fill", "white");
		}
		let frameColor = this.primitive.getAttribute("HideFrame") === "true" ? "transparent" : color;
		this.element.setAttribute("stroke", frameColor);
	}
	select() {
		super.select();
		this.nameElement!.setAttribute("fill", "white");
	}
	unselect() {
		super.unselect();
		this.nameElement!.setAttribute("fill", this.color);
	}
	nameDoubleClick() {
		// Override this function
		// Do nothing - otherwise double clicked is called twice 
	}
	doubleClick() {
		// this.dialog.show(); // TODO add Dialog
	}
}