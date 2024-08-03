import { Settings } from "../../Settings";
import { appName } from "../appName";
import { BaseFileManager } from "../BaseFileManager";
import * as idbKeyval from "idb-keyval";

export class WebFileManagerModern extends BaseFileManager {
  fileHandle?: FileSystemFileHandle
  constructor() {
    super();
    this.softwareName = appName + " Web";
    this.fileHandle = undefined;
  }

  async init() {
    this.fileHandle = await idbKeyval.get('fileHandle');
  }

  async clean() {
    await idbKeyval.del('fileHandle');
  }

  hasSaveAs() {
    return true;
  }

  hasRecentFiles() {
    return true;
  }
  async getRecentDisplayList() {
    let recentFiles: FileSystemFileHandle[] = await this.getRecentFiles();
    return recentFiles.map((fileHandle: FileSystemFileHandle) => fileHandle.name);
  }
  async getRecentFiles(): Promise<FileSystemFileHandle[]> {
    let recentFiles: FileSystemFileHandle[];
    try {
      recentFiles = await idbKeyval.get<FileSystemFileHandle[]>("recentFiles") ?? []
    } catch {
      recentFiles = [];
    }
    return recentFiles;
  }
  async setRecentFiles(recentFiles: any[]) { // TODO fix type
    idbKeyval.set("recentFiles", recentFiles);
  }
  async clearRecent() {
    idbKeyval.set("recentFiles", []);
  }

  async removeDuplicatesFromRecent(fileHandle: any, recentFiles: any[]) {
    let newRecentFiles = []
    for (let i in recentFiles) {
      if (!await recentFiles[i].isSameEntry(fileHandle)) {
        newRecentFiles.push(recentFiles[i]);
      }
    }
    return newRecentFiles;
  }

  async addToRecent() {
    let limit = Settings.MaxRecentFiles;

    let recentFiles = await this.getRecentFiles();

    recentFiles = await this.removeDuplicatesFromRecent(this.fileHandle, recentFiles);

    if (recentFiles.length <= limit) {
      recentFiles.splice(limit - 1);
    }
    recentFiles.unshift(this.fileHandle!);
    await this.setRecentFiles(recentFiles);
  }
  async loadRecentByIndex(recentFileIndex: number) {
    const recentFiles = await this.getRecentFiles();
    const fileHandle = recentFiles[recentFileIndex];
    await this.loadFromFileHandle(fileHandle);
  }

  getFilePickerOptions() {
    return {
      suggestedName: "model.ssd",
      types: [
        {
          description: "StochSD Models",
          accept: {
            "text/stochsd": [".ssd"],
          },
        },
      ],
    };
  }

  async chooseFilename() {
    // Based on Chromes new file management API
    // https://web.dev/file-system-access/
    // So far only supported by Chromium based browsers, such as Chrome, Chromium and Edge

    const options = this.getFilePickerOptions();
    this.fileHandle = await (window as any).showSaveFilePicker(options) as FileSystemFileHandle;
    this.fileName = this.fileHandle.name;
  }
  async writeToFile(contents: any) {
    const writable = await this.fileHandle!.createWritable();
    await writable.write(contents);
    await writable.close();
  }

  async updateUIAfterSave(onFinished?: () => void) {
    this.updateSaveTime();
    this.updateTitle();
    // History.unsavedChanges = false; // TODO add back
    onFinished?.()
  }

  async saveModelAs() {
    let contents = {} // createModelFileData(); // TODO add back
    try {
      await this.chooseFilename();
      await this.writeToFile(contents);
      await this.addToRecent();
      await this.updateUIAfterSave();
    } catch (e) {
      // Canceled
    }
  }

  async saveModel() {
    let contents = {} // createModelFileData(); // TODO fix
    if (this.fileHandle == undefined) {
      await this.saveModelAs();
      return;
    }
    await this.writeToFile(contents);
    await this.addToRecent();
    await this.updateUIAfterSave();
  }
  async loadModel() {
    const options = this.getFilePickerOptions();
    const [tmpFileHandle] = await (window as any).showOpenFilePicker(options) as FileSystemFileHandle[];
    await this.loadFromFileHandle(tmpFileHandle);
  }

  async verifyPermission(fileHandle: FileSystemHandle, withWrite: boolean) {
    // Re-asking for permissions needed after page reload.
    // See:
    // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/requestPermission
    // https://stackoverflow.com/questions/66500836/domexception-the-request-is-not-allowed-by-the-user-agent-or-the-platform-in-th
    const opts: { mode?: "read" | "readwrite" } = {};
    if (withWrite) {
      opts.mode = 'readwrite';
    }

    // Check if we already have permission, if so, return true.
    if (await (fileHandle as any).queryPermission(opts) === 'granted') { // TODO remove any
      return true;
    }

    // Request permission to the file, if the user grants permission, return true.
    if (await (fileHandle as any).requestPermission(opts) === 'granted') { // TODO remove any
      return true;
    }

    // The user did not grant permission, return false.
    return false;
  }

  async loadFromFileHandle(fileHandle: FileSystemFileHandle) {
    const allowedPermission = await this.verifyPermission(fileHandle, false);
    if (!allowedPermission) {
      return;
    }
    await idbKeyval.del('fileHandle');
    this.fileHandle = fileHandle
    await idbKeyval.set('fileHandle', this.fileHandle);
    const file = await fileHandle.getFile();
    const fileData = await file.text();
    this.fileName = file.name;
    await this.addToRecent();
    // History.forceCustomUndoState(fileData); // TODO fix
    this.updateTitle();
    // preserveRestart(); // TODO fix
  }
}