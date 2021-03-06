import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import * as automl from "@tensorflow/tfjs-automl";
//import * as cvstfjs from '@microsoft/customvision-tfjs';
import Cookies from "js-cookie";
import "./index.css";

import Header from "../../components/Header";
import SignIn from "../../components/Header/SignIn";
import SignUp from "../../components/Header/SignUp";
import Diagram from "../../components/Diagram";
import DiagramList from "../../components/Header/DiagramList";
import axios from "../../utils/axios";
import WaitingDialog from "../../components/WaitingDialog";

//import MessageBox from "../../components/MessageBox";
import Guide from "./../../components/Guide/index";

export default function User() {
  let [imgSrc, setImgSrc] = useState("");
  let [language, setLanguage] = useState("vn");

  let [elementJSON, setElementJSON] = useState({ elements: [] });

  let [linkJSON, setLinkJSON] = useState({ links: [] });
  let [imageWidth, setImageWidth] = useState(2667);
  let [imageHeight, setImageHeight] = useState(2000);

  let [currentUser, setCurrentUser] = useState(null);
  let [diagramList, setDiagramList] = useState([]);
  let [currentViewedErd, setCurrentViewedErd] = useState(null); //erd viewed when click view button in list

  let [openLoading, setOpenLoading] = useState(false);
  let [isConverting, setIsConverting] = useState(false);

  let [imgId, setImgId] = useState("000000000000000000000000");

  let [imageData, setImageData] = useState(null);

  let [fileName, setFileName] = useState("");

  useEffect(async () => {
    const elementJSONStr = sessionStorage.getItem("elementJSON");
    const linkJSONStr = sessionStorage.getItem("linkJSON");
    const imgSrcStr = sessionStorage.getItem("imgSrc");
    const imgIdStr = sessionStorage.getItem("imgId");
    if (elementJSONStr) setElementJSON(JSON.parse(elementJSONStr));
    if (linkJSONStr) setLinkJSON(JSON.parse(linkJSONStr));
    if (imgSrcStr) setImgSrc(imgSrcStr);
    if (imgIdStr) setImgId(imgIdStr);
    let currentUsername = Cookies.get(["currentUsername"]);
    if (currentUsername) {
      const api = await axios.get(
        "/api/users/find-user-by-username/" + currentUsername
      );
      setCurrentUser(api.data);
    }
  }, []);

  // useEffect(async() => {
  //     if (currentUser) {
  //         const api = await axios.get('/api/erds/find-erd-by-userIdCreated/' + currentUser._id);
  //         setDiagramList(api.data.erdList);
  //     }
  // }, [currentUser]);

  window.onbeforeunload = function () {
    sessionStorage.setItem("elementJSON", JSON.stringify(elementJSON));
    sessionStorage.setItem("linkJSON", JSON.stringify(linkJSON));
    sessionStorage.setItem("imgSrc", imgSrc);
    sessionStorage.setItem("imgId", imgId);
    sessionStorage.setItem("linkPanelIndexSelectedToCreate", "-1");
  };

  window.onunload = function () {
    axios.get("/api/tmp-uploaded-imgs/delete-tmp-uploaded-img-by-id/" + imgId);
  };

  const useScript = (url) => {
    useEffect(() => {
      const script = document.createElement("script");

      script.src = url;
      script.async = true;

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }, [url]);
  };
  useScript(
    "https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"
  );
  useScript(
    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"
  );

  useScript(
    "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"
  );
  useScript(
    "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/js/bootstrap.bundle.min.js"
  );

  useScript("https://unpkg.com/@tensorflow/tfjs");

  useScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.0.0");
  useScript("https://unpkg.com/@microsoft/customvision-tfjs@1.2.0");

  async function getImgSrcFromImgFile() {
    // Ref: https://stackoverflow.com/questions/5802580/html-input-type-file-get-the-image-before-submitting-the-form
    const imageFile = document.getElementById("imageFile").files[0];
    if (!imageFile) return;
    if (imageFile.size + 128 >= 4 * 1024 * 1024) {
      document.getElementById("imageFile").value = null;
      alert("Vui l??ng ch???n ???nh c?? k??ch c??? nh??? h??n 4MB!");
      return;
    }
    setOpenLoading(true);
    var reader = new FileReader();
    reader.onload = function (e) {
      setImgSrc(e.target.result);
    };
    reader.readAsDataURL(imageFile);
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("imgId", imgId);
    const api = await axios.post(
      "/api/erds/get-img-src-from-img-file",
      formData
    );
    // ref: https://stackoverflow.com/questions/42318829/html5-input-type-file-read-image-data
    let _imageData = new Image();
    _imageData.src = window.URL.createObjectURL(imageFile);
    setImageData(_imageData);

    setOpenLoading(false);
    //setImgSrc(api.data.imgSrc);
    //sessionStorage.setItem("imgSrc", api.data.imgSrc);
    getImageFileSize(imageFile);
    setImgId(api.data.imgId);
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
      };
    };
    reader.readAsDataURL(file);
  }

  async function convertImageToDiagram() {
    const imageFile = document.getElementById("imageFile").files[0];
    if (!imageFile) {
      alert("Ch??a ch???n t???p");
      return;
    }
    setIsConverting(true);
    setOpenLoading(true);
    // ref: https://stackoverflow.com/questions/42318829/html5-input-type-file-read-image-data
    // let imageData = new Image();
    // imageData.src = window.URL.createObjectURL(imageFile);
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
    //let api = await axios.post("/api/erds/get-erd", formData);
    let api = await axios.post("/api/erds/get-erd", {
      size: imageWidth + "," + imageHeight,
      shape_predictions: JSON.stringify(shapePredictions),
      language: language,
      imgId: imgId,
    });
    setOpenLoading(false);
    setIsConverting(false);
    setImageData(null);
    setElementJSON(api.data.elementJSON);
    setLinkJSON(api.data.linkJSON);
    sessionStorage.removeItem("currentViewedErd");
    document.getElementById("imageFile").value = "";
    setFileName("");
    //window.location.reload();
  }

  async function getShapePredictions(imageData) {
    const model = await automl.loadObjectDetection("/models/shape/model.json");
    const options = { score: 0.3, iou: 0.5, topk: 100 };
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
    await model.loadModelAsync("/models/cardinal/detection/model.json");
    const predictions = await model.executeAsync(imageData);
    return predictions;
  }

  async function getCardinalClassificationPredictions(imageData) {
    let model = new window.cvstfjs.ClassificationModel();
    await model.loadModelAsync("/models/cardinal/classification/model.json");
    const predictions = await model.executeAsync(imageData);
    return predictions;
  }

  function classify(cardinalClassificationPredictions) {
    let max = -1,
      idx;
    for (let i = 0; i < cardinalClassificationPredictions[0].length; i++) {
      if (max < cardinalClassificationPredictions[0][i]) {
        max = cardinalClassificationPredictions[0][i];
        idx = i;
      }
    }
    if (idx == 0) return "(0..1)";
    if (idx == 1) return "(0..n)";
    if (idx == 2) return "(1..1)";
    if (idx == 3) return "(1..n)";
  }

  async function getCardinalPredictions(imageData) {
    //crop img: https://stackoverflow.com/questions/39968756/javascript-crop-image-to-canvas
    let cardinalPredictions = [];
    // DETECT
    const cardinalDetectionPredictions = await getCardinalDetectionPredictions(
      imageData
    );
    let len = cardinalDetectionPredictions[0].length;
    for (let i = 0; i < len; i++) {
      if (cardinalDetectionPredictions[1][i] < 0.2) continue;
      cardinalPredictions.push({
        box: {
          left: cardinalDetectionPredictions[0][i][0] * imageWidth,
          top: cardinalDetectionPredictions[0][i][1] * imageHeight,
          width:
            (cardinalDetectionPredictions[0][i][2] -
              cardinalDetectionPredictions[0][i][0]) *
            imageWidth,
          height:
            (cardinalDetectionPredictions[0][i][3] -
              cardinalDetectionPredictions[0][i][1]) *
            imageHeight,
        },
        label: "",
        score: cardinalDetectionPredictions[1][i],
      });
    }

    for (let i = 0; i < cardinalPredictions.length; i++) {
      // CROP
      const canvas = document.createElement("canvas");
      canvas.width = cardinalPredictions[i].box.width;
      canvas.height = cardinalPredictions[i].box.height;
      const ctx = canvas.getContext("2d");
      //https://stackoverflow.com/questions/26015497/how-to-resize-then-crop-an-image-with-canvas
      ctx.drawImage(
        imageData,
        cardinalPredictions[i].box.left,
        cardinalPredictions[i].box.top,
        cardinalPredictions[i].box.width,
        cardinalPredictions[i].box.height,
        0,
        0,
        cardinalPredictions[i].box.width,
        cardinalPredictions[i].box.height
      );
      //https://stackoverflow.com/questions/16301449/convert-canvas-to-an-image-with-javascript
      let image = new Image();
      image.src = canvas.toDataURL();
      image.width = cardinalPredictions[i].box.width;
      image.height = cardinalPredictions[i].box.height;
      //CLASSIFY
      const cardinalClassificationPredictions =
        await getCardinalClassificationPredictions(image);
      const label = classify(cardinalClassificationPredictions);
      cardinalPredictions[i].label = label;
    }
    return cardinalPredictions;
  }

  async function cropShapeImg(imageData, predictions) {
    //alert(predictions.length);
    let countAttribute = 1;
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i].label != "Attribute") continue;
      // CROP
      const canvas = document.createElement("canvas");
      canvas.width = predictions[i].box.width;
      canvas.height = predictions[i].box.height;
      const ctx = canvas.getContext("2d");
      //https://stackoverflow.com/questions/26015497/how-to-resize-then-crop-an-image-with-canvas
      ctx.drawImage(
        imageData,
        predictions[i].box.left,
        predictions[i].box.top,
        predictions[i].box.width,
        predictions[i].box.height,
        0,
        0,
        predictions[i].box.width,
        predictions[i].box.height
      );
      //https://stackoverflow.com/questions/16301449/convert-canvas-to-an-image-with-javascript
      let image = new Image();
      image.src = canvas.toDataURL();
      document.body.appendChild(document.createElement("br"));
      document.body.appendChild(canvas);

      //https://stackoverflow.com/questions/7034754/how-to-set-a-file-name-using-window-open
      //https://stackoverflow.com/questions/10473932/browser-html-force-download-of-image-from-src-dataimage-jpegbase64
      var link = document.createElement("a");
      link.href = image.src.replace(
        /^data:image\/[^;]+/,
        "data:application/octet-stream"
      );
      link.download = "" + countAttribute + ".png";
      link.click();
      countAttribute++;
      if (countAttribute % 10 == 1) await sleep(2000);

      //window.open(image.src.replace(/^data:image\/[^;]+/, 'data:application/octet-stream'),);
    }
  }

  function hasProp(obj, prop) {
    if (obj === null) return true;
    for (let i = 0; i < prop.length; i++) {
      if (!(prop[i] in obj)) return false;
    }
    return true;
  }

  async function convertJSONToDiagram() {
    setOpenLoading(true);
    if (
      !document.getElementById("inputElementJSON") ||
      !document.getElementById("inputLinkJSON")
    ) {
      setOpenLoading(false);
      return;
    }
    let inputElementJSON = document.getElementById("inputElementJSON").value;
    let inputLinkJSON = document.getElementById("inputLinkJSON").value;
    try {
      let elementJSONTmp = JSON.parse(inputElementJSON);
      let linkJSONTmp = JSON.parse(inputLinkJSON);
      //setElementJSON(JSON.parse(inputElementJSON));
      //setLinkJSON(JSON.parse(inputLinkJSON));
      // check json is correct
      let isCorrect = true;
      // check elementJSON
      let elementJSONProp = ["elements"];
      if (!hasProp(elementJSONTmp, elementJSONProp)) isCorrect = false;

      // check linkJSON
      if (isCorrect) {
        let linkJSONProp = ["links"];
        if (!hasProp(linkJSONTmp, linkJSONProp)) isCorrect = false;
      }

      // check elementJSON.elements
      if (isCorrect) {
        let elementJSONElementsProp = [
          "id",
          "x",
          "y",
          "type",
          "paragraph",
          "width",
          "height",
        ];
        for (let i = 0; i < elementJSONTmp.elements.length; i++) {
          if (!hasProp(elementJSONTmp.elements[i], elementJSONElementsProp)) {
            isCorrect = false;
            break;
          }
        }
      }

      // check linkJSON.links
      if (isCorrect) {
        let linkJSONLinksProp = [
          "id",
          "type",
          "paragraph",
          "sourceId",
          "targetId",
        ];
        for (let i = 0; i < linkJSONTmp.links.length; i++) {
          if (!hasProp(linkJSONTmp.links[i], linkJSONLinksProp)) {
            isCorrect = false;
            break;
          }
        }
      }
      if (
        isCorrect &&
        (!Array.isArray(elementJSONTmp.elements) ||
          !Array.isArray(linkJSONTmp.links))
      )
        isCorrect = false;
      if (isCorrect) {
        setElementJSON(elementJSONTmp);
        setLinkJSON(linkJSONTmp);
      } else {
        alert("JSON kh??ng ????ng c?? ph??p");
      }
    } catch (e) {
      alert("JSON kh??ng ????ng c?? ph??p");
    }

    sessionStorage.removeItem("currentViewedErd");
    setOpenLoading(false);
    //await sleep(1000);
    //window.location.reload();
    //alert(JSON.stringify(inputJSON));
    //alert(JSON.stringify(elementJSON));
  }

  async function saveDiagram() {
    if (!currentUser) {
      alert("Vui l??ng ????ng nh???p ????? l??u m?? h??nh n??y!");
      return;
    }
    let erdName;
    let currentViewedErd = JSON.parse(
      sessionStorage.getItem("currentViewedErd")
    );
    if (currentViewedErd) {
      let isUpdate = window.confirm(
        "M?? h??nh n??y ???? t???n t???i, b???n c?? mu???n c???p nh???t?"
      );
      if (isUpdate) {
        while (!erdName) {
          erdName = prompt(
            "Nh???p t??n m?? h??nh mu???n l??u:",
            currentViewedErd.erdName
          );
          if (erdName === null) return;
          if (erdName.length === 0) {
            alert("Nh???p t??n m?? h??nh mu???n l??u");
          } else break;
        }
        setOpenLoading(true);
        const api = await axios.post("/api/erds/update-erd-by-id", {
          erdIdUpdated: currentViewedErd._id,
          erdName: erdName,
          imgSrc: imgSrc,
          elementJSON: JSON.stringify(elementJSON),
          linkJSON: JSON.stringify(linkJSON),
          createdDate: currentViewedErd.createdDate,
          updatedDate: new Date(),
        });
        setOpenLoading(false);
        if (api.data) {
          sessionStorage.setItem("currentViewedErd", JSON.stringify(api.data));
          alert("C???p nh???t m?? h??nh th??nh c??ng");
        }
        setOpenLoading(true);
        const api2 = await axios.get(
          "/api/erds/find-erd-by-userIdCreated/" + currentUser._id
        );
        setOpenLoading(false);
        setDiagramList(api2.data.erdList);
        return;
      }
    }
    let isSave = window.confirm("B???n c?? mu???n t???o m?? h??nh m???i?");
    if (isSave) {
      while (true) {
        erdName = prompt("Nh???p t??n m?? h??nh mu???n l??u:");
        if (erdName === null) return;
        if (erdName.length === 0) {
          alert("Nh???p t??n m?? h??nh mu???n l??u");
        } else break;
      }
    } else {
      return;
    }

    setOpenLoading(true);
    const api = await axios.post("/api/erds/create-erd", {
      userIdCreated: currentUser._id,
      erdName: erdName,
      imgSrc: imgSrc,
      elementJSON: JSON.stringify(elementJSON),
      linkJSON: JSON.stringify(linkJSON),
      createdDate: new Date(),
      updatedDate: new Date(),
    });

    setOpenLoading(false);
    if (api.data) {
      sessionStorage.setItem("currentViewedErd", JSON.stringify(api.data));
      alert("L??u m?? h??nh th??nh c??ng");
    }
    setOpenLoading(true);
    const api2 = await axios.get(
      "/api/erds/find-erd-by-userIdCreated/" + currentUser._id
    );
    setOpenLoading(false);
    setDiagramList(api2.data.erdList);
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function newDiagram() {
    setElementJSON({ elements: [] });
    setLinkJSON({ links: [] });
    await sleep(1000);
    //window.location.reload();
  }

  function signOut() {
    Cookies.remove("currentUsername");
    setCurrentUser(null);
  }

  return (
    <html>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/css/bootstrap.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Bitter:400,700"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
      </head>

      <body>
        <Router>
          <Switch>
            <Route path={"/*"}>
              <Header currentUser={currentUser} signOut={signOut} />

              <Route exact path={"/"}>
                <Redirect to="/image-to-diagram" />
              </Route>
              <Route path={"/sign-in"}>
                <SignIn />
              </Route>
              <Route path={"/sign-up"}>
                <SignUp />
              </Route>
              <Route path={"/diagram-list"}>
                <div>
                  <DiagramList
                    currentUser={currentUser}
                    diagramList={diagramList}
                    setDiagramList={setDiagramList}
                    setElementJSON={setElementJSON}
                    setLinkJSON={setLinkJSON}
                    setImgSrc={setImgSrc}
                    setOpenLoading={setOpenLoading}
                  />
                  <WaitingDialog
                    openLoading={openLoading}
                    text="??ang t???i danh s??ch m?? h??nh c???a b???n"
                  />
                </div>
              </Route>
              <Route path={"/image-to-diagram"}>
                <div className="_container">
                  <div className="input-data-container">
                    <div className="input-data-content">
                      <img
                        class="loaded-img"
                        src={imgSrc ? imgSrc : "/images/image-placeholder.png"}
                      />
                      <form encType="multipart/form-data">
                        <div className="input-items">
                          <label for="img"><p>T???i h??nh ???nh m?? h??nh:</p></label>
                          <br />
                          {/* https://stackoverflow.com/questions/1944267/how-to-change-the-button-text-of-input-type-file */}
                          <input
                            type="button"
                            id="_imageFile"
                            value="Ch???n t???p"
                            onClick={() => {
                              document.getElementById("imageFile").click();
                            }}
                          />{" "}
                          {fileName ? fileName : "Kh??ng c?? t???p n??o ???????c ch???n"}
                          <input
                            type="file"
                            id="imageFile"
                            name="imageFile"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              e.preventDefault();
                              setFileName(
                                "???? ch???n t???p " +
                                  document.getElementById("imageFile").files[0]
                                    .name
                              );
                              getImgSrcFromImgFile();
                            }}
                          />
                        </div>
                        <div className="input-items">
                          <p>Ch???n ng??n ng??? c???a m?? h??nh:</p>
                          <div className="radio-label">
                            <input
                              type="radio"
                              id="vietnamese"
                              name="language"
                              onClick={() => setLanguage("vn")}
                              checked={language == "vn"}
                            />
                            <label htmlFor="vietnamese">Ti???ng Vi???t</label>
                          </div>
                          <div className="radio-label">
                            <input
                              type="radio"
                              id="english"
                              name="language"
                              onClick={() => setLanguage("en")}
                              checked={language == "en"}
                            />
                            <label htmlFor="english">Ti???ng Anh</label>
                          </div>
                        </div>
                      </form>
                      <div className="btn-container">
                        <button
                          className="btn btn-convert"
                          onClick={() => convertImageToDiagram()}
                        >
                          <img src="/images/convert.svg" alt="" />
                          Chuy???n ?????i
                        </button>
                        <button
                          className="btn btn-new"
                          onClick={() => newDiagram()}
                        >
                          <img src="/images/new.svg" alt="" />
                          M?? h??nh m???i
                        </button>
                        <button className="btn btn-save" onClick={saveDiagram}>
                          <img src="/images/save.svg" alt="" />
                          L??u m?? h??nh
                        </button>
                      </div>
                    </div>
                  </div>
                  <Guide />
                  <div className="diagram-content">
                    <Diagram
                      elementJSON={elementJSON}
                      linkJSON={linkJSON}
                      imageWidth={imageWidth}
                      imageHeight={imageHeight}
                    />
                  </div>
                  <div className="footer">
                    <h4>???ng d???ng h??? tr??? thi???t k??? m?? h??nh th???c th??? - k???t h???p</h4>
                    <div className="authors">
                      <p className="">???????c thi???t k??? b???i:</p>
                      <div className="author-list">
                        <h6>Tr????ng Qu???c ?????t</h6>
                        <h6>Ph???m V??n V????ng</h6>
                        <h6>Hu???nh L??m T???</h6>
                        <h6>Nguy???n Ho??ng Vinh</h6>
                        <h6>Nguy???n Ph?????ng V???</h6>
                        <h6>Ph???m H???ng Ph?????c</h6>
                      </div>
                    </div>
                  </div>
                </div>
                <WaitingDialog
                  openLoading={openLoading}
                  isConverting={isConverting}
                  textConverting="??ang t???o m?? h??nh"
                  text="??ang t???i ???nh l??n"
                />
              </Route>
              <Route path={"/json-to-diagram"}>
                <div className="_container">
                  <div className="input-data-container">
                    <div className="input-data-content-json">
                      <div className="input-wrapper">
                        <form className="element-json json-input">
                          <h5>Nh???p Element JSON</h5>
                          <textarea
                            id="inputElementJSON"
                            placeholder='{"elements":
                              [{
                                "id":1, "x":0, "y":0,
                                "type":"", "paragraph":"",
                                "width":100,"height":50
                              }]
                            }'
                          ></textarea>
                        </form>
                        <form className="link-json json-input">
                          <h5>Nh???p Link JSON</h5>
                          <textarea
                            id="inputLinkJSON"
                            placeholder='{"links":
                            [{
                              "id":1,
                              "type":"", "paragraph":"",
                              "sourceId":1,"targetId":2
                            }]
                          }'
                          ></textarea>
                        </form>
                      </div>
                      <div className="btn-container">
                        <button
                          className="btn btn-convert"
                          onClick={() => convertJSONToDiagram()}
                        >
                          <img src="/images/convert.svg" alt="" />
                          Chuy???n ?????i
                        </button>
                        <button
                          className="btn btn-new"
                          onClick={() => newDiagram()}
                        >
                          <img src="/images/new.svg" alt="" />
                          M?? h??nh m???i
                        </button>
                        <button className="btn btn-save" onClick={saveDiagram}>
                          <img src="/images/save.svg" alt="" />
                          L??u m?? h??nh
                        </button>
                      </div>
                    </div>
                  </div>
                  <Guide inJsonPage={true} />
                  <div className="diagram-content">
                    <Diagram
                      elementJSON={elementJSON}
                      linkJSON={linkJSON}
                      imageWidth={imageWidth}
                      imageHeight={imageHeight}
                    />
                  </div>
                  <div className="footer">
                    <h4>???ng d???ng h??? tr??? thi???t k??? m?? h??nh th???c th??? - k???t h???p</h4>
                    <div className="authors">
                      <p className="">???????c thi???t k??? b???i:</p>
                      <div className="author-list">
                        <h6>Tr????ng Qu???c ?????t</h6>
                        <h6>Ph???m V??n V????ng</h6>
                        <h6>Hu???nh L??m T???</h6>
                        <h6>Nguy???n Ho??ng Vinh</h6>
                        <h6>Nguy???n Ph?????ng V???</h6>
                        <h6>Ph???m H???ng Ph?????c</h6>
                      </div>
                    </div>
                  </div>
                </div>
                <WaitingDialog
                  openLoading={openLoading}
                  isConverting={isConverting}
                  textConverting="??ang t???o m?? h??nh"
                  // text="??ang t???i ???nh l??n"
                />
              </Route>
            </Route>
          </Switch>
        </Router>
      </body>
    </html>
  );
}
