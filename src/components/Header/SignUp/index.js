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
  const [validateError, setValidateError] = useState(null);
  const [waitingDialogContent, setWaitingDialogContent] = useState("");

  const setValidationError = (type, content) => {
    const error = {
      type,
      content,
    };
    setValidateError(error);
    setOpenLoading(false);
  };

  function validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  function checkForSpecialChar(
    string,
    specialChars = "<>@!#$%^&*+{}?:;|()[]'\"\\,/~`= "
  ) {
    for (var i = 0; i < specialChars.length; i++) {
      if (string.indexOf(specialChars[i]) > -1) {
        return false;
      }
    }
    return true;
  }

  async function signUp() {
    setOpenLoading(true);
    setWaitingDialogContent("Signing up");
    const username = document.getElementsByName("username")[0].value;
    const password = document.getElementsByName("password")[0].value;
    const retypePassword =
      document.getElementsByName("retypePassword")[0].value;
    const fullName = document.getElementsByName("fullName")[0].value;
    const email = document.getElementsByName("email")[0].value;
    if (password != retypePassword) {
      setOpenLoading(false);
      setValidationError(
        "retype password",
        "Mật khẩu nhập lại không trùng khớp"
      );
      return;
    }
    if (username.length < 5 || username.length > 50) {
      setValidationError("username", "Username phải chứa từ 5 đến 50 kí tự");
      return;
    }

    if (fullName.length < 5 || fullName.length > 50) {
      setValidationError("fullname", "Họ và tên phải chứa từ 5 đến 50 kí tự");
      return;
    }
    let specialChars = "<>@!#$%^&*+{}?:;|()[]'\"\\,/~`= ";
    if (!checkForSpecialChar(username, specialChars)) {
      setValidationError("username", "Username không được chứa ký tự dặc biệt");
      return;
    }
    if (password.length < 6) {
      setValidationError("password", "Mật khẩu phải gồm ít nhất 6 kí tự");
      setOpenLoading(false);
      return;
    }
    specialChars = "<>@!#$%^&*+{}?:;|()[]'\"\\,/~`=";
    if (!checkForSpecialChar(fullName, specialChars)) {
      setValidationError(
        "fullname",
        "Họ và tên không được chứa ký tự dặc biệt"
      );
      return;
    }
    if (!validateEmail(email)) {
      setValidationError("email", "Email không đúng định dạng");
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
      setWaitingDialogContent(
        "Đăng ký thành công! Đang chuyển hướng đến trang Đăng nhập"
      );
      setTimeout(() => {
        setOpenLoading(false);
        setIsSignUpSuccess(true);
      }, 1500);
    } else {
      setOpenLoading(false);
      setValidationError("username", "Username đã tồn tại");
    }
  }
  if (isSignUpSuccess) return <Redirect to="/sign-in" />;
  return (
    <div className="login-box">
      <WaitingDialog openLoading={openLoading} text={waitingDialogContent} />
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
          <h1>ĐĂNG KÝ</h1>

          <div className="input-items">
            <label htmlFor="username">Username</label>
            <input type="text" name="username" autoComplete="off" required />
            {validateError && validateError.type === "username" && (
              <p className="error">{validateError.content}</p>
            )}
          </div>
          <div className="input-items">
            <label htmlFor="username">Mật khẩu</label>
            <input type="password" name="password" required />
            {validateError && validateError.type === "password" && (
              <p className="error">{validateError.content}</p>
            )}
          </div>
          <div className="input-items">
            <label htmlFor="username">Nhập lại mật khẩu</label>
            <input type="password" name="retypePassword" required />
            {validateError && validateError.type === "retype password" && (
              <p className="error">{validateError.content}</p>
            )}
          </div>
          <div className="input-items">
            <label htmlFor="username">Họ và tên</label>
            <input type="text" name="fullName" autoComplete="off" required />
            {validateError && validateError.type === "fullname" && (
              <p className="error">{validateError.content}</p>
            )}
          </div>
          <div className="input-items">
            <label htmlFor="username">Email</label>
            <input type="text" name="email" autoComplete="off" required />
            {validateError && validateError.type === "email" && (
              <p className="error">{validateError.content}</p>
            )}
          </div>
          <input type="submit" name="signup_submit" value="Đăng ký" />
        </form>
      </div>
    </div>
  );
}
