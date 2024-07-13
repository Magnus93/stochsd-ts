import { Settings } from "../Settings";

let global_log = ""

export function clear_global_log() {
  global_log = "";
	global_log_update();
}

export function global_log_update() {
	let log = "";
	log += "<br/>";
	log += global_log+"<br/>";
	$(".log").html(log);
}

export function do_global_log(line: string) {
	if (Settings.showDebug) {
		global_log = line+"; "+(new Date()).getMilliseconds()+"<br/>"+global_log;
		global_log_update();
	}
}