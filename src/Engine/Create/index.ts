import { InsightMakerDocument } from "./InsightMakerDocument";


export namespace Create {
  /* replaces createModelFileData() */
  export function modelFileData() {
    let insightMakerDocumentWriter = new InsightMakerDocument();
    // insightMakerDocumentWriter.appendPrimitives(); // TODO add back later
    // return insightMakerDocumentWriter.getXmlString();
  }
}