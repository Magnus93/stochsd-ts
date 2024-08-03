import { WebEnvironment } from "./Web"
import { BaseEnvironment } from "./BaseEnvironment"
import { BaseFileManager } from "./BaseFileManager"


export class Env {
  static environment: BaseEnvironment
  static fileManager: BaseFileManager
  static init() {
    this.environment = this.detect()
    this.fileManager = this.environment.getFileManager()
  }
  static detect(): BaseEnvironment {
    // if (isRunningElectron()) {
    // return new ElectronEnvironment();
    // } else if (isRunningNwjs()) {
    // return new NwEnvironment();
    // } else {
    return new WebEnvironment();
    // }
  }
}