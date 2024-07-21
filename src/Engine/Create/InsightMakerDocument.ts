// import { Visual } from "../../Visual"
// import { Primitives, Flow, Link, Primitive, model } from "../Primitives";

/* replaces saveblePrimitiveTypes */
const savablePrimitiveTypes = ["TextArea", "Rectangle", "Ellipse", "Line", "Setting", "Stock", "Variable", "Converter", "Ghost", "Flow", "Link", "Text", "Numberbox", "Table",/*"Diagram",*/"TimePlot", "ComparePlot", "XyPlot", "HistoPlot"]
type Attributes = Record<string, string>
export class InsightMakerDocument {
  // TODO
/*   xmlDocument: XMLDocument 
  root: HTMLElement
  constructor() {
    // http://stackoverflow.com/questions/14340894/create-xml-in-javascript
    this.xmlDocument = document.implementation.createDocument(null, "InsightMakerModel");
    this.root = this.xmlDocument.createElement("root");

    //~ <mxCell id="0"/>
    //~ <mxCell id="1" parent="0"/>
    var introCell1 = this.xmlDocument.createElement("mxCell");
    var introCell2 = this.xmlDocument.createElement("mxCell");
    introCell1.setAttribute("id", "0");
    introCell2.setAttribute("id", "1");
    introCell2.setAttribute("parent", "0");
    this.root.appendChild(introCell1);
    this.root.appendChild(introCell2);

    //~ root.appendChild(xmlSetting());
    //~ root.appendChild(xmlStock("Stock1",80,50));

    this.xmlDocument.documentElement.appendChild(this.root);
  }

  private xmlNode(type: string, nodeAttributes: Attributes, cellAttributes: Attributes, geometryAttributes: Attributes, geometryChildren?: any) {
    var node = this.xmlDocument.createElement(type);
    var cell = this.xmlDocument.createElement("mxCell");
    var geometry = this.xmlDocument.createElement("mxGeometry");

    for (var key in nodeAttributes) {
      node.setAttribute(key, nodeAttributes[key]);
    }

    cell.setAttribute("parent", "1");

    for (var key in cellAttributes) {
      cell.setAttribute(key, cellAttributes[key]);
    }

    // <mxGeometry x="240" y="90" width="100" height="40" as="geometry"/>
    geometry.setAttribute("x", `${100}`);
    geometry.setAttribute("y", `${100}`);
    geometry.setAttribute("width", `${100}`);
    geometry.setAttribute("height", `${100}`);
    geometry.setAttribute("as", "geometry");

    for (var key in geometryAttributes) {
      geometry.setAttribute(key, geometryAttributes[key]);
    }

    for (var i in geometryChildren) {
      geometry.appendChild(geometryChildren[i]);
    }
    cell.appendChild(geometry);
    node.appendChild(cell);
    return node;
  }

  private XmlAttributesHashMap(xmlAttributes: any) { // TODO fix type
    var result: Attributes = {};
    for (var i in xmlAttributes) {
      var name = xmlAttributes[i].name;
      var value = xmlAttributes[i].value;
      if (name == undefined || value == undefined) {
        continue;
      }
      result[name] = value;
    }
    return result;
  }
  private xmlPrimitive(primitive: Primitive) {
    var type = Primitives.getNodeName(primitive);
    var visual = Visual.Controller.get(primitive.id);

    var nodeAttributes: Attributes = {};
    for (let [name, value] of primitive._node.attributes) {
      nodeAttributes[name] = value;
    }

    var style = type.toLowerCase();

    var cellAttributes: Attributes = {}
    var geometryAttributes: Attributes = {}
    var geometryChildren = null;

    const graphEnum = {
      VERTEX: 1,
      EDGE: 2
    };
    var graphType = graphEnum.VERTEX;

    // If we have cell values add them
    if (primitive._node.children.length > 0) {
      cellAttributes = this.XmlAttributesHashMap(primitive._node.children[0].attributes);
      geometryAttributes = this.XmlAttributesHashMap(primitive._node.children[0].children[0].attributes);
    }

    if (type == "Ghost") {
      var sourceID = primitive._node.getAttribute("Source")
      var sourceType = Primitives.getNodeName(Primitives.findById(sourceID))
      style = sourceType.toLowerCase() + ";opacity=30;"
    }

    if (visual instanceof Visual.TwoPointer) {
      graphType = graphEnum.EDGE;

      const source = primitive._node.source
      const target = primitive._node.target

      if (source != null) {
        cellAttributes["source"] = source.getAttribute("id");
      }
      if (target != null) {
        cellAttributes["target"] = target.getAttribute("id");
      }

      if (!(type == "Link" || type == "Flow")) {
        cellAttributes["visible"] = "0";
      }

      var point1 = this.xmlDocument.createElement("mxPoint");
      var point2 = this.xmlDocument.createElement("mxPoint");

      let sourcePosition = Primitives.getStartPosition(primitive as Flow | Link)
      let targetPosition = Primitives.getEndPosition(primitive as Flow | Link)

      point1.setAttribute("as", "sourcePoint");
      point1.setAttribute("x", sourcePosition[0].toString());
      point1.setAttribute("y", sourcePosition[1].toString());

      point2.setAttribute("as", "targetPoint");
      point2.setAttribute("x", targetPosition[0].toString());
      point2.setAttribute("y", targetPosition[1].toString());

      geometryChildren = [];

      geometryChildren.push(point1);
      geometryChildren.push(point2);
    }

    switch (graphType) {
      case graphEnum.VERTEX:
        cellAttributes["vertex"] = "1";
        break;
      case graphEnum.EDGE:
        cellAttributes["edge"] = "1";
        break;
    }
    cellAttributes["style"] = style;

    const [x, y] = Primitives.getPosition(primitive)
    geometryAttributes.x = `${x}`
    geometryAttributes.y = `${y}`

    return this.xmlNode(type, nodeAttributes, cellAttributes, geometryAttributes, geometryChildren);
  }
  appendPrimitives() {
    // primitive order is reversed otherwise the primitives will flip order each save.
    // If order is different then seed will not work.
    var primitiveArray = model.find().reverse();
    for (var prim of primitiveArray) {
      if (savablePrimitiveTypes.includes(Primitives.getNodeName(prim))) {
        this.root.appendChild(this.xmlPrimitive(prim));
      }
    }
  }
  getXmlString() {
    var xmlText = new XMLSerializer().serializeToString(this.xmlDocument);
    var formattedXmlText = xmlText.replace(/\>/g, ">\n");
    return formattedXmlText;
  } */
}