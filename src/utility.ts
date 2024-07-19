import { Engine } from "./Engine/index.js"
import { FunctionCategories } from "./FunctionCategories"
import { VisualController } from "./VisualController/index.js"

export function hasRandomFunction(definition: string) {
  if (definition) {
    let randomFunctions: string[] = []
    for (let category of FunctionCategories) {
      if (category.name === "Random Number Functions") {
        randomFunctions = (category.functions).map(f => f.replacement.substring(0, f.replacement.indexOf("#")).toLowerCase())
        break
      }
    }
    return randomFunctions.some(elem => definition.toLowerCase().includes(elem))
  }
  return false
}

export function deletePrimitive(id: string) {
  let primitive = Engine.findById(id)
	
  primitive.delete()
	
	// Delete ghosts
	let ghostIDs = Engine.findGhostsOfPrimitive(id)
	for(let i in ghostIDs) {
		deletePrimitive(ghostIDs[i])
	}
	cleanUnconnectedLinks()
	detachFlows(id)
	// RunResults.removeResultsForId(id) // TODO 
}

function cleanUnconnectedLinks() {
	let allLinks = Engine.model.findLinks()
	for(let link of allLinks) {
		if (!link.start || !link.end) {
			link.delete()
		}
	}
}

function detachFlows(id: string) {
	for (let key in VisualController.twoPointers) {
		let connection = VisualController.twoPointers[key]
		if (connection.type == "flow") { // TODO connection instanceof FlowVisual
			// if (connection.getStartAttach() && connection.getStartAttach().id == id) {
			// 	connection.setStartAttach(null);
			// 	connection.update();
			// }
			// if (connection.getEndAttach() && connection.getEndAttach().id == id) {
			// 	connection.setEndAttach(null);
			// 	connection.update();
			// }
		}
	}
}