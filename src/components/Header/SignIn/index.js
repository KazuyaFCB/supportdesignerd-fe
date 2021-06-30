import React, { useEffect, useState, useLocation } from "react";
import "./index.css";
import { Redirect } from "react-router-dom";
import Cookies from "js-cookie";
import domain from "../../../utils/domain";
import axios from "../../../utils/axios";
import WaitingDialog from "./../../WaitingDialog/index";

export default function SignIn() {
  const signInWithUsernameAndPasswordPath = domain + "/api/users/login";
  const signInWithGooglePath = domain + "/auth/google";
  const signInWithFacebookPath = domain + "/auth/facebook";
  const [isSignInSuccess, setIsSignInSuccess] = useState(false);
  const [openLoading, setOpenLoading] = useState(false);
  const [validateError, setValidateError] = useState(null);

  const specialChars = "<>@!#$%^&*+{}?:;|()[]'\"\\,/~`= ";
  function checkForSpecialChar(string) {
    for (var i = 0; i < specialChars.length; i++) {
      if (string.indexOf(specialChars[i]) > -1) {
        return false;
      }
    }
    return true;
  }

  const setValidationError = (type, content) => {
    const error = {
      type,
      content,
    };
    setValidateError(error);
    setOpenLoading(false);
  };

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
    setOpenLoading(true);
    setValidateError(null);
    const username = document.getElementsByName("username")[0].value;
    const password = document.getElementsByName("password")[0].value;

    if (username.length < 5 || username.length > 50) {
      setValidationError("username", "Username must be in 5 to 50 characters");
      return;
    }
    if (!checkForSpecialChar(username)) {
      setValidationError("username", "Username must not include space");
      return;
    }
    if (password.length < 6) {
      setValidationError("password", "Password be at least 6 characters");
      return;
    }

    const api = await axios.post("/api/users/sign-in", {
      username: username,
      password: password,
    });

    if (api.data) {
      Cookies.set("currentUsername", api.data.username, { expires: 0.05 });
      setOpenLoading(true);
      setIsSignInSuccess(true);
    } else {
      setOpenLoading(false);
      setValidationError("username", "Incorrect username or password");
    }
  }
  if (isSignInSuccess) window.location.href = "/";

  return (
    <div className="login-box">
      <WaitingDialog openLoading={openLoading} text="Logging in" />
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
            {validateError && validateError.type === "username" && (
              <p className="error">{validateError.content}</p>
            )}
          </div>
          <div className="input-items">
            <label htmlFor="username">Password</label>
            <input type="password" name="password" />
            {validateError && validateError.type === "password" && (
              <p className="error">{validateError.content}</p>
            )}
          </div>
          <div className="submit-btn">
            <input type="submit" name="signin_submit" value="SIGN IN" />
          </div>
        </form>
      </div>
    </div>
  );
}
