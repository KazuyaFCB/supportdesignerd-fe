import React, { useEffect, useState, useLocation } from "react";
import "./index.css";
import axios from "../../../utils/axios";
import domain from "../../../utils/domain";
import { Redirect } from "react-router-dom";
import WaitingDialog from "./../../WaitingDialog/index";

export default function SignUp() {
  const signInWithGooglePath = domain + "/auth/google";
  const signInWithFacebookPath = domain + "/auth/facebook";
  const path = domain + "/api/users";
  const [isSignUpSuccess, setIsSignUpSuccess] = useState(false);
  const [openLoading, setOpenLoading] = useState(false);

  function validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  function checkForSpecialChar(string, specialChars = "<>@!#$%^&*+{}?:;|()[]'\"\\,/~`= ") {
    for (var i = 0; i < specialChars.length; i++) {
      if (string.indexOf(specialChars[i]) > -1) {
        return false;
      }
    }
    return true;
  }

  async function signUp() {
    setOpenLoading(true);
    const username = document.getElementsByName("username")[0].value;
    const password = document.getElementsByName("password")[0].value;
    const retypePassword =
      document.getElementsByName("retypePassword")[0].value;
    const fullName = document.getElementsByName("fullName")[0].value;
    const email = document.getElementsByName("email")[0].value;
    if (password != retypePassword) {
      alert("Nhập lại mật khẩu không đúng");
      setOpenLoading(false);
      return;
    }
    if (
      username.length < 5 ||
      username.length > 50 ||
      fullName.length < 5 ||
      fullName.length > 50
    ) {
      alert("Username hoặc Full name phải từ 5 đến 50 kí tự");
      setOpenLoading(false);
      return;
    }
    let specialChars = "<>@!#$%^&*+{}?:;|()[]'\"\\,/~`= ";
    if (!checkForSpecialChar(username, specialChars)) {
      alert("Username không được chứa kí tự đặc biệt và khoảng trắng");
      setOpenLoading(false);
      return;
    }
    if (password.length < 6) {
      alert("Password phải từ 6 kí tự trở lên");
      setOpenLoading(false);
      return;
    }
    specialChars = "<>@!#$%^&*+{}?:;|()[]'\"\\,/~`=";
    if (!checkForSpecialChar(fullName, specialChars)) {
      alert("Full name không được chứa kí tự đặc biệt");
      setOpenLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      alert("Email không đúng định dạng");
      setOpenLoading(false);
      return;
    }
    const api = await axios.post("/api/users/sign-up", {
      fullName: fullName,
      username: username,
      password: password,
      email: email,
    });

    //setOpenLoading(false);
    //setIsSignUpSuccess(true);

    if (api.data) {
      alert("Đăng ký thành công");
      setOpenLoading(false);
      setIsSignUpSuccess(true);
    } else {
      setOpenLoading(false);
      alert("Username đã tồn tại");
    }
  }
  if (isSignUpSuccess) return <Redirect to="/sign-in" />;
  return (
    <div className="login-box">
      <WaitingDialog openLoading={openLoading} text="Signing up" />
      <div className="left-box">
        <h2>Ứng dụng hỗ trợ thiết kế mô hình thực thể - kết hợp</h2>
        <img src="/images/authentication-background.png" alt="" />
      </div>
      <div className="right-box">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            signUp();
          }}
        >
          <h1>SIGN UP</h1>

          <div className="input-items">
            <label htmlFor="username">Username</label>
            <input type="text" name="username" autoComplete="off" required />
          </div>
          <div className="input-items">
            <label htmlFor="username">Password</label>
            <input type="password" name="password" required />
          </div>
          <div className="input-items">
            <label htmlFor="username">Retype password</label>
            <input type="password" name="retypePassword" required />
          </div>
          <div className="input-items">
            <label htmlFor="username">Full name</label>
            <input type="text" name="fullName" autoComplete="off" required />
          </div>
          <div className="input-items">
            <label htmlFor="username">Email</label>
            <input type="text" name="email" autoComplete="off" required />
          </div>
          <input type="submit" name="signup_submit" value="SIGN UP" />
        </form>
      </div>
    </div>
  );
}
