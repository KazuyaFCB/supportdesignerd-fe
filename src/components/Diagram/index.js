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
    let graph = new joint.dia.Graph();
    let [isOpenEditElementParagraphDialog, setIsOpenEditElementParagraphDialog] = useState(false);
    let [isOpenDeleteElementDialog, setIsOpenDeleteElementDialog] = useState(false);
    let [elementSelectedToUpdateElementParagraph, setElementSelectedToUpdateElementParagraph] = useState(null);
    let [elementSelectedToDeleteElement, setElementSelectedToDeleteElement] = useState(null);
    //let elementSelected = null;
    let [newElementParagraph, setNewElementParagraph] = useState("");
    const fontSize = 12;
    const elementHeight = 40;
    let start = 0;
    let end = 0;
    let editText = null;
    let [editTextBlock, setEditTextBlock] = useState(null);


    useEffect(() => {
      drawDiagram(elementJSON, linkJSON)    
    }, [elementJSON]);

    useEffect(() => {
      //alert(JSON.stringify(elementSelectedToUpdateElementParagraph));
      if (!elementSelectedToUpdateElementParagraph) return;
      let contentHTML = '<div><input id="editText" type="text" style="background-color:white; color:orange; font-weight:bold;" value="' + elementSelectedToUpdateElementParagraph.attr("text/text") + '"></input></div>';
      setEditTextBlock(new joint.shapes.basic.TextBlock({
        position: { x:elementSelectedToUpdateElementParagraph.prop('position').x, y:elementSelectedToUpdateElementParagraph.prop('position').y},
        size: { width: elementSelectedToUpdateElementParagraph.prop('size').width, height: elementSelectedToUpdateElementParagraph.prop('size').height },
        attrs: { rect: { fill: 'transparent' }},
        content: contentHTML
      }));
    }, [elementSelectedToUpdateElementParagraph])

    useEffect(() => {
      if (!editTextBlock) return;
      graph.addCells([editTextBlock]);
      //editText = document.getElementById("editText");
      document.getElementById("editText").focus();
      document.getElementById("editText").setSelectionRange(0, elementSelectedToUpdateElementParagraph.attr("text/text").length);


      window.addEventListener('click',function(e){
        if(e.target != document.getElementById("editText")){
          editElementParagraph();
        }
      });
    }, [editTextBlock])

    // useEffect(() => {
    //   if (!elementSelected) {
    //     return;
    //   }
    //   if (isOpenEditElementParagraphDialog) {
    //     elementSelected.attr('text/fill', 'red');
    //     elementSelected.attr('text/font-weight', 'bold');
    //     setNewElementParagraph(elementSelected.attr('text/text'));
    //   }
    //   else {
    //     elementSelected.attr('text/fill', 'white');
    //     elementSelected.attr('text/font-weight', 'normal');
    //     setElementSelected(null);
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

    // edit element paragraph when double click
    async function addDoubleClickElementEvent(paper) {
      paper.on('element:pointerdblclick', function(elementView) {
        // setElementSelectedToUpdateElementParagraph({
        //   "id":elementView.model.prop('id'),
        //   "type":elementView.model.prop('type'),
        //   "position":elementView.model.prop('position'),
        //   "size":elementView.model.prop('size'),
        //   "attrs":{
        //     "text":{
        //       "text":elementView.model.attr("text/text"),
        //       "fill":"white"
        //     }
        //   }
        // });
        
        
        setElementSelectedToUpdateElementParagraph(elementView.model);
        //

        //let contentHTML = '<div><textarea rows="2" cols="10" style="background-color:#b6b7b4; color:#ffffff" value="' + elementView.model.attr("text/text") + '" ></textarea></div>';
        //let sizeHTML = 'width:' + elementView.model.prop('size').width + '; height:' + elementView.model.prop('size').height;
        
        //alert(elementView.model.attr('contentEditable'));
        //elementView.model.attr('contenteditable', 'true');
        //pop up dialog
        //setIsOpenEditElementParagraphDialog(true);
      });
    }

    function editElementParagraph() {
      setNewElementParagraph(editText.value);

      // setElementSelectedToUpdateElementParagraph({
      //   "size": {
      //     "width": newElementParagraph.length * fontSize,
      //     "height": elementHeight
      //   },
      //   "attrs":{
      //     "text":{
      //       "text":newElementParagraph,
      //       "fill":"white"
      //     }
      //   }
      // });

      elementSelectedToUpdateElementParagraph.resize(newElementParagraph.length * fontSize, elementHeight);
      elementSelectedToUpdateElementParagraph.attr('text/text', newElementParagraph);
      elementJSON.elements[elementSelectedToUpdateElementParagraph.id - 1].paragraph = newElementParagraph;
      setElementJSON(elementJSON);
      document.getElementById("inputJSON").value = JSON.stringify(elementJSON);
      graph.removeCells([editTextBlock]);
      setElementSelectedToUpdateElementParagraph(null);
      setEditTextBlock(null);
    }

    // function editElementParagraph() {
    //   elementSelected.resize(newElementParagraph.length * fontSize, elementHeight);

    //   elementSelected.attr('text/text', newElementParagraph);
    //   elementJSON.elements[elementSelected.id - 1].paragraph = newElementParagraph;
    //   setElementJSON(elementJSON);
    //   document.getElementById("inputJSON").value = JSON.stringify(elementJSON);
    // }
    
    // drop and drag element to change position
    function addChangePositionElementEvent(graph) {
      graph.on('change:position', function(cell) {
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
    function deleteElement() {
      // for (let i = elementSelected.id; i < elementJSON.elements.length; i++) {
      //   elementJSON.elements[i].id--;
      // }
      // alert(elementSelected.id);
      for (let i = elementJSON.elements.length - 1; i > -1; i--) {
        if (elementJSON.elements[i].id === elementSelectedToDeleteElement.id) {
          elementJSON.elements.splice(i,1);
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
      
      //graph.removeCells(elementSelectedToDeleteElement);
      
    }

    function addPointerDownEvent(paper) {
      paper.on('element:pointerdown', function(elementView) {
        start = Date.now();
      })
    }

    function addPointerUpEvent(paper) {
      paper.on('element:pointerup', function(elementView) {
        end = Date.now();
        if (end - start > 500) {
          setElementSelectedToDeleteElement(elementView.model);
          //pop up dialog
          setIsOpenDeleteElementDialog(true);
        }
      })
    }
  
    function drawDiagram(elementJSON, linkJSON) {
      window.joint = joint;
      // khởi tạo các đối tượng erd, graph, paper
    
      var erd = joint.shapes.erd;
    
      
    
      customizeGraph(graph);
    
      var paper = new joint.dia.Paper({
        el: document.getElementById("paper"),
        model: graph,
        width: 800,
        height: 600
      });

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
                // body: {
                //   button: {
                //     event: 'element:button:pointerdown',
                //     cursor: 'pointer',
                //     ref: 'buttonLabel',
                //     refWidth: '150%',
                //     refHeight: '150%',
                //     refX: '-25%',
                //     refY: '-25%'
                //   },
                //   buttonLabel: {
                //     text: 'X', // fullwidth underscore
                //       pointerEvents: 'none',
                //       refX: '100%',
                //       refY: 0,
                //       textAnchor: 'middle',
                //       textVerticalAnchor: 'middle'
                //   }
                // }
              }
            };
            graph.addCell(element);
        }
        elements[item.id - 1] = element;
      });
      //graph.addCells([el2]);
    
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
        <Dialog open={isOpenEditElementParagraphDialog} onClose={() => setIsOpenEditElementParagraphDialog(false)} aria-labelledby="form-dialog-title">
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
      </Dialog>
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