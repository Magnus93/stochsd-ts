import { SVG } from "../SVG";
import { TwoPointer } from "./TwoPointer";

export class HtmlTwoPointer extends TwoPointer {
	htmlElement!: SVG.Foreign | SVG.ForeignScrollable
	updateHTML(html: string) {
		this.htmlElement.contentDiv.innerHTML = html;
	}
	clean() {
		super.clean();
		this.htmlElement.remove();
	}
}