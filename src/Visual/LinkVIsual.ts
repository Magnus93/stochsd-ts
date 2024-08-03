import { Converter, Engine, Primitive, Variable } from "../Engine";
import { SVG } from "../SVG";
import { cos, distance, neg, rotate, scale, sin, translate } from "../transform";
import { AnchorPoint } from "./AnchorPoint";
import { AnchorType } from "./AnchorType";
import { BaseConnection } from "./BaseConnection";
import { BaseVisual } from "./BaseVisual";
import { ConstantVisual } from "./ConstantVisual";
import { VisualController } from "./Controller";
import { ConverterVisual } from "./ConverterVisual";
import { FlowVisual } from "./FlowVisual";
import { StockVisual } from "./StockVisual";
import { ValuedOnePointer } from "./ValuedOnePointer";
import { VariableVisual } from "./VariableVisual";

export class LinkVisual extends BaseConnection {
  // Used to keep a local coordinate system between start- and endAnchor
  // startLocal = [0,0], endLocal = [1,0]
  b1Local!: [number, number]
  b2Local!: [number, number]
  b1Anchor!: AnchorPoint
  b2Anchor!: AnchorPoint
  constructor(public id: string, public type: string, pos0: [number, number], pos1: [number, number]) {
    super(id, type, pos0, pos1);

    // reload image of anchor to make sure anchor is ontop
    this.b1Anchor.reloadImage();
    this.b2Anchor.reloadImage();
  }

  createInitialAnchors(pos0: [number, number], pos1: [number, number]) {
    this.b1Local = [0.3, 0.0];
    this.b2Local = [0.7, 0.0];
    super.createInitialAnchors(pos0, pos1);
    this.b1Anchor = new AnchorPoint(this.id + ".b1_anchor", "dummy_anchor", [0, 0], "bezier1");
    this.b2Anchor = new AnchorPoint(this.id + ".b2_anchor", "dummy_anchor", [0, 0], "bezier2");
    this.keepRelativeHandlePositions();
    this.b1Anchor.makeSquare();
    this.b2Anchor.makeSquare();
  }

  getAnchors() {
    return [this.startAnchor, this.b1Anchor, this.b2Anchor, this.endAnchor];
  }

  worldToLocal(worldPosition: [number, number]) {
    // localPos(worldPos) = inv(S)*inv(R)*inv(T)*worldPos
    let originWorld = this.startAnchor.getPos();
    let oneZeroWorld = this.endAnchor.getPos();
    let scaleFactor = distance(originWorld, oneZeroWorld);
    let sine = sin(originWorld, oneZeroWorld);
    let cosine = cos(originWorld, oneZeroWorld);
    let S_pWorld = translate(worldPosition, neg(originWorld));
    let RS_pWorld = rotate(S_pWorld, -sine, cosine);
    let posWorld = scale(RS_pWorld, [0, 0], 1 / scaleFactor);
    return posWorld;
  }
  localToWorld(localPosition: [number, number]) {
    // worldPos(localPos) = T*R*S*localPos
    let originWorld = this.startAnchor.getPos();
    let oneZeroWorld = this.endAnchor.getPos();
    let scaleFactor = distance(originWorld, oneZeroWorld);
    let sine = sin(originWorld, oneZeroWorld);
    let cosine = cos(originWorld, oneZeroWorld);
    let S_pLocal = scale(localPosition, [0, 0], scaleFactor);
    let RS_pLocal = rotate(S_pLocal, sine, cosine);
    let posWorld = translate(RS_pLocal, originWorld);
    return posWorld;
  }
  // Return true if parent has any selected children
  private hasSelectedChildren(parentId: string) {
    // Make sure we actually work on parent element
    parentId = VisualController.getParentId(parentId);

    // Find the children
    let children = VisualController.getChildren(parentId);
    for (let id in children) {
      if (children[id].isSelected()) {
        return true;
      }
    }
    return false;
  }
  unselect() {
    this.selected = false;
    if (this.hasSelectedChildren(this.id)) {

    } else {
      let children = VisualController.getChildren(this.id);
      for (let id in children) {
        let visual = VisualController.get(id);
        if (visual instanceof AnchorPoint) {
          visual.setVisible(false);
        }
      }
    }

    // Hide bezier lines
    for (let element of this.showOnlyOnSelect) {
      element.setAttribute("visibility", "hidden");
    }
  }
  select(selectChildren = true) {
    let children = VisualController.getChildren(this.id)
    for (let id in children) {
      let visual = VisualController.get(id)
      if (visual instanceof AnchorPoint) {
        visual.setVisible(true);
      }
    }

    if (selectChildren) {
      // This for loop is partly redundant and should be integrated in later code
      for (let anchor of this.getAnchors()) {
        anchor.select();
        anchor.setVisible(true);
      }
    }

    // Show beizer lines
    for (let element of this.showOnlyOnSelect) {
      element.setAttribute("visibility", "visible");
    }
  }
  updateClickArea() {
    this.clickCurve.x1 = this.curve.x1;
    this.clickCurve.y1 = this.curve.y1;
    this.clickCurve.x2 = this.curve.x2;
    this.clickCurve.y2 = this.curve.y2;
    this.clickCurve.x3 = this.curve.x3;
    this.clickCurve.y3 = this.curve.y3;
    this.clickCurve.x4 = this.curve.x4;
    this.clickCurve.y4 = this.curve.y4;
    this.clickCurve.update();
  }

