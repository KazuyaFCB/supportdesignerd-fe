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
import axios from "../../utils/axios";


//import MessageBox from "../../components/MessageBox";

export default function User() {
    let [imgSrc, setImgSrc] = useState(""); 
    
    let [elementJSON, setElementJSON] = useState({elements: []});
    
    let [linkJSON, setLinkJSON] = useState({
        links: []
    });
    let [imageWidth, setImageWidth] = useState(2667);
    let [imageHeight, setImageHeight] = useState(2000);

    let [currentUser, setCurrentUser] = useState(null);

    useEffect(async () => {
        let currentUsername = Cookies.get(['currentUsername']);
        if (currentUsername) {
            const api = await axios.get("/find-user-by-username/" + currentUsername);
            setCurrentUser(api.data);
        }
    }, [])

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
    useScript('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js');
    useScript('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/js/bootstrap.bundle.min.js');
    useScript("https://unpkg.com/@tensorflow/tfjs");
    
    async function findErd() {
        const api = await axios.get("/find-erd");
    }
    
    async function findErdById() {
        const id = "607428fabafe1b9b3c912dd9";
        const api = await axios.get("/find-erd-by-id/" + id);
        setImgSrc(api.data.imgSrc);
        //setImgSrc(api.data.image)
    }

    async function deleteErdById() {
        const id = "60727febd0c05777cff4a0db";
        const api = await axios.post("/delete-erd-by-id", {id: id});
    }

    async function getImgSrcFromImgFile() {
        const imageFile = document.getElementById("imageFile").files[0];
        const formData = new FormData();
        formData.append("file", imageFile);
        const api = await axios.post("/get-img-src-from-img-file", formData);
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
        //getImageFileSize(imageFile);
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("size", [imageWidth, imageHeight]);
        formData.append("shape_predictions", JSON.stringify(shapePredictions));
        formData.append("link_predictions", JSON.stringify(linkPredictions));
        console.log(shapePredictions);
        console.log(linkPredictions);
        

        let api = await axios.post("/get-erd", formData);
        setElementJSON(api.data.elementJSON);
        setLinkJSON(api.data.linkJSON);
    }

    async function getShapePredictions(imageData) {
        const model = await automl.loadObjectDetection('/shape_model_js/model.json');
        const options = {score: 0.5, iou: 0.5, topk: 50};
        const predictions = await model.detect(imageData, options);
        return predictions;
    }

    async function getLinkPredictions(imageData) {
        const model = await automl.loadObjectDetection('/link_model_js/model.json');
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
        
        //alert(JSON.stringify(inputJSON));
        //alert(JSON.stringify(elementJSON));
    }

    async function saveDiagram() {
        let erdName;
        while(!erdName) {
            erdName = prompt("Please type new ERD name:");
        }
        const api = await axios.post("/create-erd", {"erdName": erdName, "imgSrc": imgSrc, "elementJSON": JSON.stringify(elementJSON), "linkJSON": JSON.stringify(linkJSON), "createdDate": new Date(), "updatedDate": new Date()});
        if (api.data) {
            alert("Save diagram successfully");
        }
    }

    function signOut() {
        Cookies.remove('currentUsername');
        setCurrentUser(null);
    }

    useEffect(() => {
        setImgSrc(sessionStorage.getItem("imgSrc"));
    }, [])

    return (
        <html>
            <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/css/bootstrap.min.css"/>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"/>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Bitter:400,700"/>
            </head>

            <body style={{backgroundImage: 'url(https://cdn.wallpapersafari.com/86/19/LTbraQ.jpg)'}}>
                <Router>
                    <Switch>
                        <Route path={"/*"}>
                            <Header currentUser={currentUser} saveDiagram={saveDiagram} signOut={signOut}/>
                            
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
                            <Route path={'/image-to-diagram'}>
                                <div style={{display: 'inline-block', width: '30%'}}>
                                    <img id='img' src={imgSrc} width='100%'/>
                                    <form encType="multipart/form-data" onSubmit={(e) => {e.preventDefault(); convertImageToDiagram()}} >
                                        <label for="img">Select image:</label>
                                        <input type="file" id="imageFile" name="imageFile" accept="image/*" onChange={(e) => {e.preventDefault(); getImgSrcFromImgFile()}}/>
                                        <br/>
                                        <input type="submit" value="Convert to diagram"/>
                                    </form>
                                </div>
                                <div style={{display: "inline-block", float: 'right', width: '70%'}}>
                                    <Diagram elementJSON={elementJSON} linkJSON={linkJSON} imageWidth={imageWidth} imageHeight={imageHeight} />
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
                                    <Diagram elementJSON={elementJSON} linkJSON={linkJSON} imageWidth={imageWidth} imageHeight={imageHeight} />
                                    
                                </div>
                            </Route>
                        </Route>
                    </Switch>
                </Router>
            </body>

        </html>
    )
}