import {
    CognitoUserPool
} from "amazon-cognito-identity-js";

export const userPool = new CognitoUserPool({
    UserPoolId: "eu-central-1_7PBGxs6Qb",
    ClientId: "77gp5fjth1n8irbche3aj4tpd7",
});