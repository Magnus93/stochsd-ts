import { Model } from "simulation"

export type Primitive = ReturnType<Model["find"]>[number]
export type Stock = ReturnType<Model["Stock"]>
export type Variable = ReturnType<Model["Variable"]>
export type Converter = ReturnType<Model["Converter"]>
export type Link = ReturnType<Model["Link"]>
export type Flow = ReturnType<Model["Flow"]>
// export type Primitive = Stock | Variable | Converter | Link | Flow // TODO better definition?

export let model = new Model({})

export namespace Primitives {
  /* replaces getType from old API */
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
  /* replace getSize from old insightmaker API */
  export function getSize(primitive: Primitive): [number, number] {
    console.log("getSize, primitive._node.children", primitive._node.children)
    const geometry = primitive._node.children[0].children[0].attributes
    return [Number(geometry.get(["width"])), Number(geometry.get(["height"]))]
  }
  /* replace getPosition from old insightmaker API */
  export function getPosition(primitive: Primitive): [number, number] {
    const geometry = primitive._node.children[0].children[0].attributes
    return [Number(geometry.get(["x"])), Number(geometry.get(["y"]))]
  }
  /* replace getCenterPosition from old insightmaker API */
  export function getCenterPosition(primitive: Primitive): [number, number] {
    const size = getSize(primitive)
    const position = getPosition(primitive)
    return [position[0] + size[0]/2, position[1] + size[1]/2]
  }
  /* replace getValue from insightmaker API */
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
  	return outgoingLinks.map((link: Link) => link.start as Primitive | undefined).filter((prim?: Primitive): prim is Primitive => !!prim);
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
  export function getStartPosition(primitive: Flow | Link): [number, number] {
    let source = primitive._node.children[0].children[0].children[0]
    return [Number(source.getAttribute("x")) ?? 0, Number(source.getAttribute("y")) ?? 0]
  }
  /* replaces getTargetPosition */
  export function getEndPosition(primitive: Flow | Link): [number, number] {
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
