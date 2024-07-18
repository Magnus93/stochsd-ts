import { Model, loadInsightMaker } from "simulation"


export type Primitive = ReturnType<Model["find"]>[number]
export type Stock = ReturnType<Model["Stock"]>
export type Variable = ReturnType<Model["Variable"]>
export type Converter = ReturnType<Model["Converter"]>
export type Link = ReturnType<Model["Link"]>
export type Flow = ReturnType<Model["Flow"]>
export namespace Engine {
  export let model = new Model({})
  export function loadFile(fileData: string) {
    model = loadInsightMaker(fileData)
  }
  export function setTimeStart(value: number) {
    model.timeStart = value
  }
  export function getTimeStart(): number {
    return model.timeStart!
  }
  export function setTimeLength(value: number) {
    model.timeLength = value
  }
  export function getTimeLength(): number {
    return model.timeLength!
  }
  export function setTimeStep(value: number) {
    model.timeStep = value
  }
  export function getTimeStep(): number {
    return model.timeStep!
  }
  export function setAlgorithm(value: "Euler" | "RK4") {
    model.algorithm = value
  }
  export function getAlgorithm(): "Euler" | "RK4" {
    return model.algorithm!
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
    return isStock(primitive)
      ? primitive.initial 
      : isVariable(primitive)
      ? primitive.value 
      : isFlow(primitive)
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
    let outgoingLinks = links.filter((link: Link) => link.end ? (link.end as Primitive).id == endId : false)
  	// let outgoingLinks = links.filter((l) => (l.target) ? l.target.id == id : false);
  	return outgoingLinks.map((link: Link) => link.start as Primitive | undefined).filter((prim): prim is Primitive => !!prim);
  }
  export function getNodeName(primitive: Primitive): string {
    return primitive._node.value.nodeName
  }
  export function isStock(primitive: Primitive): primitive is Stock {
    return getNodeName(primitive) == "Stock"
  }
  export function isVariable(primitive: Primitive): primitive is Variable {
    return getNodeName(primitive) == "Variable"
  }
  export function isConverter(primitive: Primitive): primitive is Converter {
    return getNodeName(primitive) == "Converter"
  }
  export function isLink(primitive: Primitive): primitive is Link {
    return getNodeName(primitive) == "Link"
  }
  export function isFlow(primitive: Primitive): primitive is Flow {
    return getNodeName(primitive) == "Flow"
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
  export function getLinkedPrimitives(primitive: Primitive): Primitive[] {
    let result = [];
    let allLinks = model.findLinks()
    for(let link of allLinks) {
      if (link.end == primitive) {
        if (link.start != null) {
          result.push(link.start);
        }
      }
    }
    return result;
  }
  /* replaces getSourcePosition */
  export function getStartPosition(primitive: Flow | Link) {
    let source = primitive._node.children[0].children[0].children[0]
    return [Number(source.getAttribute("x")) ?? 0, Number(source.getAttribute("y")) ?? 0]
  }
  /* replaces getTargetPosition */
  export function getEndPosition(primitive: Flow | Link) {
    let target = primitive._node.children[0].children[0].children[1]
    return [Number(target.getAttribute("x")) ?? 0, Number(target.getAttribute("y")) ?? 0]
  }
  /* replaces setSourcePosition */
  export function setStartPosition(primitive: Flow | Link, position: [number, number]) {
    let source = primitive._node.children[0].children[0].children[0]
    source.setAttribute("x", position[0])
    source.setAttribute("x", position[0])
  }
  /* replaces setTargetPosition */
  export function setEndPosition(primitive: Flow | Link, position: [number, number]) {
    let source = primitive._node.children[0].children[0].children[1]
    source.setAttribute("x", position[0])
    source.setAttribute("x", position[0])
  }
}
