import { BaseVisual as VisualBaseVisual } from "./BaseVisual"
import { OnePointer as VisualOnePointer } from "./OnePointer"
import { TwoPointer as VisualTwoPointer } from "./TwoPointer"
import { BaseConnection as VisualBaseConnection } from "./BaseConnection"
import { FlowVisual as VisualFlowVisual } from "./FlowVisual"
import { LineVisual as VisualLineVisual } from "./LineVisual"
import { LinkVisual as VisualLinkVisual } from "./LinkVIsual"
import { NumberboxVisual as VisualNumberboxVisual } from "./NumberboxVisual"
import { StockVisual as VisualStockVisual } from "./StockVisual"
import { VariableVisual as VisualVariableVisual } from "./VariableVisual"
import { RectangleVisual as VisualRectangleVisual } from "./RectangleVisual"
import { EllipseVisual as VisualEllipseVisual } from "./EllipseVisual"
import { TextAreaVisual as VisualTextAreaVisual } from "./TextAreaVisual"
import { ConverterVisual as VisualConverterVisual } from "./ConverterVisual"
import { AnchorType as VisualAnchorType } from "./AnchorType"
import { AnchorPoint as VisualAnchorPoint } from "./AnchorPoint"
import { ConstantVisual as VisualConstantVisual } from "./ConstantVisual"
import { ValuedOnePointer as VisualValuedOnePointer } from "./ValuedOnePointer"
import { Controller as VisualController } from "./Controller"

export namespace Visual {
  export import Controller = VisualController
  export type BaseVisual = VisualBaseVisual
  export const BaseVisual = VisualBaseVisual
  export type OnePointer = VisualOnePointer
  export const OnePointer = VisualOnePointer
  export type TwoPointer = VisualTwoPointer
  export const TwoPointer = VisualTwoPointer
  export type BaseConnection = VisualBaseConnection
  export const BaseConnection = VisualBaseConnection
  export type ValuedOnePointer = VisualValuedOnePointer
  export const ValuedOnePointer = VisualValuedOnePointer
  export type StockVisual = VisualStockVisual
  export const StockVisual = VisualStockVisual
  export type VariableVisual = VisualVariableVisual
  export const VariableVisual = VisualVariableVisual
  export type ConstantVisual = VisualConstantVisual
  export const ConstantVisual = VisualConstantVisual
  export type ConverterVisual = VisualConverterVisual
  export const ConverterVisual = VisualConverterVisual
  export type FlowVisual = VisualFlowVisual
  export const FlowVisual = VisualFlowVisual
  export type LinkVisual = VisualLinkVisual
  export const LinkVisual = VisualLinkVisual
  export type NumberboxVisual = VisualNumberboxVisual
  export const NumberboxVisual = VisualNumberboxVisual
  export type LineVisual = VisualLineVisual
  export const LineVisual = VisualLineVisual
  export type RectangleVisual = VisualRectangleVisual
  export const RectangleVisual = VisualRectangleVisual
  export type EllipseVisual = VisualEllipseVisual
  export const EllipseVisual = VisualEllipseVisual
  export type TextAreaVisual = VisualTextAreaVisual
  export const TextAreaVisual = VisualTextAreaVisual
  export type AnchorPoint = VisualAnchorPoint
  export const AnchorPoint = VisualAnchorPoint
  export type AnchorType = VisualAnchorType
}