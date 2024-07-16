import { SimulationSettings } from "./SimulationSettings"
import { xAlert as xAlertDialog } from "./xAlertDialog"
import { DisplayDialog } from "./DisplayDialog"
import { RectangleDialog } from "./RectangleDialog"

export namespace Dialog {
  export let simulationSettings: SimulationSettings
  export function init() {
    simulationSettings = new SimulationSettings()
  }
  export const xAlert = xAlertDialog
  export const Display = DisplayDialog
  export const Rectangle = RectangleDialog
}