import { FunctionCategories } from "./FunctionCategories";

export function hasRandomFunction(definition: string) {
  if (definition) {
    let randomFunctions: string[] = [];
    for (let category of FunctionCategories) {
      if (category.name === "Random Number Functions") {
        randomFunctions = (category.functions).map(f => f.replacement.substring(0, f.replacement.indexOf("#")).toLowerCase());
        break;
      }
    }
    return randomFunctions.some(elem => definition.toLowerCase().includes(elem));
  }
  return false;
}