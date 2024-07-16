/*

This file may distributed and/or modified under the
terms of the Affero General Public License (http://www.gnu.org/licenses/agpl-3.0.html).

*/
import $ from "jquery"
import { EventListeners } from "./EventListeners";

export namespace Menu {
	export function init() {
		$(".eMenu").each(function() {
			create(this);
		});
		// Hide menu when not clicking on menu button
		$(window).on("click", function(event) {
		  if (!$(event.target).hasClass('menuButton')) {
			$(".menuContent").hide();
		  }
		});
		EventListeners.init()
	}
	function create(menu: HTMLElement) {
		// Toggle the visibility of the menu
		$(menu).find(".menuButton").on("click", function() {
			if($(menu).find(".menuContent").is(":visible")) {
				// Hide all menus
				$(".menuContent").hide();
			} else {
				// Hide all menus
				$(".menuContent").hide();
				// Show the clicked menu
				$(menu).find(".menuContent").show();
			}
		});
	}
}
