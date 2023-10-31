import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { userPool } from "../api/cognito";

export const SignUp = observer(() => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
      .catch((e) => console.error(e))
      .finally(() => {
        console.log("done");
      });
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
    </div>
  );
});
