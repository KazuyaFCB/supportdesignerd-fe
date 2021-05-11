import { useState, useEffect } from "react"

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
} from "react-router-dom";
import * as automl from '@tensorflow/tfjs-automl';
import Cookies from 'js-cookie';

import Header from "../../components/Header";
import SignIn from "../../components/Header/SignIn";
import SignUp from "../../components/Header/SignUp";
import Diagram from "../../components/Diagram";
import DiagramList from "../../components/Header/DiagramList";
import axios from "../../utils/axios";


//import MessageBox from "../../components/MessageBox";

export default function User() {
    let [imgSrc, setImgSrc] = useState(""); 
    
    let [elementJSON, setElementJSON] = useState({elements: []});
    
    let [linkJSON, setLinkJSON] = useState({links: []});
    let [imageWidth, setImageWidth] = useState(2667);
    let [imageHeight, setImageHeight] = useState(2000);

    let [currentUser, setCurrentUser] = useState(null);
    let [diagramList, setDiagramList] = useState([]);
    let [currentViewedErd, setCurrentViewedErd] = useState(null); //erd viewed when click view button in list

    useEffect(async () => {
        let currentUsername = Cookies.get(['currentUsername']);
        if (currentUsername) {
            const api = await axios.get("/api/users/find-user-by-username/" + currentUsername);
            setCurrentUser(api.data);
        }
        const elementJSONStr = sessionStorage.getItem("elementJSON");
        const linkJSONStr = sessionStorage.getItem("linkJSON");
        const imgSrcStr = sessionStorage.getItem("imgSrc");
        if (elementJSONStr) setElementJSON(JSON.parse(elementJSONStr));
        if (linkJSONStr) setLinkJSON(JSON.parse(linkJSONStr));
        if (imgSrcStr) setImgSrc(JSON.parse(imgSrcStr));
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

    async function getImgSrcFromImgFile() {
        const imageFile = document.getElementById("imageFile").files[0];
        const formData = new FormData();
        formData.append("file", imageFile);
        const api = await axios.post("/api/erds/get-img-src-from-img-file", formData);
        setImgSrc(api.data.imgSrc);
        sessionStorage.setItem("imgSrc", api.data.imgSrc);
        getImageFileSize(imageFile);
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
        if (!imgSrc) {
            alert("Haven't uploaded the file yet")
            return;
        }
        const imageFile = document.getElementById("imageFile").files[0];
        // ref: https://stackoverflow.com/questions/42318829/html5-input-type-file-read-image-data
        let imageData = new Image();
        imageData.src = window.URL.createObjectURL(imageFile);
        const shapePredictions = await getShapePredictions(imageData);
        const linkPredictions = await getLinkPredictions(imageData);
        //const cardinalPredictions = await getCardinalPredictions(imageData);
        //getImageFileSize(imageFile);
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("size", [imageWidth, imageHeight]);
        formData.append("shape_predictions", JSON.stringify(shapePredictions));
        formData.append("link_predictions", JSON.stringify(linkPredictions));
        //formData.append("cardinal_predictions", JSON.stringify(cardinalPredictions));
        console.log(shapePredictions);
        console.log(linkPredictions);
        

        let api = await axios.post("/api/erds/get-erd", formData);
        setElementJSON(api.data.elementJSON);
        setLinkJSON(api.data.linkJSON);
        setCurrentViewedErd(null);
    }

    async function getShapePredictions(imageData) {
        const model = await automl.loadObjectDetection('/shape_model_js/model.json');
        const options = {score: 0.4, iou: 0.5, topk: 50};
        const predictions = await model.detect(imageData, options);
        return predictions;
    }

    async function getLinkPredictions(imageData) {
        const model = await automl.loadObjectDetection('/link_model_js/model.json');
        const options = {score: 0.5, iou: 0.5, topk: 50};
        const predictions = await model.detect(imageData, options);
        return predictions;
    }

    async function getCardinalPredictions(imageData) {
        const model = await automl.loadObjectDetection('/cardinal_model_js/model.json');
        const options = {score: 0.5, iou: 0.5, topk: 50};
        const predictions = await model.detect(imageData, options);
        return predictions;
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

            <body style={{backgroundImage: 'url(https://cdn.wallpapersafari.com/86/19/LTbraQ.jpg)'}}>
                <Router>
                    <Switch>
                        <Route path={"/*"}>
                            <Header currentUser={currentUser} signOut={signOut}/>
                            
                            <Route exact path={"/"}>
                                
                            </Route>
                            <Route path={'/sign-in'}>
                                <div>
                                    <SignIn />
                                </div>
                            </Route>   
                            <Route path={'/sign-up'}>
                                <div>
                                    <SignUp />
                                </div>
                            </Route>
                            <Route path={'/diagram-list'}>
                                <div>
                                    <DiagramList currentUser={currentUser} diagramList={diagramList} setDiagramList={setDiagramList} setCurrentViewedErd={setCurrentViewedErd} setElementJSON={setElementJSON} setLinkJSON={setLinkJSON}/>
                                </div>
                            </Route>   
                            <Route path={'/image-to-diagram'}>
                                <div style={{display: 'inline-block', width: '30%'}}>
                                    <img id='img' src={imgSrc} width='100%'/>
                                    <form encType="multipart/form-data" onSubmit={(e) => {e.preventDefault(); convertImageToDiagram()}} >
                                        <label for="img">Select image:</label>
                                        <input type="file" id="imageFile" name="imageFile" accept="image/*" onChange={(e) => {e.preventDefault(); getImgSrcFromImgFile()}}/>
                                        <br/>
                                        <input type="submit" value="Convert"/>
                                    </form>
                                </div>
                                <div style={{display: "inline-block", float: 'right', width: '70%'}}>
                                    <Diagram elementJSON={elementJSON} linkJSON={linkJSON} imageWidth={imageWidth} imageHeight={imageHeight} currentUser={currentUser} saveDiagram={saveDiagram}/>
                                </div>
                                
                            </Route>
                            <Route path={'/json-to-diagram'}>
                                <div style={{display: 'inline-block', float: 'left', width: '30%'}}>
                                    <form>
                                        <h5>Input Element JSON</h5>
                                        <textarea id="inputElementJSON" rows="9" cols="37"></textarea>
                                        <br/>
                                    </form>
                                    <form onSubmit={(e) => {e.preventDefault(); convertJSONToDiagram()}} style={{display: 'inline-block', float: 'left'}}>
                                        <h5>Input Link JSON</h5>
                                        <textarea id="inputLinkJSON" rows="9" cols="37"></textarea>
                                        <br/>
                                        <input type="submit" value="Convert"></input>
                                    </form>
                                </div>
                                
                                <div style={{display: "inline-block", float: 'right', width: '70%', height: '550px'}}>
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