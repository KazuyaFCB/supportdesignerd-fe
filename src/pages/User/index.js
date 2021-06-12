import { useState, useEffect } from "react"

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
} from "react-router-dom";
import * as automl from '@tensorflow/tfjs-automl';
//import * as cvstfjs from '@microsoft/customvision-tfjs';

import Cookies from 'js-cookie';

import Header from "../../components/Header";
import SignIn from "../../components/Header/SignIn";
import SignUp from "../../components/Header/SignUp";
import Diagram from "../../components/Diagram";
import DiagramList from "../../components/Header/DiagramList";
import axios from "../../utils/axios";
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

//import MessageBox from "../../components/MessageBox";

export default function User() {
    let [imgSrc, setImgSrc] = useState(""); 
    let [language, setLanguage] = useState("vn");
    
    let [elementJSON, setElementJSON] = useState({elements: []});
    
    let [linkJSON, setLinkJSON] = useState({links: []});
    let [imageWidth, setImageWidth] = useState(2667);
    let [imageHeight, setImageHeight] = useState(2000);

    let [currentUser, setCurrentUser] = useState(null);
    let [diagramList, setDiagramList] = useState([]);
    let [currentViewedErd, setCurrentViewedErd] = useState(null); //erd viewed when click view button in list

    let [openLoading, setOpenLoading] = useState(false);

    let [imgId, setImgId] = useState("000000000000000000000000");

    useEffect(async () => {
        let currentUsername = Cookies.get(['currentUsername']);
        if (currentUsername) {
            const api = await axios.get("/api/users/find-user-by-username/" + currentUsername);
            setCurrentUser(api.data);
        }
        const elementJSONStr = sessionStorage.getItem("elementJSON");
        const linkJSONStr = sessionStorage.getItem("linkJSON");
        const imgSrcStr = sessionStorage.getItem("imgSrc");
        const imgIdStr = sessionStorage.getItem("imgId");
        if (elementJSONStr) setElementJSON(JSON.parse(elementJSONStr));
        if (linkJSONStr) setLinkJSON(JSON.parse(linkJSONStr));
        if (imgSrcStr) setImgSrc(imgSrcStr);
        if (imgIdStr) setImgId(imgIdStr);
    }, []);
    useEffect(async() => {
        if (currentUser) {
            const api = await axios.get('/api/erds/find-erd-by-userIdCreated/' + currentUser._id);
            setDiagramList(api.data.erdList);
        }
    }, [currentUser]);

    window.onbeforeunload = function() {
        sessionStorage.setItem("elementJSON", JSON.stringify(elementJSON));
        sessionStorage.setItem("linkJSON", JSON.stringify(linkJSON));
        sessionStorage.setItem("imgSrc", imgSrc);
        sessionStorage.setItem("imgId", imgId);
    }  

    window.onunload = async function() {
        await axios.get('/api/tmp-uploaded-imgs/delete-tmp-uploaded-img-by-id/' + imgId);
    }

    const useScript = url => {
        useEffect(() => {
          const script = document.createElement('script');
      
          script.src = url;
          script.async = true;
      
          document.body.appendChild(script);
      
          return () => {
            document.body.removeChild(script);
          }
        }, [url]);
    };
    useScript('https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js');
    useScript('https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js');

    useScript('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js');
    useScript('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/js/bootstrap.bundle.min.js');
    
    useScript("https://unpkg.com/@tensorflow/tfjs");

    useScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.0.0");
    useScript("https://unpkg.com/@microsoft/customvision-tfjs@1.2.0");
    
    async function getImgSrcFromImgFile() {
        // Ref: https://stackoverflow.com/questions/5802580/html-input-type-file-get-the-image-before-submitting-the-form
        const imageFile = document.getElementById("imageFile").files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
            setImgSrc(e.target.result);
        };
        reader.readAsDataURL(imageFile);
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("imgId", imgId);
        setOpenLoading(true);
        const api = await axios.post("/api/erds/get-img-src-from-img-file", formData);
        setOpenLoading(false);
        //setImgSrc(api.data.imgSrc);
        //sessionStorage.setItem("imgSrc", api.data.imgSrc);
        getImageFileSize(imageFile);
        setImgId(api.data.imgId);
        sessionStorage.setItem("imgId", api.data.imgId);
    }

     // GET THE IMAGE WIDTH AND HEIGHT USING fileReader() API.
    function getImageFileSize(file) {
        let reader = new FileReader(); // CREATE AN NEW INSTANCE.
        reader.onload = function (e) {
            var img = new Image();      
            img.src = e.target.result;

            img.onload = function () {
                setImageWidth(this.width);
                setImageHeight(this.height);
            }
        };
        reader.readAsDataURL(file);
    }


    async function convertImageToDiagram() {
        const imageFile = document.getElementById("imageFile").files[0];
        if (!imageFile) {
            alert("Haven't uploaded the file yet")
            return;
        }
        // ref: https://stackoverflow.com/questions/42318829/html5-input-type-file-read-image-data
        let imageData = new Image();
        imageData.src = window.URL.createObjectURL(imageFile);
        const shapePredictions = await getShapePredictions(imageData);
        //const linkPredictions = await getLinkPredictions(imageData);
        //cropShapeImg(imageData, shapePredictions);
        //return;
        //const cardinalPredictions = await getCardinalPredictions(imageData);
        //console.log(cardinalPredictions); 

        //getImageFileSize(imageFile);
        //const formData = new FormData();
        //formData.append("file", imageFile);
        // formData.append("size", [imageWidth, imageHeight]);
        // formData.append("shape_predictions", JSON.stringify(shapePredictions));
        // formData.append("language", language)
        // formData.append("imgId", imgId)
        setOpenLoading(true);
        //let api = await axios.post("/api/erds/get-erd", formData);
        let api = await axios.post("/api/erds/get-erd", {size: imageWidth + "," + imageHeight, shape_predictions: JSON.stringify(shapePredictions), language: language, imgId: imgId});
        setOpenLoading(false);
        setElementJSON(api.data.elementJSON);
        setLinkJSON(api.data.linkJSON);
        setCurrentViewedErd(null);
    }

    async function getShapePredictions(imageData) {
        const model = await automl.loadObjectDetection('/models/shape/model.json');
        const options = {score: 0.3, iou: 0.5, topk: 50};
        const predictions = await model.detect(imageData, options);
        return predictions;
    }

    // async function getLinkDetectionPredictions(imageData) {
    //     const model = new window.cvstfjs.ObjectDetectionModel();
    //     await model.loadModelAsync('/models/link/detection/model.json');
    //     const predictions = await model.executeAsync(imageData);
    //     return predictions;
    // }

    // async function getLinkPredictions2(imageData) {
    //     let linkPredictions = [];
    //     const labelArray = ["dauSac","dauHuyen","dauSac","dauSac2"];
    //     const linkDetectionPredictions = await getLinkDetectionPredictions(imageData);
    //     let len = linkDetectionPredictions[0].length;
    //     for(let i=0;i<len;i++){
    //         if (linkDetectionPredictions[1][i]<0.2) continue;
    //         linkPredictions.push({
    //           box: {
    //             left: linkDetectionPredictions[0][i][0]*imageWidth,
    //             top: linkDetectionPredictions[0][i][1]*imageHeight,
    //             width: (linkDetectionPredictions[0][i][2]-linkDetectionPredictions[0][i][0])*imageWidth,
    //             height: (linkDetectionPredictions[0][i][3]-linkDetectionPredictions[0][i][1])*imageHeight,
    //           }, 
    //           label: labelArray[linkDetectionPredictions[2][i]],
    //           score: linkDetectionPredictions[1][i]
    //         });
    //     }
    //     return linkPredictions;
    // }

    // async function getLinkPredictions(imageData) {
    //     const model1 = await automl.loadObjectDetection('/models/link/single_link/model.json');
    //     const model2 = await automl.loadObjectDetection('/models/link/double_link/model.json');
    //     const options = {score: 0.3, iou: 0.5, topk: 50};
    //     let predictions = await model1.detect(imageData, options);
    //     predictions.push(...await model2.detect(imageData, options));
    //     return predictions;
    // }

    //const image = document.getElementById('img');
    async function getCardinalDetectionPredictions(imageData) {
        let model = new window.cvstfjs.ObjectDetectionModel();
        await model.loadModelAsync('/models/cardinal/detection/model.json');
        const predictions = await model.executeAsync(imageData);
        return predictions;
    }

    async function getCardinalClassificationPredictions(imageData) {
        let model = new window.cvstfjs.ClassificationModel();
        await model.loadModelAsync('/models/cardinal/classification/model.json');
        const predictions = await model.executeAsync(imageData);
        return predictions;
    }

    function classify(cardinalClassificationPredictions) {
        let max=-1, idx;
        for (let i=0;i<cardinalClassificationPredictions[0].length;i++){
            if (max<cardinalClassificationPredictions[0][i]){
                max=cardinalClassificationPredictions[0][i];
                idx=i;
            }
        }
        if (idx==0) return "(0..1)";
        if (idx==1) return "(0..n)";
        if (idx==2) return "(1..1)";
        if (idx==3) return "(1..n)";
    }

    async function getCardinalPredictions(imageData) {
        //crop img: https://stackoverflow.com/questions/39968756/javascript-crop-image-to-canvas
        let cardinalPredictions = [];
        // DETECT
        const cardinalDetectionPredictions = await getCardinalDetectionPredictions(imageData);
        let len = cardinalDetectionPredictions[0].length;
        for(let i=0;i<len;i++){
            if (cardinalDetectionPredictions[1][i]<0.2) continue;
            cardinalPredictions.push({
              box: {
                left: cardinalDetectionPredictions[0][i][0]*imageWidth,
                top: cardinalDetectionPredictions[0][i][1]*imageHeight,
                width: (cardinalDetectionPredictions[0][i][2]-cardinalDetectionPredictions[0][i][0])*imageWidth,
                height: (cardinalDetectionPredictions[0][i][3]-cardinalDetectionPredictions[0][i][1])*imageHeight,
              }, 
              label: "",
              score: cardinalDetectionPredictions[1][i]
            });
        }
        
        for(let i=0;i<cardinalPredictions.length;i++) {
            // CROP
            const canvas = document.createElement("canvas");
            canvas.width=cardinalPredictions[i].box.width;
            canvas.height=cardinalPredictions[i].box.height;
            const ctx = canvas.getContext('2d');
            //https://stackoverflow.com/questions/26015497/how-to-resize-then-crop-an-image-with-canvas
            ctx.drawImage(imageData,cardinalPredictions[i].box.left,cardinalPredictions[i].box.top,cardinalPredictions[i].box.width,cardinalPredictions[i].box.height,
                0,0,cardinalPredictions[i].box.width,cardinalPredictions[i].box.height);
            //https://stackoverflow.com/questions/16301449/convert-canvas-to-an-image-with-javascript
            let image = new Image();
            image.src = canvas.toDataURL();
            image.width=cardinalPredictions[i].box.width;
            image.height=cardinalPredictions[i].box.height;
            //CLASSIFY
            const cardinalClassificationPredictions = await getCardinalClassificationPredictions(image);
            const label = classify(cardinalClassificationPredictions);
            cardinalPredictions[i].label = label;
        }
        return cardinalPredictions;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function cropShapeImg(imageData, predictions) {
        //alert(predictions.length);
        let countAttribute=1;
        for(let i=0;i<predictions.length;i++) {
            if (predictions[i].label != "Attribute") continue;
            // CROP
            const canvas = document.createElement("canvas");
            canvas.width=predictions[i].box.width;
            canvas.height=predictions[i].box.height;
            const ctx = canvas.getContext('2d');
            //https://stackoverflow.com/questions/26015497/how-to-resize-then-crop-an-image-with-canvas
            ctx.drawImage(imageData,predictions[i].box.left,predictions[i].box.top,predictions[i].box.width,predictions[i].box.height,
                0,0,predictions[i].box.width,predictions[i].box.height);
            //https://stackoverflow.com/questions/16301449/convert-canvas-to-an-image-with-javascript
            let image = new Image();
            image.src = canvas.toDataURL();
            document.body.appendChild(document.createElement("br"));
            document.body.appendChild(canvas);

            //https://stackoverflow.com/questions/7034754/how-to-set-a-file-name-using-window-open
            //https://stackoverflow.com/questions/10473932/browser-html-force-download-of-image-from-src-dataimage-jpegbase64
            var link = document.createElement("a");
            link.href = image.src.replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
            link.download = "" + countAttribute + ".png";
            link.click();
            countAttribute++;
            if (countAttribute%10==1) await sleep(2000);
            
            //window.open(image.src.replace(/^data:image\/[^;]+/, 'data:application/octet-stream'),);
        }
    }

    function convertJSONToDiagram() {
        if (!document.getElementById("inputElementJSON") || !document.getElementById("inputLinkJSON")) return;
        let inputJSON = document.getElementById("inputElementJSON").value;
        let linkJSON = document.getElementById("inputLinkJSON").value;
        
        setElementJSON(JSON.parse(inputJSON));
        setLinkJSON(JSON.parse(linkJSON));
        setCurrentViewedErd(null);
        
        //alert(JSON.stringify(inputJSON));
        //alert(JSON.stringify(elementJSON));
    }

    async function saveDiagram() {
        let erdName;
        if (currentViewedErd) {
            let isUpdate = window.confirm("This diagram is exist. Do you want to update it?");
            if (isUpdate) {
                while(!erdName) erdName = prompt("Please type new ERD name:", currentViewedErd.erdName);
                const api = await axios.post("/api/erds/update-erd-by-id", {"erdId": currentViewedErd._id, "erdName": erdName, "imgSrc": imgSrc, "elementJSON": JSON.stringify(elementJSON), "linkJSON": JSON.stringify(linkJSON), "updatedDate": new Date()});
                if (api.data) {
                    alert("Update diagram successfully");
                }
                const api2 = await axios.get('/api/erds/find-erd-by-userIdCreated/' + currentUser._id);
                setDiagramList(api2.data.erdList);
                return;
            }
        }
        if (currentViewedErd) {
            while(!erdName) erdName = prompt("Please type new ERD name:", currentViewedErd.erdName);
        } else {
            while(!erdName) erdName = prompt("Please type new ERD name:");
        }
        const api = await axios.post("/api/erds/create-erd", {"userIdCreated": currentUser._id, "erdName": erdName, "imgSrc": imgSrc, "elementJSON": JSON.stringify(elementJSON), "linkJSON": JSON.stringify(linkJSON), "createdDate": new Date(), "updatedDate": new Date()});
        if (api.data) {
            alert("Save diagram successfully");
        }
        const api2 = await axios.get('/api/erds/find-erd-by-userIdCreated/' + currentUser._id);
        setDiagramList(api2.data.erdList);
    }

    function signOut() {
        Cookies.remove('currentUsername');
        setCurrentUser(null);
    }

    return (
        <html>
            <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/css/bootstrap.min.css"/>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"/>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Bitter:400,700"/>
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>
            </head>

            <body>
                <Router>
                    <Switch>
                        <Route path={"/*"}>
                            <Header currentUser={currentUser} signOut={signOut}/>
                            
                            <Route exact path={"/"}>
                                <div style={{backgroundImage: 'url(https://olc-wordpress-assets.s3.amazonaws.com/uploads/2019/10/E-Learning-with-blurred-city-abstract-lights-background.jpeg)', width: '100%', height: '550px'}}></div>
                            </Route>
                            <Route path={'/sign-in'}>
                                <div style={{backgroundImage: 'url(https://olc-wordpress-assets.s3.amazonaws.com/uploads/2019/10/E-Learning-with-blurred-city-abstract-lights-background.jpeg)', width: '100%', height: '550px', marginTop: '-60px'}}>
                                    <SignIn />
                                </div>
                            </Route>   
                            <Route path={'/sign-up'}>
                                <div style={{backgroundImage: 'url(https://olc-wordpress-assets.s3.amazonaws.com/uploads/2019/10/E-Learning-with-blurred-city-abstract-lights-background.jpeg)', width: '100%', height: '550px', marginTop: '-60px'}}>
                                    <SignUp />
                                </div>
                            </Route>
                            <Route path={'/diagram-list'}>
                                <div>
                                    <DiagramList currentUser={currentUser} diagramList={diagramList} setDiagramList={setDiagramList} setCurrentViewedErd={setCurrentViewedErd} setElementJSON={setElementJSON} setLinkJSON={setLinkJSON} setImgSrc={setImgSrc}/>
                                </div>
                            </Route>   
                            <Route path={'/image-to-diagram'}>
                                <div style={{backgroundColor: 'rgba(230, 246, 254, 1)', display: 'inline-block', width: '30%', height: '90vh'}}>
                                    <img id='img' src={imgSrc} width='100%' height='60%'/>
                                    <form style={{height: '40%'}} encType="multipart/form-data" onSubmit={(e) => {e.preventDefault(); convertImageToDiagram()}} >
                                        <label for="img">Select image:</label>
                                        <input type="file" id="imageFile" name="imageFile" accept="image/*" onChange={(e) => {e.preventDefault(); getImgSrcFromImgFile()}}/>
                                        <br/><br/>
                                        <label>
                                            <input type="radio" id="vietnamese" name="language" onClick={() => setLanguage("vn")} checked={language=="vn"}/>
                                            Vietnamese
                                        </label>
                                        <br/>
                                        <label>
                                            <input type="radio" id="english" name="language" onClick={() => setLanguage("en")} checked={language=="en"}/>
                                            English
                                        </label>
                                        <br/>
                                        <input type="submit" value="Convert"/>
                                    </form>
                                </div>
                                <div style={{display: "inline-block", float: 'right', width: '70%'}}>
                                    <Diagram elementJSON={elementJSON} linkJSON={linkJSON} imageWidth={imageWidth} imageHeight={imageHeight} currentUser={currentUser} saveDiagram={saveDiagram}/>
                                </div>
                                <Dialog open={openLoading} aria-labelledby="form-dialog-title">
                                    <DialogContent>
                                        <img src="https://c.tenor.com/I6kN-6X7nhAAAAAj/loading-buffering.gif" />
                                        <DialogContentText>
                                            Processing your request, please wait a moment...
                                        </DialogContentText>
                                    </DialogContent>
                                </Dialog>
                                
                            </Route>
                            <Route path={'/json-to-diagram'}>
                                <div style={{backgroundColor: 'rgba(230, 246, 254, 1)', display: 'inline-block', float: 'left', width: '30%', height: '90vh'}}>
                                    <form style={{height: '45%'}}>
                                        <h5 style={{color: 'red'}}>Input Element JSON</h5>
                                        <textarea id="inputElementJSON" style={{width: '100%', height: '80%', backgroundColor: 'rgba(243, 255, 229, 1)'}}></textarea>
                                        <br/>
                                    </form>
                                    <form style={{height: '55%'}} onSubmit={(e) => {e.preventDefault(); convertJSONToDiagram()}}>
                                        <h5 style={{color: 'red'}}>Input Link JSON</h5>
                                        <textarea id="inputLinkJSON" style={{width: '100%', height: '65%', backgroundColor: 'rgba(243, 255, 229, 1)'}}></textarea>
                                        <input type="submit" value="Convert"></input>
                                    </form>
                                </div>
                                
                                <div style={{display: "inline-block", float: 'right', width: '70%'}}>
                                    <Diagram elementJSON={elementJSON} linkJSON={linkJSON} imageWidth={imageWidth} imageHeight={imageHeight} currentUser={currentUser} saveDiagram={saveDiagram} />
                                </div>
                            </Route>
                        </Route>
                    </Switch>
                </Router>
            </body>
        </html>
    )
}