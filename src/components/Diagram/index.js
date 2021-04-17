import { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
//import Slider from '@material-ui/core/Slider';
//import AddIcon from '@material-ui/icons/Add';
//import RemoveIcon from '@material-ui/icons/Remove';

import {AssociativeEntity, PartialKeyAttribute, DashedLine, DoubleLine} from "../../utils/myerd";
import * as joint from 'jointjs';
window.joint = joint;

const useStyles = makeStyles((theme) => ({
  gridList: {
    flexWrap: 'nowrap',
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: 'translateZ(0)',
  }
}))

export default function Diagram({elementJSON, linkJSON, imageWidth, imageHeight }) {
    const classes = useStyles();
    let graph = null;
    let paper = null;
    //let [isOpenEditElementParagraphDialog, setIsOpenEditElementParagraphDialog] = useState(false);
    let [isOpenDeleteElementDialog, setIsOpenDeleteElementDialog] = useState(false);
    let [elementSelectedToDeleteElement, setElementSelectedToDeleteElement] = useState(null);
    
    const fontSize = 12;
    const elementHeight = 40;
    let [zoom, setZoom] = useState(1.0); // 100%

    let elements = [];

    let start = 0;
    let end = 0;
    let editText = null;
    let editTextBlock = null;
    let rect = null;
    let elementSelectedToUpdateElementParagraph = null;
    let elementSelectedToReadElementType = null;
    //let [elementSelectedToUpdateElementParagraph, setElementSelectedToUpdateElementParagraph] = useState(null);
    //let elementSelectedToDeleteElement = null;

    const panel = [
      {
        img: "https://www.conceptdraw.com/How-To-Guide/picture/erd-symbols-and-meanings/ERD-Symbols-Entity.png",
        title: "Entity"
      }, {
        img: "https://www.conceptdraw.com/How-To-Guide/picture/erd-symbols-and-meanings/ERD-Symbols-Weak-Entity.png",
        title: "WeakEntity"
      }, {
        img: "https://www.conceptdraw.com/How-To-Guide/picture/erd-symbols-and-meanings/ERD-Symbols-Attribute.png",
        title: "Attribute"
      }, {
        img: "https://www.conceptdraw.com/How-To-Guide/picture/erd-symbols-and-meanings/ERD-Symbols-Relationship.png",
        title: "Relationship"
      }, {
        img: "https://www.conceptdraw.com/How-To-Guide/picture/erd-symbols-and-meanings/ERD-Symbols-Identifying-Relationship.png",
        title: "IdentifyingRelationship"
      }
    ]

    useEffect(() => {
      //alert('draw diagram');
      drawDiagram();
      
    }, [elementJSON.elements, linkJSON.links]);

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

    

    function updateInputElementJSON() {
      if (document.getElementById("inputElementJSON")) {
        document.getElementById("inputElementJSON").value = JSON.stringify(elementJSON);
      }
    }

    // CREATE element when click on panel
    function createElement(panelItem, panelIndex) {
      let item = { id: elementJSON.elements.length + 1, x: 0, y: 0, type: panelItem.title, paragraph: "      ", width: 50, height: 25};
      elementJSON.elements.push(item);
      updateInputElementJSON();
      if (!graph) {
        drawDiagram();
      } else {
        let element = createElementFromItem(item, zoom);
        graph.addCell(element);
      }
      //sessionStorage.setItem("elementJSON", JSON.stringify(elementJSON));
    }

    // READ element type or link type when hover mouse on it
    async function addMouseEnterElementEvent(paper) {
      paper.on("element:mouseenter", function(elementView, evt) {
        if (rect || editTextBlock) return;
        elementSelectedToReadElementType = elementView.model;
        readElementType();
      })
      paper.on("link:mouseenter", function(linkView, evt) {
        if (rect || editTextBlock) return;
        elementSelectedToReadElementType = linkView.model;
        readLinkType(evt.pageX - 400, evt.pageY - 50);
      })
    }

    async function addMouseLeaveElementEvent(paper) {
      paper.on("element:mouseleave", function(elementView, evt) {
        unreadElementType();
      });
      paper.on("link:mouseleave", function(linkView, evt) {
        unreadElementType();
        
      });
    }

    function readElementType() {
      let rectWidth = 150;
      let rectHeight = 30;
      let diff = 0;
      diff = -(rectWidth - elementSelectedToReadElementType.prop('size').width) / 2;
      if (!elementJSON.elements[elementSelectedToReadElementType.id-1]) {
        return;
      }
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

    function readLinkType(x, y) {
      let rectWidth = 150;
      let rectHeight = 30;
      rect = new joint.shapes.basic.Rect({
        position: { x:x, y:y },
        size: { width: rectWidth, height: rectHeight },
        attrs: { rect: { fill: 'pink' }, text: { 
          text: 'Line', 
          fill: 'black', 'font-weight': 'bold','font-variant': 'small-caps' }}
      });
      graph.addCells([rect]);
    }

    function unreadElementType() {
      graph.removeCells([rect]);
      elementSelectedToReadElementType = null;
      rect = null;
    }

    // UPDATE element paragraph when double click
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
        if (editText) {
          editText.focus();
          editText.setSelectionRange(0, elementView.model.attr("text/text").length);
        }

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
      if (elementJSON.elements[elementSelectedToUpdateElementParagraph.id - 1]) {
        elementJSON.elements[elementSelectedToUpdateElementParagraph.id - 1].paragraph = newElementParagraph;
      }
      updateInputElementJSON();
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
      //sessionStorage.setItem("elementJSON", JSON.stringify(elementJSON));
    }

    // UPDATE link paragraph when double click
    // async function addDoubleClickLinkEvent(paper) {
    //   paper.on('link:pointerdblclick', function(linkView, evt) {
    //     elementSelectedToUpdateElementParagraph = linkView.model;

    //     let contentHTML = '<div><input id="editText" type="text" style="background-color:white; color:orange; font-weight:bold;" value="' + linkView.model.attr("text/text") + '"/></div>';
    //     editTextBlock = new joint.shapes.basic.TextBlock({
    //       position: { x: evt.pageX - 400, y: evt.pageY - 50 },
    //       size: { width: 100, height: 50 },
    //       attrs: { rect: { fill: 'transparent' }},
    //       content: contentHTML
    //     });
    //     graph.addCells([editTextBlock]);
    //     editText = document.getElementById("editText");
    //     if (editText) {
    //       editText.focus();
    //       editText.setSelectionRange(0, elementView.model.attr("text/text").length);
    //     }

    //     window.addEventListener('click',function(e){
    //       if(editText && e.target != editText){
    //         updateElementParagraph();
    //       }
    //     });
    //     //pop up dialog
    //     //setIsOpenEditElementParagraphDialog(true);
    //   });
    // }
    
    
    // UPDATE position element when drop and drag element
    function addChangePositionElementEvent(graph) {
      graph.on('change:position', function(cell) {
        unreadElementType(); // xoa label info cua element

        //var center = cell.getBBox().center();
        let topLeft = cell.getBBox().topLeft();
        topLeft = topLeft.toString();
        let token = topLeft.split("@");
        let newX = Number(token[0]);
        let newY = Number(token[1]);
        //alert(JSON.stringify(elementJSON.elements[cell.id - 1]));
        if (elementJSON.elements[cell.id - 1]) {
          elementJSON.elements[cell.id - 1].x = newX;
          elementJSON.elements[cell.id - 1].y = newY;
          //setElementJSON(elementJSON);
          updateInputElementJSON();
          //sessionStorage.setItem("elementJSON", JSON.stringify(elementJSON));
        }
        //cell.attr('text/text', "" + x + " " + y);
      });
    }

    // DELETE element when click long
    async function addPointerDownEvent(paper) {
      paper.on('element:pointerdown', function(elementView) {
        start = Date.now();
      })
    }

    async function addPointerUpEvent(paper) {
      paper.on('element:pointerup', function(elementView) {
        end = Date.now();
        if (end - start > 2000) {
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
        if (elementJSON.elements[i] && elementJSON.elements[i].id === elementSelectedToDeleteElement.id) {
          elementJSON.elements[i] = null;
          //elementJSON.elements.splice(i,1);
          break;
        }
      }
      elementSelectedToDeleteElement.remove();
      //elementSelectedToDeleteElement = null;
      setElementSelectedToDeleteElement(null);

      //elementJSON.elements.splice({id:elementSelected.id}, 1);
      //setElementJSON(elementJSON);
      updateInputElementJSON();
      //sessionStorage.setItem("elementJSON", JSON.stringify(elementJSON));
      // graph.getSuccessors(elementSelected).forEach(function(successor){
      //   successor.id--;
      // })
      
      //elementSelectedToDeleteElement = null;
      
      //graph.removeCells(elementSelectedToDeleteElement);
      
    }

    function createElementFromItem(item, zoom) {
      let element = null;
      switch (item.type) {
        case "AssociativeEntity":
          element = new AssociativeEntity({
            position: { x: item.x * zoom, y: item.y * zoom },
            size: { width: item.width * zoom, height: item.height * zoom },
            attrs: { text: { text: item.paragraph } }
          });
          element.addTo(graph);
          element = element.diamond;
          break;
        case "PartialKeyAttribute":
          element = new PartialKeyAttribute({
            position: { x: item.x * zoom, y: item.y * zoom },
            size: { width: item.width * zoom, height: item.height * zoom },
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
              x: item.x * zoom,
              y: item.y * zoom
            },
            size: {
              width: item.width * zoom,
              height: item.height * zoom
            },
            attrs: {
              text: {
                fill: "white",
                text: item.paragraph,
                'font-size': fontSize
              }
            }
          };
      }
      return element;
    }

    function initDiagram() {
      if (graph || paper) {
        graph.clear();
        paper.remove();
      }
      graph = new joint.dia.Graph();
      
      customizeGraph(graph);
    
      paper = new joint.dia.Paper({
        el: document.getElementById("paper"),
        model: graph,
        width: imageWidth * zoom,
        height: imageHeight * zoom,
        restrictTranslate: true
      });
    }
  
    function drawDiagram() {
      window.joint = joint;
      // khởi tạo các đối tượng erd, graph, paper
    
      var erd = joint.shapes.erd;
    
      initDiagram();

      addMouseEnterElementEvent(paper);
      addMouseLeaveElementEvent(paper);
      addDoubleClickElementEvent(paper);
      addChangePositionElementEvent(graph);
      addPointerDownEvent(paper);
      addPointerUpEvent(paper);
    
      //let elements = new Array(elementJSON.elements.length);
      let links = new Array(linkJSON.links.length);
      
    
      // duyệt mảng JSON từ input, lấy các giá trị id, type, paragraph, x, y gán vào elements
    
      elements = [];
      elementJSON.elements.forEach((item) => {
        if (item) {
          let element = createElementFromItem(item, zoom);
          graph.addCell(element);
          elements.push(element);
        }
        //elements[item.id - 1] = element;
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
        <div style={{backgroundColor: 'lavender', display: 'inline-block', float: 'left', width: '800px', height: '550px', overflow: 'scroll'}}>
          <div id="paper"></div>
        </div>
        <div style={{float: 'right', width: '100px', marginLeft: '-100px', padding: '0px'}}>
          <List component="nav" aria-label="secondary mailbox folders" >
            {panel.map((panelItem, panelIndex) => (
              <ListItem button style={{width:'100px'}} onClick={() => createElement(panelItem, panelIndex)}>
                <img src={panelItem.img} alt={panelItem.title} title={panelItem.title} style={{width:'100px', height:'40px'}}/>
              </ListItem>
            ))}
          </List>
          {/* <div>
            <Button onClick={() => {if (zoom < 0.9) setZoom(zoom + 0.1)}}>
              <AddIcon/>
            </Button>
            <Button onClick={() => {if (zoom > 0.1) setZoom(zoom - 0.1)}}>
              <RemoveIcon/>
            </Button>
            <label>{zoom.toPrecision(2)}</label>
          </div> */}
        </div>
        {/* <Slider
          orientation="vertical"
          min={0}
          step={0.01}
          max={1}
          defaultValue={0.5}
          aria-labelledby="vertical-slider"
          style={{height: 300}}
          onChange={(event, value) => setZoom(value)}
        /> */}

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