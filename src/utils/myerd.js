import * as joint from 'jointjs';
window.joint = joint

export class AssociativeEntity {
    constructor({
      position: { x: _x, y: _y },
      size: { width: _width, height: _height },
      attrs: {
        text: { text: _text }
      }
    }) {
      this.rect = new joint.shapes.basic.Rect({
        position: { x: _x, y: _y },
        size: { width: _width, height: _height },
        attrs: {
          rect: { fill: "violet" },
          text: { text: "" }
        }
      });
      this.diamond = new joint.shapes.basic.Path({
        position: { x: _x, y: _y },
        size: { width: _width, height: _height },
        attrs: {
          path: { d: "M 30 0 L 60 30 30 60 0 30 z", fill: "violet" },
          text: { text: _text, "ref-y": -35, fill: "white" }
        }
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
      position: { x: _x, y: _y },
      size: { width: _width, height: _height },
      attrs: {
        text: { text: _text }
      }
    }) {
      //let customText = joint.util.breakText(_text, {width: _width - 2*padding, height: _height - 2*padding});
      this.partialKeyAttribute = new joint.shapes.erd.Attribute({
        position: { x: _x, y: _y },
        size: { width: _width, height: _height },
        attrs: {
          text: { text: "" }
          //text: { text: _text, fill: 'white', 'text-decoration': 'underline', 'text-underline-position': 'under' },
        }
      });
      this.text = new joint.shapes.basic.TextBlock({
        position: { x: _x, y: _y },
        size: { width: _width, height: _height },
        attrs: { rect: { fill: "transparent", "stroke-width": 0 } },
        content:
          "<p style='color:white;font-weight:bold;text-decoration:underline white dashed; margin:auto'>Partial Key Attribute</p>"
      });
      this.text.embed(this.partialKeyAttribute);
      return this;
    }
    addTo(graph) {
      graph.addCell([this.partialKeyAttribute, this.text]);
      //this.partialKeyAttribute.addTo(graph);
    }
  }
  
export class DashedLine extends joint.dia.Link {
    constructor() {
      //let link = new joint.shapes.standard.Link();
      let link = new joint.dia.Link();
      //var stroke = '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6);
      //var strokeWidth = Math.floor(Math.random() * 10) + 1;
      var strokeDasharray =
        Math.floor(Math.random() * 5) +
        1 +
        " " +
        (Math.floor(Math.random() * 5) + 1);
      link.attr({
        ".connection": { "stroke-width": 1, "stroke-dasharray": strokeDasharray }
        // line: {
        //     stroke: 'black',
        //     strokeWidth: 1,
        //     strokeDasharray: strokeDasharray,
        //     targetMarker: {
        //         display: 'none'
        //     }
        // }
      });
      link.prop("defaultLabel/attrs/body/stroke", "black");
      //this.link.embed(this.line);
      return link;
    }
    // addTo(graph) {
    //     graph.addCell([this.line, this.link]);
    // }
  }
  
export class DoubleLine extends joint.shapes.standard.DoubleLink {
    constructor() {
      let doubleLink = new joint.shapes.standard.DoubleLink();
      //doubleLink.attr('line/stroke', 'transparent');
  
      doubleLink.attr({
        line: {
          sourceMarker: {
            display: "none"
          },
          targetMarker: {
            display: "none"
          }
        }
      });
  
      return doubleLink;
    }
  }
  