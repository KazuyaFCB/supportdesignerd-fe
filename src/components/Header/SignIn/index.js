import React, { useEffect, useState, useLocation } from "react";
import "./index.css";
import { Redirect } from "react-router-dom";
import Cookies from "js-cookie";
import domain from "../../../utils/domain";
import axios from "../../../utils/axios";

export default function SignIn() {
  const signInWithUsernameAndPasswordPath = domain + "/api/users/login";
  const signInWithGooglePath = domain + "/auth/google";
  const signInWithFacebookPath = domain + "/auth/facebook";
  const [isSignInSuccess, setIsSignInSuccess] = useState(false);

  const specialChars = "<>@!#$%^&*+{}?:;|()[]'\"\\,/~`= ";
  function checkForSpecialChar(string) {
    for (var i = 0; i < specialChars.length; i++) {
      if (string.indexOf(specialChars[i]) > -1) {
        return false;
      }
    }
    return true;
  }

  async function findUser() {
    const api = await axios.get("/api/users/find-user");
    alert(JSON.stringify(api.data));
  }

  async function findUserByUsername() {
    const username = document.getElementsByName("username")[0].value;
    const api = await axios.get("/api/users/find-user-by-username/" + username);
    alert(JSON.stringify(api.data));
  }

  async function signIn() {
    const username = document.getElementsByName("username")[0].value;
    const password = document.getElementsByName("password")[0].value;

    if (username.length < 5 || username.length > 50) {
      alert("Username phải từ 5 đến 50 kí tự");
      return;
    }
    if (!checkForSpecialChar(username)) {
      alert("Username không được chứa kí tự đặc biệt và khoảng trắng");
      return;
    }
    if (password.length < 6) {
      alert("Password phải từ 6 kí tự trở lên");
      return;
    }

    const api = await axios.post("/api/users/sign-in", {
      username: username,
      password: password,
    });

    console.log(api.data);

    if (api.data) {
      Cookies.set("currentUsername", api.data.username, { expires: 0.05 });
      setIsSignInSuccess(true);
    } else {
      alert("Sign in unsuccessfully");
    }
  }
  if (isSignInSuccess) window.location.href = "/";

  return (
    <div className="login-box">
      <div className="left-box">
        <h2>Ứng dụng hỗ trợ thiết kế mô hình thực thể - kết hợp</h2>
        <img src="/images/authentication-background.png" alt="" />
      </div>
      <div className="right-box">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            signIn();
          }}
          method="post"
        >
          <h1>LOG IN</h1>
          <div className="input-items">
            <label htmlFor="username">Username</label>
            <input type="text" name="username" autoComplete="off" />
          </div>
          <div className="input-items">
            <label htmlFor="username">Password</label>
            <input type="password" name="password" />
          </div>
          <input type="submit" name="signin_submit" value="SIGN IN" />
          <br />
          <br />
        </form>
      </div>
    </div>
  );
}
