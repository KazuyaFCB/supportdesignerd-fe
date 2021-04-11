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

export default function User() {
    let [imgSrc, setImgSrc] = useState(null); 
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
        //const id = "60717cd12963b855e845ea0a";
        //const id = "607186a059f69e1555687108";
        //const id = "6071b598cb935c0e92c45c5b";
        //const id = "6071e34aba46f97afe7c6f88";
        const id = "60727febd0c05777cff4a0db";
        const api = await axios.get("/find-erd-by-id/" + id);
        setImgSrc(api.data.imgSrc);
        //setImgSrc(api.data.image)
    }

    async function deleteErdById() {
        const id = "60727febd0c05777cff4a0db";
        const api = await axios.post("/delete-erd-by-id", {id: id});
    }

    async function convertImageToDiagram() {
        const imageFile = document.getElementById("imageFile").files[0].name;
        const api = await axios.post("/create-erd", {imageFile: imageFile});
        setImgSrc(api.data.imgSrc);
        setElementJSON(api.data.elementJSON);
    }

    function convertJSONToDiagram() {
        let inputJSON = document.getElementById("inputJSON").value;
        
        //inputJSON ='{"elements": [{"id": 1, "type": "Normal", "paragraph": "      ", "x": 80, "y": 430}, {"id": 2, "type": "Normal", "paragraph": "      ", "x": 80, "y": 430}] }';
        setElementJSON(JSON.parse(inputJSON));
        
        //alert(JSON.stringify(inputJSON));
        
        //alert(JSON.stringify(elementJSON));
        
    }

    useEffect(() => {

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
                                <form onSubmit={(e) => {e.preventDefault(); convertImageToDiagram()}} >
                                    <label for="img">Select image:</label>
                                    <input type="file" id="imageFile" name="imageFile" accept="image/*" />
                                    <input type="submit" value="Convert to diagram"/>
                                </form>
                                <Diagram elementJSON={elementJSON} linkJSON={linkJSON}/>
                            </Route>
                            <Route path={'/json-to-diagram'}>
                            <div>
                                <form onSubmit={(e) => {e.preventDefault(); convertJSONToDiagram()}}>
                                    <h1>Input JSON</h1>
                                    <textarea id="inputJSON" name="Text1" cols="50" rows="15"></textarea>
                                    <input type="submit" value="Convert"></input>
                                </form>
                            </div>
                            <Diagram elementJSON={elementJSON} linkJSON={linkJSON}/>
                            </Route>
                        </Route>
                    </Switch>
                </Router>
            </body>

        </html>
    )
}