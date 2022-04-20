import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";
import { observer } from "mobx-react-lite";
import { React, useState, useEffect } from "react";
import { auth } from "../api/auth.js";
import { userPool } from "../api/cognito.js";

export const SignUp = observer(() => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const verifySession = () => {
    // const cognitoUser = userPool.getCurrentUser();
    // cognitoUser.getSession((e, a) => console.log(e, a));
    auth.verifySession();
  };
  // useEffect(() => User.verifySession(), []);

  const onSubmit = (e) => {
    e.preventDefault();
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });
    new Promise((res, rej) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          // window.location.reload();
          console.log(result);
          return res(result);
        },
        onFailure: (err) => {
          console.log(err);
          return rej(err);
        },
      });
    })
      .catch((e) => console.log(e))
      .finally((e) => console.log(e));
  };

  return (
    <div>
      <form action="" onSubmit={onSubmit}>
        <label htmlFor="email">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)}></input>
        <label htmlFor="password">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        <button type="submit">Sign in</button>
      </form>
      <button style={{'cursor':'pointer'}} onClick={()=>{window.open('http://localhost:3000')}}>open viewer</button>
    </div>
  );
});
