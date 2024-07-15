import { BaseEnvironment } from "../BaseEnvironment";
import { WebFileManagerBasic } from "./WebFileManagerBasic";
import { WebFileManagerModern } from "./WebFileManagerModern";


export class WebEnvironment extends BaseEnvironment {
  getName() {
    return "web";
  }
  ready() {
    return null;
    /*
		window.onbeforeunload = (e) => {
			if (this.reloadingStarted) {
				// We never want to complain if we have initialized a reload
				// We only want to complain when the user is closing the page
				return null;
			}
			if (History.unsavedChanges) {
				return 'You have unsaved changes. Are you sure you want to quit?';
			} else {
				return null;
			}
		};
		*/
  }
  getFileManager() {
    // To use modern file api we need showSaveFilePicker
    // and unfortunatly it does not work from file://, so we need a server e.g. npm install -g http-server
    if ((window as any).showSaveFilePicker && location.protocol !== "file:") {
      // Uses modern APIs for file mangement
      return new WebFileManagerModern();
    } else {
      // Uses only file upload and download
      return new WebFileManagerBasic();
    }
  }
}