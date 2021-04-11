import './App.css';
import axios from './utils/axios';
import { useState, useEffect } from "react";
import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";

import User from './pages/User';

let api_= {
  "data":"hello world",
  "status":200,
  "statusText":"OK",
  "headers":{"content-length":"11","content-type":"text/html; charset=utf-8"},
  "config":{"url":"/","method":"get","headers":{"Accept":"application/json, text/plain, */*"},
  "baseURL":"http://localhost:5000","transformRequest":[null],
  "transformResponse":[null],"timeout":0,
  "xsrfCookieName":"XSRF-TOKEN",
  "xsrfHeaderName":"X-XSRF-TOKEN",
  "maxContentLength":-1,
  "maxBodyLength":-1},
  "request":{}
}



let domain = "http://localhost:5000";


function App() {
  
  useEffect(() => {
    
  },[]);

  async function fetchData() {
    const api = await axios.get("/");
    alert(JSON.stringify(api.data));
    //alert(api);
  }

  return (
    <React.Fragment>
      <Switch>
        <Route exact path="/admin/">
          
        </Route>
        <Route path="/*">
          <User/>
        </Route>
      </Switch>
    </React.Fragment>
  );
}

export default App;
