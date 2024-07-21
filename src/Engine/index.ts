import { loadInsightMaker } from "simulation"
import { Visual } from "../Visual"
import { 
  Primitive, 
  Stock, 
  Variable, 
  Converter, 
  Link, 
  Flow, 
  Primitives as EnginePrimitives,
  model as engineModel
} from "./Primitives"
import { Create as EngineCreate } from "./Create"
export { type Primitive as Primitive, type Stock, type Variable, type Converter, type Link, type Flow }

export namespace Engine {
  export let model = engineModel
  export import Create = EngineCreate
  export import Primitives = EnginePrimitives

  export function createStock() {
    let primitive = model.Stock()
    Visual.Controller.Sync.singleVisual(primitive)
    return primitive
  }
  export function createVariable() {
    let primitive = model.Variable()
    Visual.Controller.Sync.singleVisual(primitive)
    return primitive
  }
  export function createFlow() {
    let primitive = model.Flow(undefined!, undefined!, {})
    Visual.Controller.Sync.singleVisual(primitive)
    return primitive
  }
  export function createLink() {
    let primitive = model.Link(undefined!, undefined!, {})
    Visual.Controller.Sync.singleVisual(primitive)
    return primitive
  }
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
}
