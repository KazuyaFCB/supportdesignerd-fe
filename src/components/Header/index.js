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
    <nav class="navbar navbar-dark navbar-expand-md navigation-clean-search">
      <div class="container">
        <div class="collapse navbar-collapse" id="navcol-1">
          <Link to={"/"}>
            <div class="navbar-brand">Trang chủ</div>
          </Link>
          <ul class="nav navbar-nav form-inline mr-auto">
            <li hidden={!currentUser} class="dropdown">
              <a
                class="dropdown-toggle nav-link dropdown-toggle"
                data-toggle="dropdown"
                aria-expanded="false"
              >
                Bảng điều khiển
              </a>
              <div class="dropdown-menu" role="menu">
                <Link to={"/diagram-list"}>
                  <a class="dropdown-item" role="presentation">
                    {" "}
                    Danh sách mô hình
                  </a>
                </Link>
                <Link to={"/"}>
                  <a
                    class="dropdown-item"
                    role="presentation"
                    onClick={() => signOut()}
                  >
                    Đăng xuất
                  </a>
                </Link>
              </div>
            </li>
            <li class="dropdown">
              <a
                class="dropdown-toggle nav-link dropdown-toggle"
                data-toggle="dropdown"
                aria-expanded="false"
              >
                Tạo mô hình
              </a>
              <div class="dropdown-menu" role="menu">
                <Link to={"/image-to-diagram"}>
                  <a class="dropdown-item" role="presentation">
                    Từ ảnh
                  </a>
                </Link>
                <Link to={"/json-to-diagram"}>
                  <a class="dropdown-item" role="presentation">
                    Từ JSON
                  </a>
                </Link>
              </div>
            </li>
          </ul>
          <div hidden={currentUser}>
            <Link to={"/sign-in"}>
              <span class="navbar-text">
                <div class="login">Đăng nhập</div>
              </span>
            </Link>
            <Link to={"/sign-up"}>
              <div class="btn action-button" role="button">
                Đăng ký
              </div>
            </Link>
          </div>
          <div hidden={!currentUser}>
            <span class="login">Xin chào {fullName}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
