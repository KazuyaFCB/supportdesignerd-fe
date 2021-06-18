import React, { useEffect, useState, useLocation } from 'react';
import './index.css';
import axios from '../../../utils/axios';
import domain from '../../../utils/domain';
import { Redirect } from 'react-router-dom';

export default function SignUp() {
    const signInWithGooglePath = domain + "/auth/google";
    const signInWithFacebookPath = domain + "/auth/facebook";
    const path = domain + "/api/users";
    const [isSignUpSuccess, setIsSignUpSuccess] = useState(false);

    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    const specialChars = "<>@!#$%^&*+{}?:;|()[]'\"\\,/~`= ";
    function checkForSpecialChar(string) {
        for(var i = 0; i < specialChars.length; i++) {
            if(string.indexOf(specialChars[i]) > -1) {
                return false
            }
        }
        return true;
    }

    async function signUp() {
        const username = document.getElementsByName("username")[0].value;
        const password = document.getElementsByName("password")[0].value;
        const retypePassword = document.getElementsByName("retypePassword")[0].value;
        const fullName = document.getElementsByName("fullName")[0].value;
        const email = document.getElementsByName("email")[0].value;
        if (password != retypePassword) {
            alert("Nhập lại mật khẩu không đúng");
            return;
        }
        if (username.length < 5 || username.length > 50 || fullName.length < 5 || fullName.length > 50) {
            alert("Username hoặc display name phải từ 5 đến 50 kí tự");
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
        if (!validateEmail(email)) {
            alert("Email không đúng định dạng");
            return;
        }
        const api = await axios.post("/api/users/sign-up", {fullName: fullName, username: username, password: password, email: email});
        
        if (api.data) {
            alert("Sign up successfully");
            setIsSignUpSuccess(true);
        } else {
            alert("Sign up unsucessfully");
        }
    }
    if (isSignUpSuccess)
        return (<Redirect to="/sign-in"/>);
    return (
        <div id="login-box" style={{background: 'lavender', marginBottom: '0px', opacity: '0.7'}}>
            <form onSubmit={(e) => {e.preventDefault(); signUp(); }} class="left">
                <h1>SIGN UP</h1>

                <input type="text" name="username" placeholder="Username" required/>
                <input type="password" name="password" placeholder="Password" required/>
                <input type="password" name="retypePassword" placeholder="Retype password" required/>
                <input type="text" name="fullName" placeholder="Full name" required/>
                <input type="text" name="email" placeholder="E-mail" required/>

                <input type="submit" name="signup_submit" value="SIGN UP" />
            </form>

            {/* <div class="right">
                <span class="loginwith" style={{color: 'black'}}>Sign in with<br />social network</span>

                <button class="social-signin facebook">
                    <a href={signInWithFacebookPath}>Sign in with facebook</a>
                </button>
                <button class="social-signin google">
                    <a href={signInWithGooglePath}>Sign in with Google+</a>
                </button>
            </div>
            <div class="or">OR</div> */}
        </div>
    );
}