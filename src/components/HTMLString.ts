export namespace HTMLString {
  export function warning(message: string, specNotOk = false) {
    let noChanges = "";
    if (specNotOk) noChanges = "<br/><b>Your specification is not accepted!</b>";
    return (`<span class="warning">${message} ${noChanges}</span>`);
  }

  export function note(message: string) {
    return (`<span class="note">Note:<br/>${message}</span>`);
  }
  /* replaces keyHtml */
  export function keyboard(keys: string[]) {
    return Array.isArray(keys)
      ? keys.map(key => `<kbd>${key}</kbd>`).join("+")
      : `<kbd>${keys}</kbd>`
  }
}