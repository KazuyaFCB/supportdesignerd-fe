import * as joint from "jointjs";
window.joint = joint;

export class AssociativeEntity {
  constructor({
    id: _id,
    position: { x: _x, y: _y },
    size: { width: _width, height: _height },
    attrs: {
      text: { text: _text, fill: _fill, "font-size": _fontSize },
    },
  }) {
    this.rect = new joint.shapes.basic.Rect({
      position: { x: _x, y: _y },
      size: { width: _width, height: _height },
      attrs: {
        rect: { fill: "white" },
        text: { text: _text, fill: _fill, "font-size": _fontSize },
      },
    });

    // this.diamond = new joint.shapes.erd.Relationship({
    //   position: { x: _x, y: _y },
    //   size: { width: _width, height: _height },
    //   attrs: {
    //     text: { text: "", /*fill: _fill, "font-size": _fontSize*/ },
    //     ".outer": {
    //       fill: "white",
    //       stroke: "black",
    //     },
    //     ".inner": {
    //       fill: "white",
    //       stroke: "black",
    //     },
    //     //text: { text: _text, fill: 'white', 'text-decoration': 'underline dotted white', 'text-underline-position': 'under' },
    //   },
    // });

    this.diamond = new joint.shapes.basic.Path({
      id: _id,
      position: { x: _x, y: _y },
      size: { width: _width, height: _height },
      attrs: {
        path: { d: "M 30 0 L 60 30 30 60 0 30 z", fill: "white" },
        text: {
          text: _text,
          "y": -_height/2,
          fill: _fill,
          style: { "font-size": _fontSize },
        },
      },
    });

    this.diamond.embed(this.rect);
    return this;
    //return {rect: this.rect, diamond: this.diamond};
  }
  addTo(graph) {
    //this.rect.addTo(graph);
    //this.diamond.addTo(graph);
    graph.addCell([this.rect, this.diamond]);
  }
}

export class PartialKeyAttribute {
  constructor({
    id: _id,
    position: { x: _x, y: _y },
    size: { width: _width, height: _height },
    attrs: {
      text: { text: _text, fill: _fill, "font-size": _fontSize },
    },
  }) {
    //let customText = joint.util.breakText(_text, {width: _width - 2*padding, height: _height - 2*padding});
    this.partialKeyAttribute = new joint.shapes.erd.Attribute({
      position: { x: _x, y: _y },
      size: { width: _width, height: _height },
      attrs: {
        text: { text: "", fill: _fill },
        ".outer": {
          fill: "white",
          stroke: "black",
        },
        ".inner": {
          fill: "white",
          stroke: "black",
        },
        //text: { text: _text, fill: 'white', 'text-decoration': 'underline dotted white', 'text-underline-position': 'under' },
      },
    });
    //let contentHTML = "<p style='color:black;font-weight:bold;text-decoration:underline black dashed; margin:auto'>" + _text + "</p>"
    this.text = new joint.shapes.standard.TextBlock({
      id: _id,
      position: { x: _x, y: _y },
      size: { width: _width, height: _height },
      attrs: {
        body: { fill: "transparent", "stroke-width": 0 },
        label: {
          text: _text,
          style: {
            color: _fill,
            textDecoration: "underline dashed",
            "font-size": _fontSize,
            "font-weight": "bold",
          },
        },
      },
    });
    this.text.embed(this.partialKeyAttribute);
    //this.partialKeyAttribute.embed(this.text);
    return this;
  }
  addTo(graph) {
    graph.addCell([this.partialKeyAttribute, this.text]);
    //this.partialKeyAttribute.addTo(graph);
  }
}

export class DashedLine extends joint.shapes.standard.Link {
  constructor() {
    super();
    let link = new joint.shapes.standard.Link();
    //let link = new joint.dia.Link();
    //var stroke = '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6);
    //var strokeWidth = Math.floor(Math.random() * 10) + 1;
    var strokeDasharray =
      Math.floor(Math.random() * 5) +
      1 +
      " " +
      (Math.floor(Math.random() * 5) + 1);
    link.attr({
      //".connection": { "stroke-width": 1, "stroke-dasharray": strokeDasharray },
      line: {
        stroke: "black",
        strokeWidth: 1,
        strokeDasharray: strokeDasharray,
        targetMarker: {
          display: "none",
        },
      },
    });
    link.prop("defaultLabel/attrs/body/stroke", "black");
    //this.link.embed(this.line);
    return link;
  }
  // addTo(graph) {
  //     graph.addCell([this.line, this.link]);
  // }
}

export class Line extends joint.shapes.standard.Link {
  constructor() {
    super();
    let link = new joint.shapes.standard.Link();
    link.attr({
      line: {
        targetMarker: {
          display: "none",
        },
      },
    });
    return link;
  }
}

export class DoubleLine extends joint.shapes.standard.DoubleLink {
  constructor() {
    super();
    let doubleLink = new joint.shapes.standard.DoubleLink();
    //doubleLink.attr('line/stroke', 'transparent');

    doubleLink.attr({
      line: {
        sourceMarker: {
          display: "none",
        },
        targetMarker: {
          display: "none",
        },
      },
    });

    return doubleLink;
  }
}
