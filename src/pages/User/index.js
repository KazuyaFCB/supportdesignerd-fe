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
      alert("Please choose file size less than 4MB");
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
      alert("Haven't uploaded the file yet");
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
    window.location.reload();
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

  async function convertJSONToDiagram() {
    setOpenLoading(true);
    if (
      !document.getElementById("inputElementJSON") ||
      !document.getElementById("inputLinkJSON")
    ) {
      setOpenLoading(false);
      return;
    }
    let inputJSON = document.getElementById("inputElementJSON").value;
    let linkJSON = document.getElementById("inputLinkJSON").value;

    setElementJSON(JSON.parse(inputJSON));
    setLinkJSON(JSON.parse(linkJSON));
    sessionStorage.removeItem("currentViewedErd");
    setOpenLoading(false);
    await sleep(1000);
    window.location.reload();
    //alert(JSON.stringify(inputJSON));
    //alert(JSON.stringify(elementJSON));
  }

  async function saveDiagram() {
    if (!currentUser) {
      alert("Please sign in to save diagram!");
      return;
    }
    let erdName;
    let currentViewedErd = JSON.parse(sessionStorage.getItem("currentViewedErd"));
    if (currentViewedErd) {
      let isUpdate = window.confirm(
        "This diagram is exist. Do you want to update it?"
      );
      if (isUpdate) {
        while (!erdName) {
          erdName = prompt("Please type new ERD name:", currentViewedErd.erdName);
          if (erdName === null) return;
          if (erdName.length === 0) {
            alert("Please type ERD name");
          }
          else break;
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
          alert("Update diagram successfully");
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
    let isSave = window.confirm(
      "Do you want to save new diagram?"
    );
    if (isSave) {
      while (true) {
        erdName = prompt("Please type ERD name:");
        if (erdName === null) return;
        if (erdName.length === 0) {
          alert("Please type ERD name");
        }
        else break;
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
      alert("Save diagram successfully");
    }
    setOpenLoading(true);
    const api2 = await axios.get(
      "/api/erds/find-erd-by-userIdCreated/" + currentUser._id
    );
    setOpenLoading(false);
    setDiagramList(api2.data.erdList);
  }

  function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms));}

  async function newDiagram() {
    setElementJSON({ elements: [] });
    setLinkJSON({ links: [] });
    await sleep(1000);
    window.location.reload();
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
                    text="Loading your diagram list"
                  />
                </div>
              </Route>
              <Route path={"/image-to-diagram"}>
                <div className="_container">
                  <div className="img-content">
                    <img class="loaded-img" src={imgSrc} />
                    <form encType="multipart/form-data">
                      <div className="input-items">
                        <label for="img">Select image:</label>
                        <input
                          type="file"
                          id="imageFile"
                          name="imageFile"
                          accept="image/*"
                          onChange={(e) => {
                            e.preventDefault();
                            getImgSrcFromImgFile();
                          }}
                        />
                      </div>
                      <div className="input-items">
                        <div className="radio-label">
                          <input
                            type="radio"
                            id="vietnamese"
                            name="language"
                            onClick={() => setLanguage("vn")}
                            checked={language == "vn"}
                          />
                          <label htmlFor="vietnamese">Vietnamese</label>
                        </div>
                        <div className="radio-label">
                          <input
                            type="radio"
                            id="english"
                            name="language"
                            onClick={() => setLanguage("en")}
                            checked={language == "en"}
                          />
                          <label htmlFor="english">English</label>
                        </div>
                      </div>
                    </form>
                    <div className="btn-container">
                      <button
                        className="btn btn-convert"
                        onClick={() => convertImageToDiagram()}
                      >
                        <img src="/images/convert.svg" alt="" />
                        Convert
                      </button>
                      <button
                        className="btn btn-new"
                        onClick={() => newDiagram()}
                      >
                        <img src="/images/new.svg" alt="" />
                        New
                      </button>
                      <button className="btn btn-save" onClick={saveDiagram}>
                        <img src="/images/save.svg" alt="" />
                        Save
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3>Lưu ý:</h3>
                    <p>
                      - Để vẽ <strong>thực thể/mối kết hợp/thuộc tính</strong> lên diagram, 
                      click vào các <strong>ký hiệu hình chữ nhật/hình thoi/hình elip </strong> 
                      trên thanh nằm ngang, sẽ có 1 thực thể/mối kết hợp/thuộc tính 
                      được tạo ở góc trái trên của diagram
                    </p>
                    <p>
                      - Để vẽ <strong>đường nối</strong> giữa 2 <strong>thực thể/mối kết hợp/thuộc tính</strong> lên diagram, 
                      click vào các <strong>ký hiệu đường nối</strong> trên thanh nằm ngang. 
                      Rồi click vào <strong>thực thể/mối kết hợp/thuộc tính THỨ 1 </strong> 
                      (click khoảng 1-2 lần vào nó đến khi có <strong>hình chữ nhật màu xanh đè lên</strong>). 
                      Rồi click vào <strong>thực thể/mối kết hợp/thuộc tính THỨ 2 </strong> 
                      (click khoảng 1-2 lần vào nó đến khi có <strong>đường nối được tạo</strong>)
                    </p>
                    <p>
                      - Lỡ click <strong>ký hiệu đường nối</strong> trên thanh nằm ngang mà <strong>muốn hủy chọn </strong>
                      đường nối thì <strong>click đúp chuột vào khoảng trống</strong> trên diagram
                    </p>
                    <p>
                      - Muốn chỉnh sửa nội dung <strong>thực thể/mối kết hợp/thuộc tính/đường nối </strong> 
                      thì click đúp chuột vào chúng, rồi nhập nội dung cần sửa 
                      và click khoảng trống trên diagram
                    </p>
                    <p>
                      - Muốn xóa <strong>thực thể/mối kết hợp/thuộc tính/đường nối</strong> trên diagram 
                      thì đưa chuột vào hình vẽ cần xóa, sẽ có <strong>icon "X"</strong> hiện lên, 
                      click vào <strong>icon "X"</strong> là sẽ xóa được
                    </p>
                  </div>
                  <div className="diagram-content">
                    <Diagram
                      elementJSON={elementJSON}
                      linkJSON={linkJSON}
                      imageWidth={imageWidth}
                      imageHeight={imageHeight}
                    />
                  </div>
                  <div className="footer">
                    {/* <p className="copyright">
                      &copy; Copyright. All Rights Reserved.
                    </p> */}
                    <h4>Ứng dụng hỗ trợ thiết kế mô hình thực thể - kết hợp</h4>
                    <div className="authors">
                      <p className="">Designed by our team:</p>
                      <div className="author-list">
                        <h6>Trương Quốc Đạt</h6>
                        <h6>Phạm Văn Vương</h6>
                        <h6>Huỳnh Lâm Tứ</h6>
                        <h6>Nguyễn Hoàng Vinh</h6>
                        <h6>Nguyễn Phượng Vỹ</h6>
                        <h6>Phạm Hồng Phước</h6>
                      </div>
                    </div>
                  </div>
                </div>
                <WaitingDialog
                  openLoading={openLoading}
                  isConverting={isConverting}
                  textConverting="Converting you image"
                  text="Loading your image"
                />
              </Route>
              <Route path={"/json-to-diagram"}>
                <div className="_container">
                  {/* <div className="img-content"></div> */}
                  <div className="input-wrapper">
                    <form className="element-json json-input">
                      <h5>Input Element JSON</h5>
                      <textarea id="inputElementJSON"></textarea>
                    </form>
                    <form className="link-json json-input">
                      <h5>Input Link JSON</h5>
                      <textarea id="inputLinkJSON"></textarea>
                    </form>
                  </div>
                  <div className="btn-container">
                    <button
                      className="btn btn-convert"
                      onClick={() => convertJSONToDiagram()}
                    >
                      <img src="/images/convert.svg" alt="" />
                      Convert
                    </button>
                    <button
                      className="btn btn-new"
                      onClick={() => newDiagram()}
                    >
                      <img src="/images/new.svg" alt="" />
                      New
                    </button>
                    <button className="btn btn-save" onClick={saveDiagram}>
                      <img src="/images/save.svg" alt="" />
                      Save
                    </button>
                  </div>
                  <div className="diagram-content">
                    <Diagram
                      elementJSON={elementJSON}
                      linkJSON={linkJSON}
                      imageWidth={imageWidth}
                      imageHeight={imageHeight}
                    />
                  </div>
                  <div className="footer">
                    <p> &copy; Copyright. All Rights Reserved.</p>
                    <p>Designed by our team:</p>
                    <ul>
                      <li>Huỳnh Lâm Tứ</li>
                      <li>Phạm Hồng Phước</li>
                      <li>Trương Quốc Đạt</li>
                      <li>Nguyễn Phượng Vỹ</li>
                      <li>Nguyễn Hoàng Vinh</li>
                      <li>Phạm Văn Vương</li>
                    </ul>
                  </div>
                </div>
                <WaitingDialog
                  openLoading={openLoading}
                  isConverting={isConverting}
                  textConverting="Converting you image"
                  text="Loading your image"
                />
              </Route>
            </Route>
          </Switch>
        </Router>
      </body>
    </html>
  );
}
