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
    
    const fontSize = 12;
    const elementHeight = 40;
    let [zoom, setZoom] = useState(1.0); // 100%

    let elements = [];
    let mapLinkIdToNumber = {};

    let start = 0;
    let end = 0;
    let editText = null;
    let editTextBlock = null;
    let rect = null;
    let objectSelectedToUpdate = null;
    let objectSelectedToRead = null;
    let [isOpenDeleteElementDialog, setIsOpenDeleteElementDialog] = useState(false);
    
    let [elementSelectedToDelete, setElementSelectedToDelete] = useState(null);
    //let [objectSelectedToUpdate, setobjectSelectedToUpdate] = useState(null);
    let linkSelectedToDelete = null;

    const panel = [{
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

    function updateInputLinkJSON() {
      if (document.getElementById("inputLinkJSON")) {
        document.getElementById("inputLinkJSON").value = JSON.stringify(linkJSON);
      }
    }

    // CREATE element when click on panel
    function createElement(panelItem, panelIndex) {
      let item = { id: elementJSON.elements.length + 1, x: 0, y: 0, type: panelItem.title, paragraph: "      ", width: 100, height: 50};
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

    // READ object type when hover mouse on it
    async function addMouseEnterObjectEvent(paper) {
      paper.on("element:mouseenter", function(elementView, evt) {
        objectSelectedToRead = elementView.model;
        if (rect || editTextBlock || !elementJSON.elements[objectSelectedToRead.id-1]) return;
        readObjectType(objectSelectedToRead.prop('position').x, objectSelectedToRead.prop('position').y, elementJSON.elements[objectSelectedToRead.id - 1].type);
      })
      paper.on("link:mouseenter", function(linkView, evt) {
        objectSelectedToRead = linkView.model;
        if (rect || editTextBlock || !linkJSON.links[mapLinkIdToNumber[objectSelectedToRead.id] - 1]) return;
        readObjectType(evt.pageX - 400, evt.pageY - 50, linkJSON.links[mapLinkIdToNumber[objectSelectedToRead.id] - 1].type);
      })
    }

    async function addMouseLeaveObjectEvent(paper) {
      paper.on("element:mouseleave", function(elementView, evt) {
        unreadObjectType();
      });
      paper.on("link:mouseleave", function(linkView, evt) {
        unreadObjectType();
      });
    }

    function readObjectType(objectX, objectY, text) {
      let rectWidth = 150;
      let rectHeight = 30;
      let diff = 0;
      if (objectSelectedToRead.prop('type') !== "erd.Line") {
        if (!elementJSON.elements[objectSelectedToRead.id-1]) return;
      }
      else {
        if (!linkJSON.links[mapLinkIdToNumber[objectSelectedToRead.id] - 1]) return;
      }

      if (objectSelectedToRead.prop('size'))
        diff = -(rectWidth - objectSelectedToRead.prop('size').width) / 2;
      
      rect = new joint.shapes.basic.Rect({
        position: { x: objectX + diff, y: objectY - 40},
        size: { width: rectWidth, height: rectHeight },
        attrs: { rect: { fill: 'pink' }, text: { 
          text: text, 
          fill: 'black', 'font-weight': 'bold','font-variant': 'small-caps' }}
      });
      graph.addCells([rect]);
    }

    function unreadObjectType() {
      graph.removeCells([rect]);
      objectSelectedToRead = null;
      rect = null;
    }

    // UPDATE object paragraph when double click
    async function addDoubleClickObjectEvent(paper) {
      paper.on('element:pointerdblclick', function(elementView) {
        //setobjectSelectedToUpdate(elementView.model);
        objectSelectedToUpdate = elementView.model;
        displayTextBlockToType(elementView.model.prop('position').x, elementView.model.prop('position').y, elementView.model.prop('size').width, elementView.model.prop('size').height, elementView.model.attr("text/text"));
        addClickOutsideTextBlockEvent();
      });
      paper.on('link:pointerdblclick', function(linkView, evt) {
        objectSelectedToUpdate = linkView.model;
        displayTextBlockToType(evt.pageX - 400, evt.pageY - 50, 100, 50, linkView.model.label()['attrs']['text']['text']);
        addClickOutsideTextBlockEvent();
      });
    }

    function displayTextBlockToType(objectX, objectY, objectWidth, objectHeight, text) {
      let contentHTML = '<div><input id="editText" type="text" style="background-color:white; color:orange; font-weight:bold;" value="' + text + '"/></div>';
      editTextBlock = new joint.shapes.basic.TextBlock({
        position: { x: objectX, y: objectY},
        size: { width: objectWidth, height: objectHeight },
        attrs: { rect: { fill: 'transparent' }},
        content: contentHTML
      });
      graph.addCells([editTextBlock]);
      editText = document.getElementById("editText");
      if (editText) {
        editText.focus();
        editText.setSelectionRange(0, text.length);
      }
    }

    function addClickOutsideTextBlockEvent() {
      window.addEventListener('click',function(e){
        if(editText && e.target != editText){
          updateObjectParagraph();
        }
      });
    }

    function removeClickOutSideTextBlockEvent() {
      window.removeEventListener('click',function(e){
        if(editText && e.target != editText){
          updateObjectParagraph();
        }
      });
    }

    function updateObjectParagraph() {
      let newObjectParagraph = editText.value;
      if (objectSelectedToUpdate.resize)
        objectSelectedToUpdate.resize(newObjectParagraph.length * fontSize, elementHeight);
      objectSelectedToUpdate.attr('text/text', newObjectParagraph);
      
      if (objectSelectedToUpdate.prop('type') !== "erd.Line") {
        if (elementJSON.elements[objectSelectedToUpdate.id - 1]) {
          elementJSON.elements[objectSelectedToUpdate.id - 1].paragraph = newObjectParagraph;
          updateInputElementJSON();
        }
      }
      else {
        if (linkJSON.links[mapLinkIdToNumber[objectSelectedToUpdate.id] - 1]) {
          linkJSON.links[mapLinkIdToNumber[objectSelectedToUpdate.id] - 1].paragraph = newObjectParagraph;
          updateInputLinkJSON();
        }
      }

      graph.removeCells([editTextBlock]);
      //setobjectSelectedToUpdate(null);
      objectSelectedToUpdate = null;
      //setEditTextBlock(null);
      editTextBlock = null;
      editText = null;
      removeClickOutSideTextBlockEvent();
      
      //sessionStorage.setItem("elementJSON", JSON.stringify(elementJSON));
    }
    
    // UPDATE position object when drop and drag object
    function addChangePositionObjectEvent(graph) {
      graph.on('change:position', function(cell) {
        unreadObjectType(); // xoa label info cua object

        //var center = cell.getBBox().center();
        let topLeft = cell.getBBox().topLeft();
        topLeft = topLeft.toString();
        let token = topLeft.split("@");
        let newX = Number(token[0]);
        let newY = Number(token[1]);
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
          //elementSelectedToDelete = elementView.model;
          setElementSelectedToDelete(elementView.model);
          //pop up dialog
          setIsOpenDeleteElementDialog(true);
        }
      })
    }

    async function addDeleteLinkEvent(graph) {
      graph.on('remove', function(cell, evt) {
        if (cell.isLink()) {
          linkSelectedToDelete = cell;
          deleteLink();
        }
      })
    }

    function deleteElement() {
      if (elementSelectedToDelete) {
        for (let i = elementJSON.elements.length - 1; i > -1; i--) {
          if (elementJSON.elements[i] && elementJSON.elements[i].id === elementSelectedToDelete.id) {
            elementJSON.elements[i] = null;
            break;
          }
        }
        elementSelectedToDelete.remove();
        setElementSelectedToDelete(null);
        //elementSelectedToDelete = null;
        updateInputElementJSON();
      }
    }

    function deleteLink() {
      if (linkSelectedToDelete) {
        for (let i = linkJSON.links.length - 1; i > -1; i--) {
          if (linkJSON.links[i] && linkJSON.links[i].id === mapLinkIdToNumber[linkSelectedToDelete.id]) {
            linkJSON.links[i] = null;
            break;
          }
        }
        //linkSelectedToDelete.remove();
        linkSelectedToDelete = null;
        updateInputLinkJSON();
      }
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
            position: { x: item.x * zoom, y: item.y * zoom },
            size: { width: item.width * zoom, height: item.height * zoom },
            attrs: { 
              text: { text: item.paragraph, fill: "white", 'font-size': fontSize, 'font-weight': 'bold' } 
            }
          };
      }
      return element;
    }

    function createLinkFromItem(item) {
      let link = null;
      link = {
        type: "erd." + item.type,
        source: elements[item.sourceId - 1],
        target: elements[item.targetId - 1],
        labels: [ { attrs: { 
          text: { text: item.paragraph, fill: "red", 'font-size': fontSize, 'font-weight': 'bold' }, 
          rect: { fill: "none" }
         } } ] 
      }
      return link;
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

      addMouseEnterObjectEvent(paper);
      addMouseLeaveObjectEvent(paper);
      addDoubleClickObjectEvent(paper);
      addChangePositionObjectEvent(graph);
      addPointerDownEvent(paper);
      addPointerUpEvent(paper);
      addDeleteLinkEvent(graph);
    
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
    
      // duyệt mảng linkJSON từ input để vẽ các đường nối
      linkJSON.links.forEach((item, index) => {
        if (item) {
          let link = createLinkFromItem(item);
          graph.addCell(link);
          mapLinkIdToNumber[graph.getLastCell().id] = index + 1;
        }
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
        </div>

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