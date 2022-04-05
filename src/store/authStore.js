import {
    CognitoUserPool
} from "amazon-cognito-identity-js";

import {
    makeAutoObservable
} from 'mobx'

export const userPool = new CognitoUserPool({
    UserPoolId: "eu-central-1_H3g8budxI",
    ClientId: "3sood48e382k9l4c6j9p7n1lsl"
})
class User {
    userInfo = ''

    constructor() {
        makeAutoObservable(this)
    }

    verifySession() {
        const cognitoUser = userPool.getCurrentUser()

        new Promise((res, rej) => {
                cognitoUser.getSession((err) => {
                    if (err) {
                        rej(err)
                    } else res()
                })
            })
            .then(() => {
                return new Promise((res, rej) => {
                    cognitoUser.getUserAttributes((err, attributes) => {
                        if (err) {
                            rej(err)
                        } else res(attributes)
                    })
                })
            })
            .then((info) => {
                this.userInfo = info;
                console.log('currentUser', info)
            })
            .catch((err) => console.log(err))
    }
}

export default new User()