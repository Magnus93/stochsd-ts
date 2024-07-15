import { Settings } from "../../Settings";
import { appName } from "../appName";
import { BaseFileManager } from "../BaseFileManager";

export class WebFileManagerBasic extends BaseFileManager {
  constructor() {
    super();
    this.softwareName = appName + " Web";
  }
  download(fileName: string, data: any) {
    // Create Blob and attach it to ObjectURL
    var blob = new Blob([data], { type: "octet/stream" }),
      url = window.URL.createObjectURL(blob);

    // Create download link and click it
    var a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    // The setTimeout is a fix to make it work in Firefox
    // Without it, the objectURL is removed before the click-event is triggered
    // And the download does not work
    setTimeout(function () {
      window.URL.revokeObjectURL(url);
      a.remove();
    }, 1);
  }
  saveModel(onFinished?: () => void) {
    let fileData = {} // createModelFileData(); // TODO fix
    this.exportFile(fileData, Settings.fileExtension, () => {
      this.updateSaveTime();
      this.updateTitle();
      // History.unsavedChanges = false; // TODO add back
      onFinished?.()
    });
  }
  exportFile(dataToSave: any, fileExtension: string, onSuccess: (filePath: string) => void) {
    if (onSuccess == undefined) {
      // On success is optoinal, so if it was not set we set it to an empty function
      onSuccess = () => {};
    }

    var fileName = prompt("Filename:", fileExtension);
    if (fileName == null) {
      return;
    }
    const exportFileName = this.appendFileExtension(fileName, fileExtension);
    // Wrapper so that also web application can save files (csv and other)
    this.download(exportFileName, dataToSave);
    if (onSuccess) {
      onSuccess(exportFileName);
    }
  }
  async loadModel() {
    // TODO add back - openFile comes from old Insightmaker API
    /* openFile({
      read: "text",
      multiple: false,
      accept: Settings.fileExtension,
      onCompleted: (model) => {
        this.fileName = model.name;
        //~ this.loadModelData(model.contents);
        //~ this.updateTitle();

        do_global_log("web load file call  back");
        var fileData = model.contents;
        History.forceCustomUndoState(fileData);
        this.updateTitle();
        preserveRestart();
      },
    }); */
  }
}