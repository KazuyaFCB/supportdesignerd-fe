import React, { useEffect, useState, useLocation } from 'react';
import './index.css';
import { Redirect } from 'react-router-dom';
//import Cookies from 'js-cookie';
import domain from '../../../utils/domain';
import axios from "../../../utils/axios";


export default function SignIn({currentUser, setCurrentUser}) {
    const signInWithUsernameAndPasswordPath = domain + "/api/users/login";
    const signInWithGooglePath = domain + "/auth/google";
    const signInWithFacebookPath = domain + "/auth/facebook";
    const [isSignInSuccess, setIsSignInSuccess] = useState(false);

    const specialChars = "<>@!#$%^&*+{}?:;|()[]'\"\\,/~`= ";
    function checkForSpecialChar(string) {
    for(var i = 0; i < specialChars.length; i++) {
        if(string.indexOf(specialChars[i]) > -1) {
            return false
        }
    }
        return true;
    }

    async function findUser() {
        const api = await axios.get("/find-user");
        alert(JSON.stringify(api.data));
    }

    async function findUserByUsername() {
        const username = document.getElementsByName("username")[0].value;
        const api = await axios.get("/find-user-by-username/" + username);
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

        const api = await axios.get("/sign-in", {username: username, password: password});
        if (api.data) {
            //Cookies.set('currentUsername', api.data.username, { expires: 0.05 });
            setCurrentUser(api.data);
            setIsSignInSuccess(true);
        }
    }
    if (isSignInSuccess)
        window.location.href = "/";

    return (
        <div id="login-box" style={{background: 'lavender', marginBottom: '0px'}}>
            <form onSubmit={(e) => {e.preventDefault(); signIn(); }} method="post" class="left">
                <h1>SIGN IN</h1>

                <input type="text" name="username" placeholder="Username" />
                <input type="password" name="password" placeholder="Password" />
                <input type="submit" name="signup_submit" value="SIGN IN" />
                <br/><br/>
                <a style={{color: 'blue'}} href="/forget-password">Quên mật khẩu</a>
            </form>
            

            <div class="right">
                <span class="loginwith" style={{color: 'black'}}>Sign in with<br />social network</span>

                <button class="social-signin facebook">
                    <a href={signInWithFacebookPath}>Sign in with facebook</a>
                </button>
                <button class="social-signin google"> 
                    <a href={signInWithGooglePath}>Sign in with Google+</a>
                </button>
            </div>
            <div class="or">OR</div>
        </div>
    );

    return (
        <form onSubmit={(e) => {e.preventDefault(); }} >

            <label for="fname">Username:</label><br/>
            <input type="text" id="username" name="username" defaultValue="John"/><br/>
            <label for="lname">Password:</label><br/>
            <input type="text" id="password" name="password" defaultValue="Doe"/><br/><br/>

            <input type="submit"/>
        </form>
    )
}