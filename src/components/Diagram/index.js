import { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import Slider from '@material-ui/core/Slider';
//import AddIcon from '@material-ui/icons/Add';
//import RemoveIcon from '@material-ui/icons/Remove';

import $ from 'jquery';

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

export default function Diagram({elementJSON, linkJSON, imageWidth, imageHeight, currentUser, saveDiagram }) {
    const classes = useStyles();
    let graph = null;
    let paper = null;
    let erd = joint.shapes.erd;
    
    let fontSize = 40;
    const elementHeight = 80;
    let zoom = 0.5; // 40%

    let elements = [];
    let mapLinkIdToNumber = {}; // convert string to number (id)
    let mapNumberToLinkId = {}; // convert number to string (id)

    
    let editText = null;
    let editTextBlock = null;
    let rect = null;

    let objectSelectedToUpdate = null;
    let objectSelectedToRead = null;
    let [isOpenDeleteElementDialog, setIsOpenDeleteElementDialog] = useState(false);
    
    //let [elementSelectedToDelete, setElementSelectedToDelete] = useState(null);
    let elementSelectedToDelete = null;
    //let [objectSelectedToUpdate, setobjectSelectedToUpdate] = useState(null);
    let linkSelectedToDelete = null;
    let linkPanelIndexSelectedToCreate = -1;
    let sourceElementIdConnectedToLinkCreated = -1;
    let rectCoverElementToCreateLink = null;

    //let [bindingErrorList, setBindingErrorList] = useState([]);
    //let [bindingErrorListView, setBindingErrorListView] = useState([]);

    // Ref: https://www.conceptdraw.com/How-To-Guide/erd-entity-relationship-diagram-symbols
    // https://www.lucidchart.com/pages/er-diagrams
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
        img: "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/chart/seo/ERD/discovery/erd-chens-11.svg",
        title: "PartialParticipation"
      }, {
        img: "https://static.thenounproject.com/png/1729063-200.png",
        title: "TotalParticipation"
      }, {
        img: "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/chart/seo/ERD/discovery/erd-barkers-04.svg",
        title: "Optional"
      }
    ]

    useEffect(() => {
      updateInputElementJSON();
      updateInputLinkJSON();
      drawDiagram();
    }, [elementJSON.elements, linkJSON.links]);

    useEffect(() => {
      if (paper)
        paper.setDimensions(imageWidth, imageHeight);
    }, [imageWidth, imageHeight]);


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

    async function unselectLinkPanel() {
      //alert(rectCoverElementToCreateLink);
      if (linkPanelIndexSelectedToCreate != -1) {
        document.getElementsByClassName("createElementButton")[linkPanelIndexSelectedToCreate].style.backgroundColor = "transparent";
        if (rectCoverElementToCreateLink) {
          graph.removeCells([rectCoverElementToCreateLink]);
          rectCoverElementToCreateLink = null;
        }
        linkPanelIndexSelectedToCreate = -1;
        sourceElementIdConnectedToLinkCreated = -1;
      }
    }

    // CREATE element when click on panel
    async function createElement(panelItem, panelIndex) {
      if (panelIndex <= 9) {
        let item = { id: elementJSON.elements.length + 1, x: 0, y: 0, type: panelItem.title, paragraph: "      ", width: 200, height: 100};
        elementJSON.elements.push(item);
        updateInputElementJSON();
        if (!graph) {
          drawDiagram();
        } else {
          let element = createElementFromItem(item);
          graph.addCell(element);
          elements.push(element);
          changeBindingErrorList();
        }
      }
      else {
        document.getElementsByClassName("createElementButton")[panelIndex].style.backgroundColor='skyblue';
        linkPanelIndexSelectedToCreate = panelIndex;
        //paper.setInteractivity(false);
      }
      //sessionStorage.setItem("elementJSON", JSON.stringify(elementJSON));
    }

    function addClickToBlankEvent(paper) {
      paper.on("blank:click", function() {
        unselectLinkPanel();
      })
    }

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
              new elementTools_RemoveButton(fontSize),
              new elementTools_ErrorButton(fontSize)
            ]
          }))
        } else {
          elementView.addTools(new joint.dia.ToolsView({
            tools: [
              new elementTools_Boundary(),
              new elementTools_RemoveButton(fontSize)
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
              new linkTools_RemoveButton(fontSize),
              new linkTools_ErrorButton(fontSize)
            ]
          }))
        } else {
          linkView.addTools(new joint.dia.ToolsView({
            tools: [
              new linkTools_Vertices(),
              new linkTools_RemoveButton(fontSize)
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
            tools: [ new elementTools_ErrorButton(fontSize) ]
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
            tools: [ new linkTools_ErrorButton(fontSize) ]
          }))
        }
        else {
          linkView.removeTools();
        }
      });
    }

    function readObjectType(objectX, objectY, text, elementOrLink) {
      //const fontSize = 20;
      let rectWidth = text.length * fontSize;
      let rectHeight = fontSize * 2;
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
        position: { x: objectX + diff, y: objectY - rectHeight},
        size: { width: rectWidth, height: rectHeight },
        attrs: { rect: { fill: 'pink' }, text: { 
          text: text, 
          fill: 'black', 'font-weight': 'bold','font-variant': 'small-caps',
          'font-size': fontSize
          }
        }
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
      paper.on('element:pointerdblclick', async function(elementView) {
        //setobjectSelectedToUpdate(elementView.model);
        objectSelectedToUpdate = elementView.model;
        if (elementJSON.elements[elementView.model.prop('id') - 1].type === "PartialKeyAttribute") {
          displayTextBlockToType(elementView.model.prop('position').x, elementView.model.prop('position').y, elementView.model.prop('size').width, elementView.model.prop('size').height, elementView.model.attr("label/text"));
        } else {
          displayTextBlockToType(elementView.model.prop('position').x, elementView.model.prop('position').y, elementView.model.prop('size').width, elementView.model.prop('size').height, elementView.model.attr("text/text"));
        }
        addClickOutsideTextBlockEvent("element");
      });
      paper.on('link:pointerdblclick', function(linkView) {
        objectSelectedToUpdate = linkView.model;
        let linkX = (elementJSON.elements[linkJSON.links[mapLinkIdToNumber[objectSelectedToRead.id] - 1].sourceId - 1].x + elementJSON.elements[linkJSON.links[mapLinkIdToNumber[objectSelectedToRead.id] - 1].targetId - 1].x) / 2;
        let linkY = (elementJSON.elements[linkJSON.links[mapLinkIdToNumber[objectSelectedToRead.id] - 1].sourceId - 1].y + elementJSON.elements[linkJSON.links[mapLinkIdToNumber[objectSelectedToRead.id] - 1].targetId - 1].y) / 2;
        displayTextBlockToType(linkX, linkY, (linkView.model.label()['attrs']['text']['text'].length + 5) * fontSize, elementHeight, linkView.model.label()['attrs']['text']['text']);
        addClickOutsideTextBlockEvent("link");
      });
    }

    function displayTextBlockToType(objectX, objectY, objectWidth, objectHeight, text) {
      let contentHTML = '<div><input id="editText" type="text" style="background-color:white; color:orange; font-weight:bold; font-size:' + fontSize +  'px" value="' + text + '"/></div>';
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
      if (newObjectParagraph == "" && elementOrLink == "element") {
        newObjectParagraph = "      ";
      }
      if (objectSelectedToUpdate.resize && elementJSON.elements[objectSelectedToUpdate.prop('id') - 1].type !== "AssociativeEntity" && elementJSON.elements[objectSelectedToUpdate.prop('id') - 1].type !== "PartialKeyAttribute")
        objectSelectedToUpdate.resize(newObjectParagraph.length * fontSize, elementHeight);
      
      if (elementOrLink === "element" && elementJSON.elements[objectSelectedToUpdate.prop('id') - 1] && elementJSON.elements[objectSelectedToUpdate.prop('id') - 1].type === "PartialKeyAttribute") {
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
          changeBindingErrorList();
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

    // DELETE element
    async function addDeleteObjectEvent(graph) {
      graph.on('remove', function(cell, evt) {
        if (cell.isLink()) {
          linkSelectedToDelete = cell;
          deleteLink();
        }
        else if (cell.isElement() && cell != rect && cell != editTextBlock) {
          elementSelectedToDelete = cell;
          deleteElement();
          unselectLinkPanel();
        }
        unreadObjectType();
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

    function addClickElementEvent(paper) {
      paper.on('element:pointerclick', function(elementView) {
        if (linkPanelIndexSelectedToCreate != -1 && rectCoverElementToCreateLink != elementView.model) {
          if (rectCoverElementToCreateLink != null) {
            if (sourceElementIdConnectedToLinkCreated != elementView.model.prop('id')){
              createLink(sourceElementIdConnectedToLinkCreated, elementView.model.prop('id'));
            }
          } else {
            sourceElementIdConnectedToLinkCreated = elementView.model.prop('id');
            createRectCoverElementToCreateLink(elementView.model)
          }
        }
      })
    }

    function createRectCoverElementToCreateLink(element) {
      rectCoverElementToCreateLink = new joint.shapes.basic.Rect({
        position: { x: element.prop('position').x, y: element.prop('position').y },
        size: { width: element.prop('size').width, height: element.prop('size').height },
        attrs: { rect: { fill: 'skyblue', opacity: '0.8' }
        }
      });
      element.embed(rectCoverElementToCreateLink);
      graph.addCells([rectCoverElementToCreateLink]);
    }

    function createLink(sourceId, targetId) {
      let item = {id: linkJSON.links.length + 1, type: panel[linkPanelIndexSelectedToCreate].title, paragraph: "", sourceId: sourceId, targetId: targetId};
      linkJSON.links.push(item);
      updateInputLinkJSON();
      if (!graph) {
        drawDiagram();
      } else {
        let link = createLinkFromItem(item);
        link.addTo(graph).set({
          labels: [{
              attrs: {
                  text: { text: item.paragraph, fill: 'blue', 'font-size': fontSize, 'font-weight': 'bold' },
                  rect: { fill: 'none' }
              }
          }]
        })
        graph.addCell(link);
        changeBindingErrorList();
        mapLinkIdToNumber[graph.getLastCell().id] = item.id;
        mapNumberToLinkId[item.id] = graph.getLastCell().id;
        unselectLinkPanel();
      }
    }

    function createElementFromItem(item) {
      // let words = item.paragraph.split("\n");
      // let maxWordLen = Math.max(words.map((item) => {
      //   return item.length;
      // }));
      //const fontSize = 25;
      let itemWidth = item.width;
      //let itemWidth = fontSize * maxWordLen > item.width ? fontSize * maxWordLen : item.width;
      //let itemWidth = fontSize * maxWordLen;
      let itemHeight = item.height;
      //let itemHeight = fontSize * words.length * 2;
      let element = null;
      switch (item.type) {
        case "AssociativeEntity":
          element = new AssociativeEntity({
            id: item.id,
            position: { x: item.x, y: item.y },
            size: { width: itemWidth, height: itemHeight },
            attrs: { 
              text: { text: item.paragraph, fill: "black", 'font-size': fontSize } 
            }
          });
          element.addTo(graph);
          element = element.diamond;
          break;
        case "PartialKeyAttribute":
          element = new PartialKeyAttribute({
            id: item.id,
            position: { x: item.x, y: item.y },
            size: { width: itemWidth, height: itemHeight },
            attrs: { 
              text: { text: item.paragraph, fill: "red", 'font-size': fontSize }
            }
          });
          element.addTo(graph);
          element = element.text;
          break;
        case "Key":
          element = {
            id: item.id,
            type: "erd." + item.type,
            position: { x: item.x, y: item.y },
            size: { width: itemWidth, height: itemHeight },
            attrs: { 
              text: { text: item.paragraph, fill: "red", 'font-size': fontSize, 'font-weight': 'bold' },
              //https://github.com/clientIO/joint/blob/master/demo/erd/src/erd.js
              '.outer': {
                fill: 'white',
                stroke: 'black'
              },
              '.inner': {
                  fill: 'white',
                  stroke: 'black'
              } 
            }
          };
          break;
        default:
          element = {
            id: item.id,
            type: "erd." + item.type,
            position: { x: item.x, y: item.y },
            size: { width: itemWidth, height: itemHeight },
            attrs: { 
              text: { text: item.paragraph, fill: "black", 'font-size': fontSize, 'font-weight': 'bold' },
              //https://github.com/clientIO/joint/blob/master/demo/erd/src/erd.js
              '.outer': {
                fill: 'white',
                stroke: 'black'
              },
              '.inner': {
                  fill: 'white',
                  stroke: 'black'
              } 
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
      // if (graph || paper) {
      //   graph.clear();
      //   paper.remove();
      // }      
      graph = new joint.dia.Graph();
      
      customizeGraph(graph);
    
      paper = new joint.dia.Paper({
        el: document.getElementById("paper"),
        model: graph,
        // width: imageWidth,
        // height: imageHeight,
        width: 2667,
        height: 2000,
        restrictTranslate: true
      });
      paper.scale(zoom, zoom);
      addClickToBlankEvent(paper);
      addMouseEnterObjectEvent(paper);
      addMouseLeaveObjectEvent(paper);
      addDoubleClickObjectEvent(paper);
      addChangePositionObjectEvent(graph);

      addDeleteObjectEvent(graph);
      addClickElementEvent(paper);
    }

    function drawElement() {
      let len = elementJSON.elements.length;
      fontSize = Number.MAX_VALUE;
      for (let i=0;i<len;i++){
        if (!elementJSON.elements[i]) continue
        let words = elementJSON.elements[i].paragraph.split("\n");
        if (words[0] == "") continue;
        let maxWordLen = Math.max(words.map((item) => {
          return item.length;
        }));
        //if (maxWordLen <= 2) maxWordLen = 3;
        if (fontSize > elementJSON.elements[i].width / (maxWordLen) + 10)
          fontSize = elementJSON.elements[i].width / (maxWordLen) + 10;
      }
      if (fontSize == Number.MAX_VALUE) fontSize = 30;
      
      // duyệt mảng JSON từ input, lấy các giá trị id, type, paragraph, x, y gán vào elements
      elements = [];
      elementJSON.elements.forEach((item) => {
        if (item) {
          let element = createElementFromItem(item);
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
                    text: { text: item.paragraph, fill: 'blue', 'font-size': fontSize, 'font-weight': 'bold' },
                    rect: { fill: 'none' }
                }
            }]
          })
          //.set('smooth', true);
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
          let errorName = checkElementBindingError(element, elementJSON, linkJSON);
          let elementView = graph.getCell(element.id).findView(paper);
          if (errorName) {
            elementView.addTools(new joint.dia.ToolsView({
              name: 'has-error-button',
              tools: [
                new elementTools_ErrorButton(fontSize)
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
                new linkTools_ErrorButton(fontSize)
              ]
            }));
            bindingErrorMap[mapNumberToLinkId[link.id]] = errorName;
            result.push(errorName);
          }
          else {
            linkView.removeTools();
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

    function newDiagram(){
      initDiagram();
      window.location.reload();
    }

    // set height that use viewport percentages
    //https://stackoverflow.com/questions/18934141/set-div-height-to-fit-to-the-browser-using-css/18934195
    return (
      <div>
        <div style={{display: 'inline-block', float: 'left', width: '85%'}}>
          <div style={{backgroundColor: 'rgba(230, 246, 254, 1)', height: '90vh', overflow: 'scroll'}}>
            <div id="paper"></div>
          </div>
        </div>
        <div style={{float: 'right', width: '15%', height: '90vh', marginLeft: '0px', display: 'flex'}}>
          <Slider
            orientation="vertical"
            min={0}
            step={0.01}
            max={1}
            defaultValue={zoom}
            aria-labelledby="vertical-slider"
            style={{ height: 300}}
            onChange={(event, value) => { zoom = value; paper.scale(zoom, zoom); }}
          />
          <ul style={{ marginLeft: '-50px', overflowY: 'scroll', overflowX: 'hidden', listStyleType: 'none'}} component="nav" aria-label="secondary mailbox folders" >
            <li>
              <Button style={{height:'30px', width: '90px'}} variant="contained" color="primary" onClick={() => newDiagram()}>
                NEW
              </Button>
            </li>
            <li><br/></li>
            <li>
              <Button style={{height:'30px', width: '90px'}} variant="contained" color="secondary" hidden={!currentUser} onClick={saveDiagram}>
                SAVE
              </Button>
            </li>
            {panel.map((panelItem, panelIndex) => (
                <li className="createElementButton" button onClick={() => createElement(panelItem, panelIndex)}>
                  <Button >
                    <img style={{backgroundColor: 'green'}} src={panelItem.img} alt={panelItem.title} title={panelItem.title} style={{height:'80px', width: '90px'}}/>
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