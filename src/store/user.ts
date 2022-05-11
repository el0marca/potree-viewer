import { makeAutoObservable } from "mobx";
import { CognitoRefreshToken } from "amazon-cognito-identity-js";
import axios from "axios";
import { userPool } from "../api/cognito";

interface userInfoI {
  refreshToken: {
    token: string;
  };
  name: string;
}
interface pointCloudChildsI {
  name: string;
  size?: number;
  tileStatus?: string;
  fileId: number;
  projectId?: number;
}

class User {
  userInfo: userInfoI | null = null;
  accessToken: string = "";
  cognitoUser: any = null;
  pointCloudChilds: pointCloudChildsI[] = [] as pointCloudChildsI[];
  pointCloudChildsWasFetched: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  verifySession() {
    this.cognitoUser = userPool.getCurrentUser();
    return new Promise<void>((res, rej) => {
      this.cognitoUser.getSession((err: string, info: userInfoI) => {
        if (err) {
          rej(err);
        } else {
          this.userInfo = info;
          // this.refreshToken()
          res();
        }
      });
    })
      .then(() => {
        return new Promise((res, rej) => {
          this.cognitoUser.getUserAttributes((err: string, attributes: []) => {
            if (err) {
              rej(err);
            } else res(attributes);
          });
        });
      })
      .catch((err) => console.error(err));
  }
  refreshToken() {
    const cognitoRefreshToken = new CognitoRefreshToken({
      RefreshToken: this.userInfo!.refreshToken.token,
    });
    return new Promise((res, rej) =>
      this.cognitoUser.refreshSession(
        cognitoRefreshToken,
        (err: string, result: { idToken: { jwtToken: string } }) => {
          if (err) {
            return rej(err);
          }
          this.accessToken = result.idToken.jwtToken;
          res(result.idToken.jwtToken);
        }
      )
    ).catch((e) => console.error(e));
  }
  getPointCloudChilds = (projectId: number, fileId: number, name: string) => {
    const axiosConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    };
    axios
      .get(
        `https://zqhq8ti8nf.execute-api.eu-central-1.amazonaws.com/api/files/${projectId}/${fileId}/get-childs`,
        axiosConfig
      )
      .then((res) => {
        let childs = res.data.data.childs;

        const condition = (e: pointCloudChildsI, pushData: boolean) => {
          const fileFormat: string = e.name.slice(-4);
          if (e.size! > 1024 * 10000 && e.tileStatus === "available") {
            if (fileFormat === ".laz" || fileFormat === ".las") {
              if (pushData) {
                this.pointCloudChilds!.push({
                  ...e,
                  name: e.name.substring(0, e.name.length - 4),
                });
              } else return true;
            }
          }
        };
        if (childs.some((e: pointCloudChildsI) => condition(e, false))) {
          this.pointCloudChilds.push({
            fileId,
            name: name.substring(0, name.length - 4),
          });
          childs.forEach((e: pointCloudChildsI) => condition(e, true));
          window.localStorage.setItem(
            "pointCloudChilds",
            JSON.stringify(this.pointCloudChilds)
          );
        } else {
          this.pointCloudChilds = [];
          window.localStorage.removeItem("pointCloudChilds");
        }
        this.pointCloudChildsWasFetched = true;
      });
  };
}

export default new User();
