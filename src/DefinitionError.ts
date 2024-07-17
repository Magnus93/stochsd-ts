import { Converter, Primitive } from "simulation/src/api/Blocks.js"
import { Engine } from "./Engine.ts"

export type DefinitionError = {
  id: number,
  detail?: Record<string, any>
}
export namespace DefinitionError {
  /* replaces isDefErr */
  export function is(value: any): value is DefinitionError {
    return value &&
      typeof value === "object" &&
      typeof value.id == "number" &&
      (value.detail == undefined || typeof value.detail == "object")
  }
  export const messageTable: Record<number, (defErr: DefinitionError) => string> = {
    1: (defErr) => "Empty Definition",
    2: (defErr) => `Unknown reference ${defErr.detail?.["unknownRef"]}`,
    3: (defErr) => `Unused link from [${Engine.getName(Engine.findById(defErr.detail?.["unusedId"]))}], or bracket pair [...] missing`,
    4: (defErr) => `No ingoing link`, // only for converter
    5: (defErr) => `More than one ingoing link`, // only for converter 
    6: (defErr) => `Unmatched ${defErr.detail?.["openBracket"]}`, // opening bracket unmatched
    7: (defErr) => `Unmatched ${defErr.detail?.["closeBracket"]}`, // closing bracket unmatched
    8: (defErr) => `Unmatched brackets`, // unmatching open and closing brackets  
    // open and close brackets not disclosed to user in order not to confuse.
    // uncomment below if
    // 8: (defErr) => `Unmatched brackets "${defErr["openBracket"]}...${defErr["closeBracket"]}"`,
    9: (defErr) => `Unclear converter definition`, // only for converters
    10: (defErr) => `Input values not in ascending order: ${defErr.detail?.Xpre} &gt; ${defErr.detail?.Xpost}`, // only for converters 
  }
  const checkFunctions: ((prim: Primitive, defString: string) => DefinitionError | undefined)[] = [
    (prim: Primitive, defString: string) => {
      // check empty string 
      if (defString === "") return { "id": 1 };
    },
    (prim: Primitive, defString: string) => {
      // check brackets 
      const lines = defString.split("\n");
      let posCounter = 0;
      for (let i in lines) {
        let line = lines[i];
        let defErr = checkBracketErrors(line);
        if (is(defErr)) {
          if ("openPos" in (defErr.detail ?? {})) defErr.detail!.openPos.line = Number(i) + 1;
          if ("closePos" in (defErr.detail ?? {})) defErr.detail!.closePos.line = Number(i) + 1;
          return defErr;
        }
        posCounter += line.length + 1;
      }
    },
    (prim: Primitive, defString: string) => {
      // check links  
      let primType = Engine.getNodeName(prim)
      let linkedIds = Engine.findLinkedIngoingPrimitives(prim.id).map(Engine.getId)
      if (primType === "Stock" || primType === "Variable" || primType === "Flow") {
        // 2. Unknown reference
        const definitionRefs = defString.match(/[^[]+(?=\])/g) ?? [];
        let linkedRefs = linkedIds.map(id => Engine.getName(Engine.findById(id)))
        for (let ref of definitionRefs) {
          if (linkedRefs.includes(ref) === false) {
            return { id: 2, detail: {unknownRef: ref }};
          }
        }

        // 3. Unused link 
        for (let i = 0; i < linkedIds.length; i++) {
          let ref = linkedRefs[i];
          if ((definitionRefs as any).includes(ref) === false) {
            return { id: 3, detail: { unusedId: linkedIds[i] }}
          }
        }
      } else if (primType === "Converter") {
        if (linkedIds.length === 0) {
          // 4. No ingoing link 
          return { id: 4, detail: {}};
        } else if (linkedIds.length > 1) {
          // 5. More then one ingoing link 
          return { id: 5,detail: {"linkedIds": linkedIds }};
        }
      }
    },
    (prim: Primitive, defString: string) => {
      if (Engine.getNodeName(prim) == "Converter") {
        let rows = defString.split(";").map(row => row.split(","));
        for (let i in rows) {
          let row = rows[i];
          if (row.length !== 2) {
            // unclear definition
            return { id: 9 }
          }
          if (row[0].trim() === "" || row[1].trim() === "") {
            return { id: 9 }
          }
          if (isNaN(Number(row[0])) || isNaN(Number(row[1]))) {
            return { id: 9 }
          }
          if (Number(i) > 0) {
            if (Number(rows[Number(i) - 1][0]) > Number(rows[i][0])) {
              // not sorted inputs order 
              return { 
                id: 10, 
                detail: {
                  Xpre: Number(rows[Number(i) - 1][0]), Xpost: Number(rows[i][0]) 
                }
              };
            }
          }
        }
      }
    }
  ]

