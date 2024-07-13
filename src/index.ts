import { greet } from './greet';
import $ from "jquery"
// @ts-ignore: Ignore missing type definitions for 'simulation'
import {Model} from "simulation"
import { SVG } from './SVG';
import { ToolBox } from './tools';
import { Mouse } from './Mouse';
import { Menu } from "./Menu"

new Model({})

const message = greet('World');
console.log(message);

$(window).on("load", () => {
  /* $("a").on("click", (e: JQuery.ClickEvent) => {
		let url=e.currentTarget.href;
		console.log(url)
		if(environment.openLink(url)) {			
			e.preventDefault();
		}
  }) */ // TODO make opening links work
	Menu.init();
	SVG.init();
	Mouse.init();
	ToolBox.init();
})
