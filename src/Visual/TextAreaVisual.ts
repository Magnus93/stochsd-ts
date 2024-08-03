import { CoordRect } from "../CoordRect";
import { Engine } from "../Engine";
import { Mouse } from "../Mouse";
import { SVG } from "../SVG";
import { defaultStroke } from "./default";
import { HtmlTwoPointer } from "./HtmlTwoPointer";

export class TextAreaVisual extends HtmlTwoPointer {
	coordRect!: CoordRect<SVGRectElement>
	htmlElement!: SVG.Foreign
	constructor(public id: string, public type: string, pos0: [number, number], pos1: [number, number]) {
		super(id, type, pos0, pos1);

		this.primitive = Engine.findById(id);

		// this.dialog = new TextAreaDialog(id); // TODO add TextAreaDialog
		// this.dialog.subscribePool.subscribe(()=>{
		// this.render();
		// });
		// this.render();
	}
	updateGraphics() {
		this.htmlElement.setX(this.getMinX());
		this.htmlElement.setY(this.getMinY());
		this.htmlElement.setWidth(this.getWidth());
		this.htmlElement.setHeight(this.getHeight());

		this.coordRect.x1 = this.startX;
		this.coordRect.y1 = this.startY;
		this.coordRect.x2 = this.endX;
		this.coordRect.y2 = this.endY;
		this.coordRect.update();
	}
	makeGraphics() {

		this.coordRect = new CoordRect(
			SVG.rect(this.getMinX(), this.getMinY(), this.getWidth(), this.getHeight(), defaultStroke, "none", "element")
		)

		this.htmlElement = SVG.foreign(this.getMinX(), this.getMinY(), this.getWidth(), this.getHeight(), "Text not rendered yet", "white");

		$(this.htmlElement.cutDiv).mousedown((event) => {
			// This is an alternative to having the htmlElement in the group
			// primitive_mousedown(this.id,event) // TODO add function
			Mouse.downHandler(event)
			event.stopPropagation();
		});

		// Emergency solution since double clicking a ComparePlot or XyPlot does not always work.
		$(this.htmlElement.cutDiv).bind("contextmenu", () => {
			this.doubleClick();
		});

		$(this.htmlElement.cutDiv).dblclick(() => {
			this.doubleClick();
		});

		this.group = SVG.group([this.coordRect.element]);
		this.group.setAttribute("node_id", this.id);

		this.elements = [this.coordRect.element];
		this.elements = [this.htmlElement.contentDiv, this.coordRect.element];
		for (let key in this.elements) {
			this.elements[key].setAttribute("node_id", this.id);
		}
	}
	doubleClick() {
		this.dialog.show();
	}
	render() {
		let newText = Engine.getName(this.primitive!);
		let hideFrame = Engine.getAttribute(this.primitive!, "HideFrame") === "true";
		if (hideFrame && removeSpacesAtEnd(newText).length !== 0) {
			this.coordRect.element.setAttribute("visibility", "hidden");
		} else {
			this.coordRect.element.setAttribute("visibility", "visible");
		}
		// space is replaced with span "&nbsp;" does not work since it does not work with overflow-wrap: break-word
		// Replace <, >, space, new line
		let formattedText = newText
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/ /g, "<span style='display:inline-block; width:5px;'></span>")
			.replace(/\n/g, "<br/>");
		this.updateHTML(formattedText);
	}
	setColor(color: string) {
		super.setColor(color);
		this.htmlElement.style.color = color;
	}
}

function removeSpacesAtEnd(str: string) {
	let value = str;
	while (value[value.length - 1] === " ") {
		value = value.substring(0, value.length - 1);
	}
	return value;
}