  isAcceptableStartAttach(attachVisual: BaseVisual): boolean {
    let okAttachTypes = ["stock", "variable", "constant", "converter", "flow"];
    return okAttachTypes.includes(attachVisual.getType());
  }

  isAcceptableEndAttach(attachVisual: BaseVisual): boolean {
    let okAttachTypes = ["stock", "variable", "converter", "flow"];
    if (attachVisual.getType() === "converter") {
      let linkedPrims = Engine.getLinkedPrimitives(Engine.findById(attachVisual.id)).filter((prim: Primitive) => {
        // filter out linked primitives that have the same source as this link.
        let source = (Engine.findById(this.id) as any).start as Primitive | undefined;
        if (source) {
          return prim.id !== source.id
        }
        return false;
      });
      // only allow converter to have one ingoing link 
      return linkedPrims.length < 1;
    }
    return okAttachTypes.includes(attachVisual.getType()) && attachVisual.isGhost !== true;
  }

  setStartAttach(newStartAttach: BaseVisual | undefined) {
    super.setStartAttach(newStartAttach)
    if (this._endAttach) {
      this._endAttach.updateDefinitionError();
      (this._endAttach as any).update() // TODO remove as any
    }
  }
  setEndAttach(newEndAttach: BaseVisual | undefined) {
    let oldEndAttach = this._endAttach;
    super.setEndAttach(newEndAttach as StockVisual) // TODO as StockVisual for Links - can be different kinds
    if (newEndAttach != null && newEndAttach.getType() == "stock") {
      this.dashLine()
    } else {
      this.undashLine()
    }
    if (oldEndAttach) {
      oldEndAttach.updateDefinitionError();
      (oldEndAttach as any).update() // TODO remove as any
    }
    if (newEndAttach) {
      newEndAttach.updateDefinitionError();
      (newEndAttach as any).update() // TODO remove
    }
  }

  clean() {
    // remove end_attach to make sure end_attach value error is updated 
    this.setEndAttach(undefined);
    super.clean();
  }
  clearImage() {
    super.clearImage();
    // curve must be removed seperatly since it is not part of any group 
    this.curve.remove();
  }

