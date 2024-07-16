import { Dialog } from "../components";

export namespace EventListeners {
  export function init() {
    // $("#btn_file").click(async function() {
    // 	await updateRecentsMenu();
    // });
    // $("#btn_new").click(function() {
    // 	saveChangedAlert(function() {
    // 		fileManager.newModel();
    // 	});
    // });	
    // $("#btn_load").click(function() {
    // 	saveChangedAlert(function() {
    // 		fileManager.loadModel();
    // 	});
    // });
    // $("#btn_save").click(function() {
    // 	History.storeUndoState();
    // 	fileManager.saveModel();
    // });
    // $("#btn_save_as").click(function() {
    // 	History.storeUndoState();
    // 	fileManager.saveModelAs();
    // });
    // $("#btn_recent_clear").click(function() {
    // 	yesNoAlert("Are you sure you want to clear Recent List?", (answer) => {
    // 		if (answer === "yes") {
    // 			fileManager.clearRecent();
    // 		}
    // 	});
    // });
    $("#btn_simulation_settings").on("click", () => {
    	Dialog.simulationSettings.show();
    });
    // $("#btn_equation_list").click(function() {
    // 	equationList.show();
    // });
    // $("#btn_print_model").click(function() {
    // 	printDiagram();
    // });
    // $("#btn_black").click(function() {
    // 	setColorToSelection("black");
    // });
    // $("#btn_grey").click(function() {
    // 	setColorToSelection("silver");
    // });
    // $("#btn_red").click(function() {
    // 	setColorToSelection("red");
    // });
    // $("#btn_deeppink").click(function() {
    // 	setColorToSelection("deeppink");
    // });
    // $("#btn_brown").click(function() {
    // 	setColorToSelection("brown");
    // });
    // $("#btn_orange").click(function() {
    // 	setColorToSelection("orange");
    // });
    // $("#btn_gold").click(function() {
    // 	setColorToSelection("gold");
    // });
    // $("#btn_olive").click(function() {
    // 	setColorToSelection("olive");
    // });
    // $("#btn_green").click(function() {
    // 	setColorToSelection("green");
    // });
    // $("#btn_teal").click(function() {
    // 	setColorToSelection("teal");
    // });
    // $("#btn_blue").click(function() {
    // 	setColorToSelection("blue");
    // });
    // $("#btn_purple").click(function() {
    // 	setColorToSelection("purple");
    // });
    // $("#btn_magenta").click(function() {
    // 	setColorToSelection("magenta");
    // });
    // $("#btn_macro").click(function() {
    // 	macroDialog.show();
    // });
    // $("#btn_debug").click(function() {
    // 	debugDialog.show();
    // });
    // $("#btn_about").click(function() {
    // 	aboutDialog.show();
    // });
    // $("#btn_preferences").click(function() {
    // 	preferencesDialog.show();
    // });
    // $("#btn_fullpotentialcss").click(function () {
    // 	fullpotentialcssDialog.show();
    // });
    // $("#btn_license").click(function() {
    // 	licenseDialog.show();
    // });
    // $("#btn_thirdparty").click(function() {
    // 	thirdPartyLicensesDialog.show();
    // });
    // $("#btn_restart").click(function() {
    // 	saveChangedAlert(function() {
    // 		applicationReload();
    // 	});
    // });
    // $("#btn_preserve_restart").click(function() {
    // 	preserveRestart();
    // });
    // $(".btn_load_plugin").click((event) => {
    // 	let pluginName = $(event.target).data("plugin-name");
    // 	loadPlugin(pluginName);
    // });
    // $("#btn_timeunit").click(function() {
    // 	timeUnitDialog.show();
    // })
    // if (fileManager.hasSaveAs()) {
    // 	$("#btn_save_as").show();
    // }
    // if (fileManager.hasRecentFiles()) {
    // 	for (let i = 0; i < Settings.MaxRecentFiles; i++) {
    // 		$(`#btn_recent_${i}`).click(async function(event) {
    // 			saveChangedAlert(async function () {
    // 				let recentIndex = parseInt(event.currentTarget.getAttribute("data-recent-index"));
    // 				await fileManager.loadRecentByIndex(recentIndex);
    // 				setTimeout(() => {
    // 					updateTimeUnitButton();
    // 					InfoBar.update();
    // 				 },200);
    // 			});
    // 		});
    // 	}
    // }
  }
}