import {
    makeAutoObservable
} from 'mobx'
import {
    CognitoUserPool,
    CognitoUserAttribute,
    CognitoUser,
    AuthenticationDetails,
    CognitoRefreshToken,
} from "amazon-cognito-identity-js";
import axios from 'axios'
const userPool = new CognitoUserPool({
    UserPoolId: "eu-central-1_7PBGxs6Qb",
    ClientId: "77gp5fjth1n8irbche3aj4tpd7"
})

class User {
    userInfo = [];
    token = '';
    cognitoUser = null;
    pointCloudUrl = ''

    constructor() {
        makeAutoObservable(this)
    }

    verifySession() {
        this.cognitoUser = userPool.getCurrentUser()
        new Promise((res, rej) => {
                this.cognitoUser.getSession((err, info) => {
                    if (err) {
                        rej(err)
                    } else {
                        this.userInfo = info;
                        this.refreshToken()
                        res()
                    }
                })
            })
            .then(() => {
                return new Promise((res, rej) => {
                    this.cognitoUser.getUserAttributes((err, attributes) => {
                        if (err) {
                            rej(err)
                        } else res(attributes)
                    })
                })
            })
            .catch((err) => console.error(err))
    }
    refreshToken() {
        const cognitoRefreshToken = new CognitoRefreshToken({
            RefreshToken: this.userInfo.refreshToken.token,
        });
        new Promise((res, rej) =>
            this.cognitoUser.refreshSession(cognitoRefreshToken, (err, result) => {
                if (err) {
                    return rej(err);
                }
                this.token = result.idToken.jwtToken
                const axiosConfig = {
                    headers: {
                        Authorization: `Bearer ${result.idToken.jwtToken}`
                    }
                };
                axios.get('https://zqhq8ti8nf.execute-api.eu-central-1.amazonaws.com/api/files/118/975/get-tiles/metadata.json', axiosConfig)
                    .then((w) => {
                        console.log(w);
                        this.pointCloudUrl = w.data.url
                    })
                res(result);
            })
        ).catch((e) => console.error(e));

    }
}

export default new User()