import { SimulationSettings } from "./SimulationSettings"
import { xAlert as xAlertDialog } from "./xAlertDialog"

export namespace Dialog {
  export let simulationSettings: SimulationSettings
  export function init() {
    simulationSettings = new SimulationSettings()
  }
  export const xAlert = xAlertDialog
}