import { useEffect, useState } from "react";
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import {AssociativeEntity, PartialKeyAttribute, DashedLine, DoubleLine} from "../../utils/myerd";
import * as joint from 'jointjs';
window.joint = joint;

export default function Diagram({elementJSON, setElementJSON, linkJSON}) {
    let graph = null;
    let paper = null;
    //let [isOpenEditElementParagraphDialog, setIsOpenEditElementParagraphDialog] = useState(false);
    let [isOpenDeleteElementDialog, setIsOpenDeleteElementDialog] = useState(false);
    let [elementSelectedToDeleteElement, setElementSelectedToDeleteElement] = useState(null);
    
    const fontSize = 12;
    const elementHeight = 40;
    let start = 0;
    let end = 0;
    let editText = null;
    let editTextBlock = null;
    let rect = null;
    let elementSelectedToUpdateElementParagraph = null;
    let elementSelectedToReadElementType = null;
    //let [elementSelectedToUpdateElementParagraph, setElementSelectedToUpdateElementParagraph] = useState(null);
    //let elementSelectedToDeleteElement = null;

    useEffect(() => {
      // if (graph) {
      //   graph.clear();
      //   paper.remove();
      // }
      drawDiagram(elementJSON, linkJSON);
      
    }, [elementJSON]);
    

    // useEffect(() => {
    //   if (!elementSelectedToUpdateElementParagraph) {
    //     return;
    //   }
    //   if (isOpenEditElementParagraphDialog) {
    //     elementSelectedToUpdateElementParagraph.attr('text/fill', 'red');
    //     elementSelectedToUpdateElementParagraph.attr('text/font-weight', 'bold');
    //     setNewElementParagraph(elementSelectedToUpdateElementParagraph.attr('text/text'));
    //   }
    //   else {
    //     elementSelectedToUpdateElementParagraph.attr('text/fill', 'white');
    //     elementSelectedToUpdateElementParagraph.attr('text/font-weight', 'normal');
    //     setElementSelectedToUpdateElementParagraph(null);
    //   }
    // }, [isOpenEditElementParagraphDialog])

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

    async function addMouseEnterElementEvent(paper) {
      paper.on("element:mouseenter", function(elementView, evt) {
        if (rect || editTextBlock) return;
        elementSelectedToReadElementType = elementView.model;
        readElementType();
      })
      
    }

    async function addMouseLeaveElementEvent(paper) {
      paper.on("element:mouseleave", function(elementView, evt) {
        unreadElementType();
      })
    }

    function readElementType() {
      let rectWidth = 150;
        let rectHeight = 30
        let diff = 0;
        diff = -(rectWidth - elementSelectedToReadElementType.prop('size').width) / 2;
        
        rect = new joint.shapes.basic.Rect({
          //id: elementView.model.prop('id'),
          position: { x:elementSelectedToReadElementType.prop('position').x + diff, y:elementSelectedToReadElementType.prop('position').y - 40},
          size: { width: rectWidth, height: rectHeight },
          attrs: { rect: { fill: 'pink' }, text: { 
            text: elementJSON.elements[elementSelectedToReadElementType.id-1].type, 
            fill: 'black', 'font-weight': 'bold','font-variant': 'small-caps' }}
        });
        graph.addCells([rect]);
    }

    function unreadElementType() {
      graph.removeCells([rect]);
      elementSelectedToReadElementType = null;
      rect = null;
    }

    // update element paragraph when double click
    async function addDoubleClickElementEvent(paper) {
      paper.on('element:pointerdblclick', function(elementView) {
        //setElementSelectedToUpdateElementParagraph(elementView.model);
        elementSelectedToUpdateElementParagraph = elementView.model;

        let contentHTML = '<div><input id="editText" type="text" style="background-color:white; color:orange; font-weight:bold;" value="' + elementView.model.attr("text/text") + '"/></div>';
        editTextBlock = new joint.shapes.basic.TextBlock({
          //id: elementView.model.prop('id'),
          position: { x:elementView.model.prop('position').x, y:elementView.model.prop('position').y},
          size: { width: elementView.model.prop('size').width, height: elementView.model.prop('size').height },
          attrs: { rect: { fill: 'transparent' }},
          content: contentHTML
        });
        graph.addCells([editTextBlock]);
        editText = document.getElementById("editText");
        editText.focus();
        editText.setSelectionRange(0, elementView.model.attr("text/text").length);

        window.addEventListener('click',function(e){
          if(editText && e.target != editText){
            updateElementParagraph();
          }
        });
        
        //pop up dialog
        //setIsOpenEditElementParagraphDialog(true);
      });
    }

    function updateElementParagraph() {
      let newElementParagraph = editText.value;

      elementSelectedToUpdateElementParagraph.resize(newElementParagraph.length * fontSize, elementHeight);
      elementSelectedToUpdateElementParagraph.attr('text/text', newElementParagraph);
      elementJSON.elements[elementSelectedToUpdateElementParagraph.id - 1].paragraph = newElementParagraph;
      setElementJSON(elementJSON);
      document.getElementById("inputJSON").value = JSON.stringify(elementJSON);
      graph.removeCells([editTextBlock]);
      //setElementSelectedToUpdateElementParagraph(null);
      elementSelectedToUpdateElementParagraph = null;
      //setEditTextBlock(null);
      editTextBlock = null;
      editText = null;
      window.removeEventListener('click',function(e){
        if(editText && e.target != editText){
          updateElementParagraph();
        }
      });
    }
    
    
    // update position element when drop and drag element
    function addChangePositionElementEvent(graph) {
      graph.on('change:position', function(cell) {
      unreadElementType();

      //var center = cell.getBBox().center();
      let topLeft = cell.getBBox().topLeft();
      topLeft = topLeft.toString();
      let token = topLeft.split("@");
      let newX = Number(token[0]);
      let newY = Number(token[1]);
      //alert(JSON.stringify(elementJSON.elements[cell.id - 1]));
      elementJSON.elements[cell.id - 1].x = newX;
      elementJSON.elements[cell.id - 1].y = newY;
      setElementJSON(elementJSON);
      document.getElementById("inputJSON").value = JSON.stringify(elementJSON);
      
      //cell.attr('text/text', "" + x + " " + y);
      });
    }

    // delete element when click long
    async function addPointerDownEvent(paper) {
      paper.on('element:pointerdown', function(elementView) {
        start = Date.now();
      })
    }

    async function addPointerUpEvent(paper) {
      paper.on('element:pointerup', function(elementView) {
        end = Date.now();
        if (end - start > 1000) {
          //elementSelectedToDeleteElement = elementView.model;
          setElementSelectedToDeleteElement(elementView.model);
          //pop up dialog
          setIsOpenDeleteElementDialog(true);
        }
      })
    }

    function deleteElement() {
      // for (let i = elementSelected.id; i < elementJSON.elements.length; i++) {
      //   elementJSON.elements[i].id--;
      // }
      // alert(elementSelected.id);
      if (!elementSelectedToDeleteElement) return;
      
      for (let i = elementJSON.elements.length - 1; i > -1; i--) {
        if (elementJSON.elements[i].id === elementSelectedToDeleteElement.id) {
          elementJSON.elements[i] = null;
          //elementJSON.elements.splice(i,1);
          break;
        }
      }

      //elementJSON.elements.splice({id:elementSelected.id}, 1);
      setElementJSON(elementJSON);
      document.getElementById("inputJSON").value = JSON.stringify(elementJSON);
      
      // graph.getSuccessors(elementSelected).forEach(function(successor){
      //   successor.id--;
      // })
      elementSelectedToDeleteElement.remove();
      //elementSelectedToDeleteElement = null;
      setElementSelectedToDeleteElement(null);
      //graph.removeCells(elementSelectedToDeleteElement);
      
    }
  
    function drawDiagram(elementJSON, linkJSON) {
      window.joint = joint;
      // khởi tạo các đối tượng erd, graph, paper
    
      var erd = joint.shapes.erd;
    
      graph = new joint.dia.Graph();
      
      customizeGraph(graph);
    
      paper = new joint.dia.Paper({
        el: document.getElementById("paper"),
        model: graph,
        width: 800,
        height: 600
      });

      addMouseEnterElementEvent(paper);
      addMouseLeaveElementEvent(paper);
      addDoubleClickElementEvent(paper);
      addChangePositionElementEvent(graph);
      addPointerDownEvent(paper);
      addPointerUpEvent(paper);
    
      let elements = new Array(elementJSON.elements.length);
      let links = new Array(linkJSON.links.length);
      
    
      // duyệt mảng JSON từ input, lấy các giá trị id, type, paragraph, x, y gán vào elements
    
      elementJSON.elements.forEach((item) => {
        let element;
        switch (item.type) {
          case "AssociativeEntity":
            element = new AssociativeEntity({
              position: { x: item.x, y: item.y },
              size: { width: item.paragraph.length * fontSize, height: elementHeight },
              attrs: { text: { text: item.paragraph } }
            });
            element.addTo(graph);
            element = element.diamond;
            break;
          case "PartialKeyAttribute":
            element = new PartialKeyAttribute({
              position: { x: item.x, y: item.y },
              size: { width: item.paragraph.length * fontSize, height: elementHeight },
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
                height: elementHeight
              },
              attrs: {
                text: {
                  fill: "white",
                  text: item.paragraph
                }
              }
              //content: '<label data-tooltip="tooltip text" data-tooltip-hide-trigger="mouseout mouseouver">HIDE ON MOUSEOUT</label>'
            };
            graph.addCell(element);
        }
        elements[item.id - 1] = element;
      });
      
      //graph.addCells([editTextBlock]);
    
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
      <div>
        <div id="paper"></div>
        {/* <Dialog open={isOpenEditElementParagraphDialog} onClose={() => setIsOpenEditElementParagraphDialog(false)} aria-labelledby="form-dialog-title">
          <DialogTitle>Edit element paragraph</DialogTitle>
          <DialogContent>
              <DialogContentText>
                  Type new element paragraph:
              </DialogContentText>

              <TextField defaultValue={newElementParagraph} onChange={e => setNewElementParagraph(e.target.value)} autoFocus margin="dense" fullWidth />
          </DialogContent>
          <DialogActions>
              <Button onClick={() => { setIsOpenEditElementParagraphDialog(false); }} color="danger">
                  Cancel
              </Button>
              <Button onClick={() => {  setIsOpenEditElementParagraphDialog(false); editElementParagraph(); }} color="primary">
                  OK
              </Button>
          </DialogActions>
      </Dialog> */}
      <Dialog open={isOpenDeleteElementDialog} onClose={() => setIsOpenDeleteElementDialog(false)} aria-labelledby="form-dialog-title">
          <DialogTitle>Delete element</DialogTitle>
          <DialogContent>
              <DialogContentText>
                  Do you want to delete this element?
              </DialogContentText>
          </DialogContent>
          <DialogActions>
              <Button onClick={() => { setIsOpenDeleteElementDialog(false); }} color="danger">
                  Cancel
              </Button>
              <Button onClick={() => {  setIsOpenDeleteElementDialog(false); deleteElement(); }} color="primary">
                  OK
              </Button>
          </DialogActions>
      </Dialog>
    </div>
    )
}