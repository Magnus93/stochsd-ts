
export class BaseEnvironment {
  getName() {
    return "base";
  }
  ready() {
    // Override this
  }
  keyDown(event: JQuery.KeyDownEvent) {
    // Override this
  }
  getFileManager() {
    // Override this
  }
  openLink(url: string) {
    // Returns true or false
    // if returning true, the caller will do e.preventDefault()
    // to not trying to open the link the the browsers default way
    // Default: false
    return false;
  }
}