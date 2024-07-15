import { applicationReload } from "./applicationReload";
import { appName } from "./appName";

export class BaseFileManager {
  lastSaved: any = null; // TODO fix type
  softwareName = appName;
  // This is executed when the document is ready
  ready() {
    // Override this
    this.updateTitle();
  }
  newModel() {
    localStorage.removeItem("reloadPending");
    this.#fileName = "";
    this.updateTitle();
    applicationReload();
  }
  exportFile(fileData: any, extension: `.${string}`, onSuccess: (filePath: string) => void) {
    // Override this
  }
  /* onFinished replaces this.finishedSaveHandler */
  saveModelAs(onFinished?: () => void) {
    // TODO make saving Model work
    /* 
    let fileData = createModelFileData();
    // Only exportFile is implementation specific (different on nwjs and electron)
    this.exportFile(fileData, Settings.fileExtension, (filePath) => {
      this.fileName = filePath;
      History.unsavedChanges = false;
      this.updateSaveTime();
      this.updateTitle();
      if (this.onFinished) {
        this.onFinished();
      }
    }); 
    */
  }
  hasSaveAs() {
    return false;
  }
  hasRecentFiles() {
    return false;
  }
  saveModel() {
    // Override this
  }
  async loadModel() {
    // Override this
  }
  async init() {
    // Override this
  }
  async clean() {
    // Override this
  }
  setTitle(newTitleRaw: string) {
    // None breaking space
    const nbsp = String.fromCharCode(160);
    // string.replace does not work with char(160) for some reason, so we had to make our own
    let newTitle = "";
    for (var i = 0; i < newTitleRaw.length; i++) {
      let tchar = newTitleRaw.charAt(i);
      if (tchar == " ") {
        newTitle = newTitle + nbsp;
      } else {
        newTitle = newTitle + tchar;
      }
    }
    if (window !== window.top) {
      // In iFrame
      // setParentTitle(newTitle); // TODO add back
    } else {
      // Not in iFrame
      document.title = newTitle;
    }
  }
  loadModelData(modelData: any) {
    // TODO add back
    // History.clearUndoHistory();
    // loadModelFromXml(modelData);
    // // Store an empty state as first state
    // History.storeUndoState();
    // RunResults.resetSimulation();
  }
  updateSaveTime() {
    this.lastSaved = new Date().toLocaleTimeString();
  }
  updateTitle() {
    let title = this.softwareName;
    const nbsp = String.fromCharCode(160);
    if (this.fileName != "") {
      title += "   |   " + this.fileName;
      if (this.lastSaved) {
        title += "   (last saved: " + this.lastSaved + ")";
      }
    }
    this.setTitle(title);
  }
  #fileName = ""
  set fileName(newFileName) {
    if (newFileName == null) {
      newFileName = "";
    }
    this.#fileName = newFileName;
  }
  get fileName() {
    return this.#fileName;
  }
  appendFileExtension(filename: string, extension: string) {
    var extension_position = filename.length - extension.length;
    var current_extension = filename.substring(
      extension_position,
      filename.length
    );
    if (current_extension.toLowerCase() != extension.toLowerCase()) {
      filename += extension;
    }
    return filename;
  }
}