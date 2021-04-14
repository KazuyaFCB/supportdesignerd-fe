import { useState, useEffect } from "react"

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
} from "react-router-dom";

import Header from "../../components/Header";
import SignIn from "../../components/Header/SignIn";
import Diagram from "../../components/Diagram";
import axios from "../../utils/axios";
//import MessageBox from "../../components/MessageBox";

export default function User() {
    let [imgSrc, setImgSrc] = useState(""); 
    // let elementJSON = {
    //     elements: [{'id': 1, 'type': 'Normal', 'paragraph': '      ', 'x': 80, 'y': 430}, {'id': 2, 'type': 'Normal', 'paragraph': '      ', 'x': 186, 'y': 530}]
    // }
    let [elementJSON, setElementJSON] = useState({elements: []});
    // let [elementJSON, setElementJSON] = useState({
    //     elements: [{'id': 1, 'type': 'Normal', 'paragraph': '      ', 'x': 80, 'y': 430}, {'id': 2, 'type': 'Normal', 'paragraph': '      ', 'x': 186, 'y': 530}]
    // });
    let [linkJSON, setLinkJSON] = useState({
        links: []
    });
    
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
    }

    async function convertImageToDiagram() {
        if (!imgSrc) {
            alert("Haven't uploaded the file yet")
            return;
        }
        const api = await axios.post("/create-erd", {imgSrc: imgSrc});
        
        //const api = await axios.post("/create-erd", {imageFile: imageFile});
        
        
        setElementJSON(api.data.elementJSON);
    }

    function convertJSONToDiagram() {
        if (!document.getElementById("inputJSON")) return;
        let inputJSON = document.getElementById("inputJSON").value;
        
        //inputJSON ='{"elements": [{"id": 1, "type": "Normal", "paragraph": "      ", "x": 80, "y": 430}, {"id": 2, "type": "Normal", "paragraph": "      ", "x": 80, "y": 430}] }';
        setElementJSON(JSON.parse(inputJSON));
        
        //alert(JSON.stringify(inputJSON));
        
        //alert(JSON.stringify(elementJSON));
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

            <body>
                <Router>
                    <Switch>
                        <Route path={"/*"}>
                            
                                <Header/>
                            
                            <Route exact path={"/"}>
                                
                            </Route>
                            <Route path={'/sign-in'}>
                                <div>
                                    <SignIn />
                                </div>
                            </Route>   
                            <Route path={'/image-to-diagram'}>
                                <img width="600" height="400" src={imgSrc} />
                                <form encType="multipart/form-data" onSubmit={(e) => {e.preventDefault(); convertImageToDiagram()}} >
                                    <label for="img">Select image:</label>
                                    <input type="file" id="imageFile" name="imageFile" accept="image/*" onChange={(e) => {e.preventDefault(); getImgSrcFromImgFile()}}/>
                                    <input type="submit" value="Convert to diagram"/>
                                </form>
                                <Diagram elementJSON={elementJSON} setElementJSON={setElementJSON} linkJSON={linkJSON}/>
                                
                            </Route>
                            <Route path={'/json-to-diagram'}>
                            <div style={{display: 'inline-block', float: 'left', width: '200px'}}>
                                <form onSubmit={(e) => {e.preventDefault(); convertJSONToDiagram()}}>
                                    <h2>Input JSON</h2>
                                    <textarea id="inputJSON" name="Text1" cols="60" rows="20"></textarea>
                                    <input type="submit" value="Convert"></input>
                                </form>
                            </div>
                            <div style={{display: "inline-block", float: 'right', width: '700px'}}>
                                <Diagram elementJSON={elementJSON} setElementJSON={setElementJSON} linkJSON={linkJSON}/>
                                
                            </div>
                            </Route>
                        </Route>
                    </Switch>
                </Router>
            </body>

        </html>
    )
}