import { Flow, Primitive, Stock, Variable } from "simulation/src/api/Blocks"
import { Model, loadInsightMaker } from "simulation"

export namespace Engine {
  export let model = new Model({})
  export function loadFile(fileData: string) {
    model = loadInsightMaker(fileData)
  }
  export function setTimeStart(value: number) {
    model.timeLength = value
  }
  export function setTimeLength(value: number) {
    model.timeLength = value
  }
  export function setTimeStep(value: number) {
    model.timeStep = value
  }
  export function setAlgorithm(value: "Euler" | "RK4") {
    model.algorithm = value
  }
  export function allPrimitives(): Primitive[] {
    return model.find()
  }
  /* replaces findID() */
  export function findById(id: string) {
    return model.getId(id)
  }
  export function getId(primitive: Primitive) {
    return primitive.id
  }
  export function getName(primitive: Primitive): string {
    return primitive.name ?? ""
  }
  export function getDefinition(primitive: Stock | Variable | Flow): string
  export function getDefinition(primitive: Primitive): string | undefined
  export function getDefinition(primitive: Primitive): string | undefined {
    return primitive instanceof Stock 
      ? primitive.initial 
      : primitive instanceof Variable 
      ? primitive.value 
      : primitive instanceof Flow 
      ? primitive.rate 
      : undefined
  }
  export function getAttribute(primitive: Primitive, attribute: string) {
    return primitive._node.getAttribute(attribute)
  }
  export function setAttribute(primitive: Primitive, attribute: string, value: string) {
    primitive._node.setAttribute(attribute, value)
  }
  /* replaces findLinkedInPrimitives */
  export function findLinkedIngoingPrimitives(endId: string): Primitive[] {
  	let links = model.findLinks()
    let outgoingLinks = links.filter((link) => link.end ? (link.end as Primitive).id == endId : false)
  	// let outgoingLinks = links.filter((l) => (l.target) ? l.target.id == id : false);
  	return outgoingLinks.map(link => link.start as Primitive | undefined).filter((prim): prim is Primitive => !!prim);
  }
  export function getNodeName(primitive: Primitive): string {
    return primitive._node.value.nodeName
  }
  /* replaces isPrimitiveGhost */
  export function isGhost(primitive: Primitive) {
    return getNodeName(primitive) == "Ghost"
  }
  /* replaces findGhostsOfID */
  export function findGhostsOfPrimitive(primitiveId: string) {
    var results: string[] = [];
    var ghosts = model.find(isGhost)
    for (let ghost of ghosts) {
      if (getAttribute(ghost, "Source") == primitiveId) {
        results.push(getAttribute(ghost, "id"));
      }
    }
    return results;
  }
}
