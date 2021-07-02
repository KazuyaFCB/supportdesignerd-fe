import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import "./index.css";

export default function Header({ currentUser, signOut }) {
  let [fullName, setFullName] = useState("");
  useEffect(() => {
    if (currentUser) setFullName(currentUser.fullName);
    else setFullName("");
  }, [currentUser]);

  return (
    <nav className="navbar navbar-dark navbar-expand-md rounded">
      {/* <div className="container"> */}
      {/* <div className="collapse navbar-collapse" id="navcol-1"> */}
      <Link to={"/"}>
        <div className="navbar-brand">Trang chủ</div>
      </Link>

      <div hidden={currentUser}>
        <Link to={"/sign-in"}>
          <span className="navbar-text">
            <div className="login _btn">Đăng nhập</div>
          </span>
        </Link>
      </div>

      <button
        className="navbar-toggler collapsed"
        type="button"
        data-toggle="collapse"
        data-target="#navbarsExample09"
        aria-controls="navbarsExample09"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div hidden={!currentUser}>
        <span className="login">Xin chào, {fullName}</span>
      </div>

      <div className="navbar-collapse collapse" id="navbarsExample09">
        <ul className="navbar-nav mr-auto">
          <li hidden={!currentUser} className="dropdown">
            <a
              className="dropdown-toggle nav-link dropdown-toggle"
              data-toggle="dropdown"
              aria-expanded="false"
            >
              Bảng điều khiển
            </a>
            <div className="dropdown-menu" role="menu">
              <Link to={"/diagram-list"}>
                <a className="dropdown-item" role="presentation">
                  {" "}
                  Danh sách mô hình
                </a>
              </Link>
              <Link to={"/"}>
                <a
                  className="dropdown-item"
                  role="presentation"
                  onClick={() => signOut()}
                >
                  Đăng xuất
                </a>
              </Link>
            </div>
          </li>
          <li className="dropdown">
            <a
              className="dropdown-toggle nav-link dropdown-toggle"
              data-toggle="dropdown"
              aria-expanded="false"
            >
              Chuyển đổi
            </a>
            <div className="dropdown-menu" role="menu">
              <Link to={"/image-to-diagram"}>
                <a className="dropdown-item" role="presentation">
                  Từ ảnh
                </a>
              </Link>
              <Link to={"/json-to-diagram"}>
                <a className="dropdown-item" role="presentation">
                  Từ JSON
                </a>
              </Link>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
}
