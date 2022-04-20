import {
    CognitoUserPool
} from "amazon-cognito-identity-js";

export const userPool = new CognitoUserPool({
    UserPoolId: "eu-central-1_H3g8budxI",
    ClientId: "3sood48e382k9l4c6j9p7n1lsl"
})
