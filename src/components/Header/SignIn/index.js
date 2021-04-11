import axios from "../../../utils/axios";


export default function SignIn() {

    async function createUser() {
        const newUsername = document.getElementsByName("username")[0].value;
        const newPassword = document.getElementsByName("password")[0].value;
        const api = await axios.post("/create-user", {username: newUsername, password: newPassword});
        alert(JSON.stringify(api.data));
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