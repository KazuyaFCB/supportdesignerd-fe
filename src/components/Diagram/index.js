import { useEffect } from "react";

import {AssociativeEntity, PartialKeyAttribute, DashedLine, DoubleLine} from "../../utils/myerd";
import * as joint from 'jointjs';
window.joint = joint;

export default function Diagram({elementJSON, linkJSON}) {
    useEffect(() => {
      drawDiagram(elementJSON, linkJSON)    
    }, [elementJSON]);


    function customizeGraph(graph) {
      // modify graph de children ko ra khoi parent
      graph.on("change:position", function (cell) {
        var parentId = cell.get("parent");
        if (!parentId) return;
    
        var parent = graph.getCell(parentId);
        var parentBbox = parent.getBBox();
        var cellBbox = cell.getBBox();
    
        if (
          parentBbox.containsPoint(cellBbox.origin()) &&
          parentBbox.containsPoint(cellBbox.topRight()) &&
          parentBbox.containsPoint(cellBbox.corner()) &&
          parentBbox.containsPoint(cellBbox.bottomLeft())
        ) {
          // All the four corners of the child are inside
          // the parent area.
          return;
        }
    
        // Revert the child position.
        cell.set("position", cell.previous("position"));
      });
  }
    
  
  function drawDiagram(elementJSON, linkJSON) {
      window.joint = joint;
      // khởi tạo các đối tượng erd, graph, paper
    
      var erd = joint.shapes.erd;
    
      var graph = new joint.dia.Graph();
    
      customizeGraph(graph);
    
      var paper = new joint.dia.Paper({
        el: document.getElementById("paper"),
        model: graph,
        width: 1200,
        height: 600
      });
    
      let elements = new Array(elementJSON.elements.length);
      let links = new Array(linkJSON.links.length);
      const fontSize = 12;
    
      // duyệt mảng JSON từ input, lấy các giá trị id, type, paragraph, x, y gán vào elements
    
      elementJSON.elements.forEach((item) => {
        let element;
        switch (item.type) {
          case "AssociativeEntity":
            element = new AssociativeEntity({
              position: { x: item.x, y: item.y },
              size: { width: item.paragraph.length * fontSize, height: 40 },
              attrs: { text: { text: item.paragraph } }
            });
            element.addTo(graph);
            element = element.diamond;
            break;
          case "PartialKeyAttribute":
            element = new PartialKeyAttribute({
              position: { x: item.x, y: item.y },
              size: { width: item.paragraph.length * fontSize, height: 40 },
              attrs: { text: { text: item.paragraph } }
            });
            element.addTo(graph);
            element = element.text;
            break;
          default:
            element = {
              id: item.id,
              type: "erd." + item.type,
              position: {
                x: item.x,
                y: item.y
              },
              size: {
                width: item.paragraph.length * fontSize,
                height: 40
              },
              attrs: {
                text: {
                  fill: "white",
                  text: item.paragraph
                }
              }
            };
            graph.addCell(element);
        }
        elements[item.id - 1] = element;
      });
    
      // graph.fromJSON({
      //     cells: elements
      // });
    
      // duyệt mảng linkJSON từ input để vẽ các đường nối
    
      linkJSON.links.forEach((item) => {
        let link;
        switch (item.type) {
          // case "Link":
          //     link = new joint.shapes.standard.Link();
          //     break;
          case "PartialParticipation":
            link = new erd.Line();
            break;
          case "TotalParticipation":
            link = new DoubleLine();
            break;
          case "Optional":
            link = new DashedLine();
            break;
          default:
            link = new erd.Line();
        }
        link.source(elements[item.sourceId - 1]);
        link.target(elements[item.targetId - 1]);
        link.addTo(graph).set({
          labels: [
            {
              attrs: {
                text: { text: item.paragraph, fill: "#000000" },
                rect: { fill: "none" }
              }
            }
          ]
        });
      });
    }

    return (
      <div id="paper"></div>
            
    )
}