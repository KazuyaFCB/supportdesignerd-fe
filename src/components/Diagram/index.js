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

import {AssociativeEntity, PartialKeyAttribute, DashedLine, Line, DoubleLine} from "../../utils/myerd";
import {checkElementBindingError, checkLinkBindingError} from "../../utils/bindingErrorInErd";
import {elementTools_Boundary, elementTools_RemoveButton, elementTools_ErrorButton, linkTools_Vertices, linkTools_RemoveButton, linkTools_ErrorButton} from "../../utils/toolsView";
import * as joint from 'jointjs';
window.joint = joint;

const useStyles = makeStyles((theme) => ({
  gridList: {
    flexWrap: 'nowrap',
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: 'translateZ(0)',
  }
}))

export let bindingErrorMap = {};

export default function Diagram({elementJSON, linkJSON, imageWidth, imageHeight }) {
    const classes = useStyles();
    let graph = null;
    let paper = null;
    let erd = joint.shapes.erd;
    
    const fontSize = 12;
    const elementHeight = 40;
    let [zoom, setZoom] = useState(1.0); // 100%

    let elements = [];
    let mapLinkIdToNumber = {}; // convert string to number (id)
    let mapNumberToLinkId = {}; // convert number to string (id)

    
    let editText = null;
    let editTextBlock = null;
    let rect = null;
    let rectForOptions = null;

    let objectSelectedToUpdate = null;
    let objectSelectedToRead = null;
    let [isOpenDeleteElementDialog, setIsOpenDeleteElementDialog] = useState(false);
    
    //let [elementSelectedToDelete, setElementSelectedToDelete] = useState(null);
    let elementSelectedToDelete = null;
    //let [objectSelectedToUpdate, setobjectSelectedToUpdate] = useState(null);
    let linkSelectedToDelete = null;
    let linkPanelSelectedToCreate = null;

    //let [bindingErrorList, setBindingErrorList] = useState([]);
    //let [bindingErrorListView, setBindingErrorListView] = useState([]);

    const panel = [{
        img: "https://www.conceptdraw.com/How-To-Guide/picture/erd-symbols-and-meanings/ERD-Symbols-Entity.png",
        title: "Entity"
      }, {
        img: "https://www.conceptdraw.com/How-To-Guide/picture/erd-symbols-and-meanings/ERD-Symbols-Weak-Entity.png",
        title: "WeakEntity"
      }, {
        img: "https://www.conceptdraw.com/How-To-Guide/picture/erd-symbols-and-meanings/ERD-Symbols-Relationship.png",
        title: "Relationship"
      }, {
        img: "https://www.conceptdraw.com/How-To-Guide/picture/erd-symbols-and-meanings/ERD-Symbols-Identifying-Relationship.png",
        title: "IdentifyingRelationship"
      }, {
        img: "https://www.conceptdraw.com/How-To-Guide/picture/erd-symbols-and-meanings/ERD-Symbols-Associative-Entity.png",
        title: "AssociativeEntity"
      }, {
        img: "https://www.conceptdraw.com/How-To-Guide/picture/erd-symbols-and-meanings/ERD-Symbols-Attribute.png",
        title: "Attribute"
      }, {
        img: "https://www.conceptdraw.com/How-To-Guide/picture/erd-symbols-and-meanings/ERD-Symbols-Key-attribute.png",
        title: "Key"
      }, {
        img: "https://www.conceptdraw.com/How-To-Guide/picture/erd-symbols-and-meanings/ERD-Symbols-Multivalue-attribute.png",
        title: "Multivalued"
      }, {
        img: "https://www.conceptdraw.com/How-To-Guide/picture/erd-symbols-and-meanings/ERD-Symbols-Derived-attribute.png",
        title: "Derived"
      }, {
        img: "https://vertabelo.com/blog/chen-erd-notation/chen-notation-partial-key-attribute.png",
        title: "PartialKeyAttribute"
      }, {
        img: "https://www.conceptdraw.com/How-To-Guide/picture/erd-entity-relationship-diagram-symbols/ERD-Symbols-Relationships-Many-to-Many-5.png",
        title: "Line"
      }
    ]

    useEffect(() => {
      updateInputElementJSON();
      updateInputLinkJSON();
    }, [])

    useEffect(() => {
      drawDiagram();
    }, [elementJSON.elements, linkJSON.links]);

    // useEffect(() => {
    //   renderBindingErrorListView();
    // }, [bindingErrorList]);

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

    function unselectLinkPanel() {
      if (linkPanelSelectedToCreate) {
        linkPanelSelectedToCreate.style.backgroundColor = 'transparent';
        linkPanelSelectedToCreate = null;
      }
    }

    // CREATE element when click on panel
    function createElement(panelItem, panelIndex) {
      if (panelIndex <= 9) {
        let item = { id: elementJSON.elements.length + 1, x: 0, y: 0, type: panelItem.title, paragraph: "      ", width: 100, height: 50};
        elementJSON.elements.push(item);
        updateInputElementJSON();
        if (!graph) {
          drawDiagram();
        } else {
          let element = createElementFromItem(item, zoom);
          graph.addCell(element);
          changeBindingErrorList();
        }
      }
      else {
        //document.getElementsByClassName("createElementButton")[panelIndex].style.backgroundColor = "skyblue";
        //linkPanelSelectedToCreate = document.getElementsByClassName("createElementButton")[panelIndex];
        //paper.setInteractivity(false);
      }
      //sessionStorage.setItem("elementJSON", JSON.stringify(elementJSON));
    }

    // async function addClickToBlankEvent(paper) {
    //   paper.on("blank:click", function() {
    //     //unselectLinkPanel();
    //   })
    // }

    // READ object type when hover mouse on it
    async function addMouseEnterObjectEvent(paper) {
      paper.on("element:mouseenter", function(elementView, evt) {
        objectSelectedToRead = elementView.model;
        if (rect || editTextBlock || !elementJSON.elements[objectSelectedToRead.id-1]) return;
        readObjectType(objectSelectedToRead.prop('position').x, objectSelectedToRead.prop('position').y, elementJSON.elements[objectSelectedToRead.id - 1].type, "element");

        //Ref: https://resources.jointjs.com/tutorial/element-tools
        if(elementView.hasTools("has-error-button")) {
          elementView.addTools(new joint.dia.ToolsView({
            name: 'has-error-button',
            tools: [
              new elementTools_Boundary(),
              new elementTools_RemoveButton(),
              new elementTools_ErrorButton()
            ]
          }))
        } else {
          elementView.addTools(new joint.dia.ToolsView({
            tools: [
              new elementTools_Boundary(),
              new elementTools_RemoveButton()
            ]
          }))
        }
      })
      paper.on("link:mouseenter", function(linkView, evt) {
        objectSelectedToRead = linkView.model;
        if (rect || editTextBlock || !linkJSON.links[mapLinkIdToNumber[objectSelectedToRead.id] - 1]) return;
        let linkX = (elementJSON.elements[linkJSON.links[mapLinkIdToNumber[objectSelectedToRead.id] - 1].sourceId - 1].x + elementJSON.elements[linkJSON.links[mapLinkIdToNumber[objectSelectedToRead.id] - 1].targetId - 1].x) / 2;
        let linkY = (elementJSON.elements[linkJSON.links[mapLinkIdToNumber[objectSelectedToRead.id] - 1].sourceId - 1].y + elementJSON.elements[linkJSON.links[mapLinkIdToNumber[objectSelectedToRead.id] - 1].targetId - 1].y) / 2;
        readObjectType(linkX, linkY, linkJSON.links[mapLinkIdToNumber[objectSelectedToRead.id] - 1].type, "link");

        // Ref: https://stackoverflow.com/questions/58716443/jointjs-how-to-change-colour-of-remove-link-icon
        if(linkView.hasTools("has-error-button")) {
          linkView.addTools(new joint.dia.ToolsView({
            name: 'has-error-button',
            tools: [
              new linkTools_Vertices(),
              new linkTools_RemoveButton(),
              new linkTools_ErrorButton()
            ]
          }))
        } else {
          linkView.addTools(new joint.dia.ToolsView({
            tools: [
              new linkTools_Vertices(),
              new linkTools_RemoveButton()
            ]
          }))
        }
      })
    }

    async function addMouseLeaveObjectEvent(paper) {
      paper.on("element:mouseleave", function(elementView, evt) {
        unreadObjectType();

        if(elementView.hasTools("has-error-button")) {
          elementView.removeTools();
          elementView.addTools(new joint.dia.ToolsView({
            name: 'has-error-button',
            tools: [ new elementTools_ErrorButton() ]
          }))
        }
        else {
          elementView.removeTools();
        }
      });
      paper.on("link:mouseleave", function(linkView, evt) {
        unreadObjectType();
        
        if(linkView.hasTools("has-error-button")) {
          linkView.removeTools();
          linkView.addTools(new joint.dia.ToolsView({
            name: 'has-error-button',
            tools: [ new linkTools_ErrorButton() ]
          }))
        }
        else {
          linkView.removeTools();
        }
      });
    }

    function readObjectType(objectX, objectY, text, elementOrLink) {
      let rectWidth = 150;
      let rectHeight = 30;
      let diff = 0;
      if (elementOrLink === "element") {
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
        //unselectLinkPanel();
        //setobjectSelectedToUpdate(elementView.model);
        objectSelectedToUpdate = elementView.model;
        if (elementJSON.elements[elementView.model.prop('id') - 1].type === "PartialKeyAttribute") {
          displayTextBlockToType(elementView.model.prop('position').x, elementView.model.prop('position').y, elementView.model.prop('size').width, elementView.model.prop('size').height, elementView.model.attr("label/text"));
        } else {
          displayTextBlockToType(elementView.model.prop('position').x, elementView.model.prop('position').y, elementView.model.prop('size').width, elementView.model.prop('size').height, elementView.model.attr("text/text"));
        }
        addClickOutsideTextBlockEvent("element");
      });
      paper.on('link:pointerdblclick', function(linkView, evt) {
        //unselectLinkPanel();
        objectSelectedToUpdate = linkView.model;
        let linkX = (elementJSON.elements[linkJSON.links[mapLinkIdToNumber[objectSelectedToRead.id] - 1].sourceId - 1].x + elementJSON.elements[linkJSON.links[mapLinkIdToNumber[objectSelectedToRead.id] - 1].targetId - 1].x) / 2;
        let linkY = (elementJSON.elements[linkJSON.links[mapLinkIdToNumber[objectSelectedToRead.id] - 1].sourceId - 1].y + elementJSON.elements[linkJSON.links[mapLinkIdToNumber[objectSelectedToRead.id] - 1].targetId - 1].y) / 2;
        displayTextBlockToType(linkX, linkY, 100, 50, linkView.model.label()['attrs']['text']['text']);
        addClickOutsideTextBlockEvent("link");
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

    function addClickOutsideTextBlockEvent(elementOrLink) {
      window.addEventListener('click',function(e){
        if(editText && e.target != editText){
          updateObjectParagraph(elementOrLink);
        }
      });
    }

    function removeClickOutSideTextBlockEvent(elementOrLink) {
      window.removeEventListener('click',function(e){
        if(editText && e.target != editText){
          updateObjectParagraph(elementOrLink);
        }
      });
    }

    function updateObjectParagraph(elementOrLink) {
      let newObjectParagraph = editText.value;
      if (objectSelectedToUpdate.resize && elementJSON.elements[objectSelectedToUpdate.prop('id') - 1].type !== "AssociativeEntity" && elementJSON.elements[objectSelectedToUpdate.prop('id') - 1].type !== "PartialKeyAttribute")
        objectSelectedToUpdate.resize(newObjectParagraph.length * fontSize, elementHeight);
      
      if (elementOrLink === "element" && elementJSON.elements[objectSelectedToUpdate.prop('id') - 1].type === "PartialKeyAttribute") {
        objectSelectedToUpdate.attr('label/text', newObjectParagraph);
      } else {
        objectSelectedToUpdate.attr('text/text', newObjectParagraph);
      }

      if (elementOrLink === "element") {
        if (elementJSON.elements[objectSelectedToUpdate.id - 1]) {
          elementJSON.elements[objectSelectedToUpdate.id - 1].paragraph = newObjectParagraph;
          updateInputElementJSON();
          changeBindingErrorList();
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
        //unselectLinkPanel();

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

    // DELETE element
    
    async function addDeleteObjectEvent(graph) {
      graph.on('remove', function(cell, evt) {
        if (cell.isLink()) {
          //unselectLinkPanel();
          linkSelectedToDelete = cell;
          deleteLink();
        }
        else if (cell.isElement() && cell != rect && cell != editTextBlock) {
          elementSelectedToDelete = cell;
          deleteElement();
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
        //setElementSelectedToDelete(null);
        elementSelectedToDelete = null;
        updateInputElementJSON();
        changeBindingErrorList();
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
        changeBindingErrorList();
      }
    }

    function createElementFromItem(item, zoom) {
      let element = null;
      switch (item.type) {
        case "AssociativeEntity":
          element = new AssociativeEntity({
            id: item.id,
            position: { x: item.x * zoom, y: item.y * zoom },
            size: { width: item.width * zoom, height: item.height * zoom },
            attrs: { text: { text: item.paragraph } }
          });
          element.addTo(graph);
          element = element.diamond;
          break;
        case "PartialKeyAttribute":
          element = new PartialKeyAttribute({
            id: item.id,
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
      switch (item.type) {
        // case "Link":
        //     link = new joint.shapes.standard.Link();
        //     break;
        case "PartialParticipation":
            link = new Line();
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

      //addClickToBlankEvent(paper);
      addMouseEnterObjectEvent(paper);
      addMouseLeaveObjectEvent(paper);
      addDoubleClickObjectEvent(paper);
      addChangePositionObjectEvent(graph);
      
      addDeleteObjectEvent(graph);
    }

    function drawElement() {
      // duyệt mảng JSON từ input, lấy các giá trị id, type, paragraph, x, y gán vào elements
      elements = [];
      elementJSON.elements.forEach((item) => {
        if (item) {
          let element = createElementFromItem(item, zoom);
          graph.addCell(element);
          elements.push(element);
          //alert(JSON.stringify(graph.getCell(item.id)))
        } else {
          elements.push(null);
        }
        //elements[item.id - 1] = element;
      });
    }

    function drawLink() {
      // duyệt mảng linkJSON từ input để vẽ các đường nối
      linkJSON.links.forEach((item, index) => {
        if (item) {
          let link = createLinkFromItem(item);
          link.addTo(graph).set({
            labels: [{
                attrs: {
                    text: { text: item.paragraph, fill: 'red', 'font-size': fontSize, 'font-weight': 'bold' },
                    rect: { fill: 'none' }
                }
            }]
          }).set('smooth', true);
          graph.addCell(link);
          mapLinkIdToNumber[graph.getLastCell().id] = index + 1;
          mapNumberToLinkId[index + 1] = graph.getLastCell().id;
        }
      });
    }

    function changeBindingErrorList() {
      //setBindingErrorList([]);
      let result = []
      elementJSON.elements.forEach((element) => {
        if (element) {
          let errorName = checkElementBindingError(element, linkJSON);
          let elementView = graph.getCell(element.id).findView(paper);
          if (errorName) {
            elementView.addTools(new joint.dia.ToolsView({
              name: 'has-error-button',
              tools: [
                new elementTools_ErrorButton()
              ]
            }));
            bindingErrorMap[element.id] = errorName;
            result.push(errorName);
          }
          else {
            elementView.removeTools();
          }
        }
      });
      linkJSON.links.forEach((link) => {
        if (link) {
          let errorName = checkLinkBindingError(link, elementJSON);
          //alert(JSON.stringify(graph.getCell(link.id)));
          if (!graph.getCell(mapNumberToLinkId[link.id])) return;
          let linkView = graph.getCell(mapNumberToLinkId[link.id]).findView(paper);
          if (errorName) {
            linkView.addTools(new joint.dia.ToolsView({
              name: 'has-error-button',
              tools: [
                new linkTools_ErrorButton()
              ]
            }));
            bindingErrorMap[mapNumberToLinkId[link.id]] = errorName;
            result.push(errorName);
          }
        }
      })
      //setBindingErrorList(result);
    }

    function drawDiagram() {
      //window.joint = joint;
      // khởi tạo các đối tượng erd, graph, paper
    
      //var erd = joint.shapes.erd;
    
      initDiagram();

      //let elements = new Array(elementJSON.elements.length);
      //let links = new Array(linkJSON.links.length);

      drawElement();
      drawLink();

      changeBindingErrorList();
    }

    return (
      <div>
        <div style={{display: 'inline-block', float: 'left', width: '85%'}}>
          <div style={{backgroundColor: 'lavender', height: '570px', overflow: 'scroll'}}>
            <div id="paper"></div>
          </div>
          {/* <div style={{backgroundColor: 'pink', overflow: 'scroll', height: '120px'}}>
            <ul>
              {bindingErrorListView}
            </ul>
          </div> */}
        </div>
        <div style={{float: 'right', width: '15%', marginLeft: '0px', padding: '0px'}}>
          <ul style={{width: '100%', height: '570px', overflowY: 'scroll', overflowX: 'hidden', listStyleType: 'none'}} component="nav" aria-label="secondary mailbox folders" >
            {panel.map((panelItem, panelIndex) => (
                <li className="createElementButton" button onClick={() => createElement(panelItem, panelIndex)}>
                  <Button >
                    <img src={panelItem.img} alt={panelItem.title} title={panelItem.title} style={{height:'40px'}}/>
                  </Button>                
                </li>
            ))}
          </ul>
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