  export function check(prim: Primitive) {
    if (!Engine.isGhost(prim)) {
      for (let fn of checkFunctions) {
        let defErr = fn(prim, Engine.getDefinition(prim) ?? "");
        if (defErr) {
          Engine.setAttribute(prim, "DefinitionError", JSON.stringify(defErr));
          return true;
        }
      }
    }
    Engine.setAttribute(prim, "DefinitionError", JSON.stringify({}));
    return false
  }

  export function has(prim: Primitive) {
    try {
      const defErr = JSON.parse(Engine.getAttribute(prim, "DefinitionError"));
      return is(defErr);
    } catch (err) {
      return false;
    }
  }

  export function getMessage(prim: any) {
    if (has(prim)) {
      const defErr = JSON.parse(prim.getAttribute("DefinitionError"));
      return messageTable[defErr["id"]](defErr);
    }
    return "";
  }

  /* replaces getAllPrims */
  export function getAllNonGhostsPrimitives() {
    return Engine.allPrimitives().filter(p => has(p)).filter(v => !Engine.isGhost(v))
  }
}


type OpenBracket = "(" | "{" | "["
/**
* checks for bracket errors and returns value error
* Input should only be one row
*/
function checkBracketErrors(str: string): DefinitionError | undefined {
  //       index:       0    1    2 
  let openBrackets: OpenBracket[] = ["(", "{", "["];
  let closeBrackets = [")", "}", "]"];
  let bracketStack: { pos: number, bracket: OpenBracket, index: number }[] = []; // {pos: pos in string, bracket: openbracket, index: 0..2} only contains open brackets
  let stringSansComment = str.split("#")[0];
  for (let pos in stringSansComment as any) {
    let char = stringSansComment[pos as any];
    if ((openBrackets as string[]).includes(char)) {
      let index = (openBrackets as string[]).indexOf(char);
      bracketStack.push({ pos: parseInt(pos), bracket: openBrackets[index], index });
    } else if (closeBrackets.includes(char)) {
      let index = closeBrackets.indexOf(char);
      if (bracketStack.length === 0) {
        // unmatched close bracket, e.g. Rand(()
        let openChar = openBrackets[index];
        let closePos = parseInt(pos);
        let closeChar = char;
        return {
          id: 7,
          detail: {
            openBracket: openChar,
            closePos: { col: closePos },
            closeBracket: closeChar
          }
        };
      }
      if (openBrackets[index] === bracketStack[bracketStack.length - 1].bracket) {
        bracketStack.pop();
      } else {
        // unmatching open and close brackets, e.g. Rand(()]
        let openPos = bracketStack[bracketStack.length - 1].pos;
        let openChar = bracketStack[bracketStack.length - 1].bracket;
        let closePos = parseInt(pos);
        let closeChar = char;

        let openCount = stringSansComment.split(openChar).length - stringSansComment.split(closeBrackets[openBrackets.indexOf(openChar)]).length;
        let closeCount = stringSansComment.split(openBrackets[closeBrackets.indexOf(closeChar)]).length - stringSansComment.split(closeChar).length;
        if (openCount !== 0) {
          // OpenType bracket: openNum =/= closeNum => unmatched open brackets
          // e.g. Sin(T()/two_pi]
          return {
            id: 6, detail: {
              openPos: { col: openPos }, openBracket: openChar, closeBracket: closeBrackets[openBrackets.indexOf(openChar)]
            }
          }
        } else if (closeCount !== 0) {
          // CloseType bracket: openNum =/= closeNum => unmatched close brackets
          // e.g. Sin(T()/two_pi])
          return {
            id: 7, detail: {
              openBracket: openBrackets[closeBrackets.indexOf(closeChar)], closePos: { col: closePos }, closeBracket: closeChar
            }
          }
        } else {
          // e.g. Sin(T([)/two_pi])
          return {
            id: 8,
            detail: {
              openPos: { col: openPos },
              openBracket: openChar,
              closePos: { col: closePos }, closeBracket: closeChar
            }
          }
        }

      }
    }
  }
  if (bracketStack.length === 0) {
    return undefined;
  } else {
    // unmatched open brackets, e.g. Rand(()
    const topStack = bracketStack[bracketStack.length - 1]
    const openPos = topStack.pos
    const openChar = topStack.bracket
    const closeChar = closeBrackets[topStack.index]
    return { 
      id: 6, 
      detail: {
        openPos: { col: openPos }, 
        openBracket: openChar, 
        closeBracket: closeChar 
      }
    }
  }
}