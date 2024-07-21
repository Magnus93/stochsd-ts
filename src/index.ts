import $ from "jquery"
// @ts-ignore: Ignore missing type definitions for 'simulation'
import { SVG } from './SVG';
import { Tool } from './Tool';
import { Mouse } from './Mouse';
import { Menu } from "./Menu"
import { Env } from './Environment';
import { Components } from "./components";
import { Visual } from "./Visual"

$(window).on("load", () => {
	Components.init()
	Env.init()
	Menu.init()
	SVG.init()
	Mouse.init()
	Tool.init()
	Visual.Controller.Sync.allVisuals()

	// TODO remove openLink, and add special code in the environments that need it.
  $("a").on("click", (e: JQuery.ClickEvent) => { 
		let url=e.currentTarget.href;
		if(Env.environment.openLink(url)) {			
			e.preventDefault();
		}
  })
})