  setColor(color: string) {
    this.color = color;
    Engine.setAttribute(this.primitive!, "Color", this.color);
    this.curve.setAttribute("stroke", color);
    this.arrowPath.setAttribute("stroke", color);
    this.startAnchor.setColor(color);
    this.endAnchor.setColor(color);
    this.b1Anchor.setColor(color);
    this.b2Anchor.setColor(color);
    this.b1Line.setAttribute("stroke", color);
    this.b2Line.setAttribute("stroke", color);
  }
  arrowPath!: SVGPathElement
  arrowHead!: SVGGElement
  clickCurve!: SVG.Curve
  curve!: SVG.Curve
  group!: SVGGElement
  b1Line!: SVGLineElement
  b2Line!: SVGLineElement
  showOnlyOnSelect!: SVGLineElement[]
  makeGraphics() {
    let [x1, y1] = this.startAnchor.getPos();
    let [x2, y2] = this.b1Anchor.getPos();
    let [x3, y3] = this.b2Anchor.getPos();
    let [x4, y4] = this.endAnchor.getPos();

    this.arrowPath = SVG.fromString(`<path d="M0,0 -4,12 4,12 Z" stroke="black" fill="white"/>`) as SVGPathElement
    this.arrowHead = SVG.group([this.arrowPath]);
    SVG.translate(this.arrowHead, x4, y4);

    this.clickCurve = SVG.curve("twoway", x1, y1, x2, y2, x3, y3, x4, y4, { "pointer-events": "all", stroke: "none", "stroke-width": "10" });
    this.curve = SVG.curve("oneway", x1, y1, x2, y2, x3, y3, x4, y4, { stroke: "black", "stroke-width": "1" });

    this.clickCurve.draggable = false
    this.curve.draggable = false

    // curve is not included in group since it is one-way and will therefore span an area
    // The area will be clickable if included in the group 
    this.group = SVG.group([this.clickCurve, this.arrowHead]);
    this.group.setAttribute("node_id", this.id);

    this.b1Line = SVG.line(x1, y1, x2, y2, "black", "black", "", { "stroke-dasharray": "5 5" });
    this.b2Line = SVG.line(x4, y4, x3, y3, "black", "black", "", { "stroke-dasharray": "5 5" });

    this.showOnlyOnSelect = [this.b1Line, this.b2Line];

    this.elements = this.elements.concat([this.b1Line, this.b2Line]);
  }
  dashLine() {
    this.curve.setAttribute("stroke-dasharray", "6 4");
  }
  undashLine() {
    this.curve.setAttribute("stroke-dasharray", "");
  }
  resetBezierPoints() {
    let startAttach = this.getStartAttach();
    let endAttach = this.getEndAttach();
    if (!startAttach || !endAttach) {
      return;
    }
    this.startAnchor.setPosition((startAttach as any).getLinkMountPos(endAttach.getPosition())); // TODO remove as any
    this.endAnchor.setPosition((endAttach as any).getLinkMountPos(startAttach.getPosition())); // TODO remove as any
    this.resetBezier1();
    this.resetBezier2();
    this.update();
  }
  resetBezier1() {
    this.b1Local = [0.3, 0];
  }
  resetBezier2() {
    this.b2Local = [0.7, 0];
  }
  syncAnchorToPrimitive(anchorType: AnchorType) {
    super.syncAnchorToPrimitive(anchorType);

    let startPosition = this.startAnchor.getPos();
    let endPosition = this.endAnchor.getPos();
    let b1pos = this.b1Anchor.getPos();
    let b2pos = this.b2Anchor.getPos();

    switch (anchorType) {
      case "start":
        this.curve.x1 = startPosition[0];
        this.curve.y1 = startPosition[1];
        this.curve.update();

        this.b1Line.setAttribute("x1", `${startPosition}`[0]);
        this.b1Line.setAttribute("y1", `${startPosition}`[1]);
        break;
      case "end":
        this.curve.x4 = endPosition[0];
        this.curve.y4 = endPosition[1];
        this.curve.update();


        this.b2Line.setAttribute("x1", `${endPosition}`[0]);
        this.b2Line.setAttribute("y1", `${endPosition}`[1]);
        break;
      case "bezier1":
        {
          this.curve.x2 = b1pos[0];
          this.curve.y2 = b1pos[1];
          this.curve.update();

          this.b1Line.setAttribute("x2", `${b1pos}`[0]);
          this.b1Line.setAttribute("y2", `${b1pos}`[1]);

          Engine.setAttribute(this.primitive!, "b1x", `${b1pos}`[0]);
          Engine.setAttribute(this.primitive!, "b1y", `${b1pos}`[1]);
        }
        break;
      case "bezier2":
        {
          this.curve.x3 = b2pos[0];
          this.curve.y3 = b2pos[1];
          this.curve.update();

          this.b2Line.setAttribute("x2", `${b2pos}`[0]);
          this.b2Line.setAttribute("y2", `${b2pos}`[1]);

          Engine.setAttribute(this.primitive!, "b2x", `${b2pos}`[0]);
          Engine.setAttribute(this.primitive!, "b2y", `${b2pos}`[1]);
        }
        break;
    }
    this.updateClickArea();
  }
  updateGraphics() {
    // The arrow is pointed from the second bezier point to the end
    let b2pos = this.b2Anchor.getPos();

    let diffX = this.endX - b2pos[0];
    let diffY = this.endY - b2pos[1];
    let angle = Math.atan2(diffX, -diffY) * (180 / Math.PI);
    SVG.transform(this.arrowHead, this.endX, this.endY, angle, 1);

    // Update end position so that we get the drawing effect when link is created
    this.curve.x4 = this.endX;
    this.curve.y4 = this.endY;
    this.curve.update();
  }
  update() {
    // This function is similar to TwoPointer::update but it takes attachments into account

    // Get start position from attach
    // _startAnchor is null if we are currently creating the connection
    // _start_attach is null if we are not attached to anything
    const startAttach = this.getStartAttach()
    if (startAttach && this.startAnchor != null) {
      let oldPos = this.startAnchor.getPos();
      let newPosition = startAttach.getLinkMountPos(this.b1Anchor.getPos());
      // If start point have moved reset b1
      if (oldPos[0] != newPosition[0] || oldPos[1] != newPosition[1]) {
        this.startAnchor.setPosition(newPosition);
      }
    }
    const endAttach = this.getEndAttach()
    if (endAttach && this.endAnchor != null) {
      let oldPos = this.endAnchor.getPos();
      let newPosition = endAttach.getLinkMountPos(this.b2Anchor.getPos());
      // If end point have moved reset b2
      if (oldPos[0] != newPosition[0] || oldPos[1] != newPosition[1]) {
        this.endAnchor.setPosition(newPosition);
      }
    }
    this.keepRelativeHandlePositions();
    // update anchors 
    this.getAnchors().map(anchor => anchor.updatePosition());
    this.updateGraphics();
  }
  keepRelativeHandlePositions() {
    this.b1Anchor.setPosition(this.localToWorld(this.b1Local));
    this.b2Anchor.setPosition(this.localToWorld(this.b2Local));
  }
  setHandle1Pos(newPosition: [number, number]) {
    this.b1Local = this.worldToLocal(newPosition);
  }
  setHandle2Pos(newPosition: [number, number]) {
    this.b2Local = this.worldToLocal(newPosition);
  }
}