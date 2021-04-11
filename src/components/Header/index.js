import { useState, useEffect } from "react"
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
} from "react-router-dom";
import './index.css';

export default function Header() {

    useEffect(() => {
    }, [])

    return (
        <nav class="navbar navbar-dark navbar-expand-md navigation-clean-search">
            <div class="container">
                <div class="collapse navbar-collapse" id="navcol-1">
                    <Link to={'/'}>
                        <div class="navbar-brand">Home</div>
                    </Link>
                    <ul class="nav navbar-nav form-inline mr-auto">
                        <li class="nav-item" role="presentation">
                            <Link to={'/image-to-diagram'} >
                                <a class="nav-link">Draw ERD from image</a>
                            </Link>
                        </li>
                        <li>
                            <Link to={'/json-to-diagram'} >
                                <a class="nav-link">Draw ERD from JSON</a>
                            </Link>
                        </li>     
                    </ul>
                    <div>
                        <Link to={'/sign-in'}>
                            <span class="navbar-text">
                                <div class="login">Đăng Nhập</div>
                            </span>
                        </Link>
                        <Link to={'/sign-up'}>
                            <div class="btn action-button" role="button">Đăng Ký</div>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}