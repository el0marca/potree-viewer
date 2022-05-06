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
    accessToken = '';
    cognitoUser = null;
    pointCloudChilds = [];
    pointCloudChildsWasFetched = false

    constructor() {
        makeAutoObservable(this)
    }

    verifySession() {
        this.cognitoUser = userPool.getCurrentUser()
        return new Promise((res, rej) => {
                this.cognitoUser.getSession((err, info) => {
                    if (err) {
                        rej(err)
                    } else {
                        this.userInfo = info;
                        // this.refreshToken()
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
        return new Promise((res, rej) =>
            this.cognitoUser.refreshSession(cognitoRefreshToken, (err, result) => {
                if (err) {
                    return rej(err);
                }
                this.accessToken = result.idToken.jwtToken
                res(result.idToken.jwtToken);
            })
        ).catch((e) => console.error(e));
    }
    getPointCloudChilds = (projectId, fileId, name) => {
        const axiosConfig = {
            headers: {
                Authorization: `Bearer ${this.accessToken}`
            }
        };
        axios.get(`https://zqhq8ti8nf.execute-api.eu-central-1.amazonaws.com/api/files/${projectId}/${fileId}/get-childs`, axiosConfig)
            .then((res) => {
                let childs = res.data.data.childs;

                const condition = (e, pushData)=> {
                    if (e.size > 1024 * 10000 && e.tileStatus === 'available') {
                        if (e.name.slice(-4) === '.laz' || e.name.slice(-4) === '.las') {
                            if (!pushData) {
                                return true
                            } else {
                                this.pointCloudChilds.push({
                                    ...e,
                                    name: e.name.substring(0, e.name.length - 4)
                                })
                            }
                        }
                    }
                }
                if (childs.some((e) => condition(e, false)
                    )) {
                    this.pointCloudChilds.push({
                        fileId,
                        name: name.substring(0, name.length - 4),
                    })
                    childs.forEach((e) => condition(e, true))
                    window.localStorage.setItem('pointCloudChilds', JSON.stringify(this.pointCloudChilds))
                } else {
                    this.pointCloudChilds = null
                    window.localStorage.removeItem('pointCloudChilds')
                }
                this.pointCloudChildsWasFetched = true
            })
    }
}

export default new User()