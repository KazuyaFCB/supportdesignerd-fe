import * as joint from 'jointjs';
import {bindingErrorMap} from "../components/Diagram";
window.joint = joint

export class elementTools_Boundary {
    constructor() {
        return new joint.elementTools.Boundary();
    }
}

export class elementTools_RemoveButton {
    constructor() {
        return new joint.elementTools.Remove({
            x: '50%',
            y: '50%',
            markup: [{
                tagName: 'circle',
                selector: 'button',
                attributes: {
                    'r': 10,
                    'stroke': 'white',
                    'stroke-width': 1,
                    'fill': 'red',
                    'cursor': 'pointer'
                }
            }, {
                tagName: 'text',
                textContent: 'X',
                selector: 'icon',
                attributes: {
                    'fill': 'white',
                    'font-size': 15,
                    'text-anchor': 'middle',
                    'font-weight': 'bold',
                    'pointer-events': 'none',
                    'y': '0.3em'
                }
            }]
        });
    }
}

export class elementTools_ErrorButton {
    constructor() {
        return new joint.elementTools.Button({
            x: '0%',
            y: '50%',
            markup: [{
                tagName: 'circle',
                selector: 'button',
                attributes: {
                    'r': 10,
                    'stroke': 'white',
                    'stroke-width': 1,
                    'fill': 'red',
                    'cursor': 'pointer'
                }
            }, {
                tagName: 'text',
                textContent: '!',
                selector: 'icon',
                attributes: {
                    'fill': 'white',
                    'font-size': 15,
                    'text-anchor': 'middle',
                    'font-weight': 'bold',
                    'pointer-events': 'none',
                    'y': '0.3em'
                }
            }],
            action: function (evt) {
                alert(bindingErrorMap[this.model.id]);
                //alert('View id: ' + this.id + '\n' + 'Model id: ' + this.model.id);
            }
        });
    }
}

export class linkTools_Vertices {
    constructor() {
        return new joint.linkTools.Vertices({ snapRadius: 0 });
    }
}

export class linkTools_RemoveButton {
    constructor() {
        return new joint.linkTools.Remove({
            //distance: 20
            x: '50%',
            y: '50%',
            markup: [{
                tagName: 'circle',
                selector: 'button',
                attributes: {
                    'r': 10,
                    'stroke': 'white',
                    'stroke-width': 1,
                    'fill': 'red',
                    'cursor': 'pointer'
                }
            }, {
                tagName: 'text',
                textContent: 'X',
                selector: 'icon',
                attributes: {
                    'fill': 'white',
                    'font-size': 15,
                    'text-anchor': 'middle',
                    'font-weight': 'bold',
                    'pointer-events': 'none',
                    'y': '0.3em'
                }
            }]
        });
    }
}

export class linkTools_ErrorButton {
    constructor() {
        return new joint.linkTools.Button({
            distance: '35%',
            markup: [{
                tagName: 'circle',
                selector: 'button',
                attributes: {
                    'r': 10,
                    'stroke': 'white',
                    'stroke-width': 1,
                    'fill': 'red',
                    'cursor': 'pointer'
                }
            }, {
                tagName: 'text',
                textContent: '!',
                selector: 'icon',
                attributes: {
                    'fill': 'white',
                    'font-size': 15,
                    'text-anchor': 'middle',
                    'font-weight': 'bold',
                    'pointer-events': 'none',
                    'y': '0.3em'
                }
            }],
            action: function () {
                alert(bindingErrorMap[this.model.id]);
                //alert('View id: ' + this.id + '\n' + 'Model id: ' + this.model.id);
            }
        });
    }
}