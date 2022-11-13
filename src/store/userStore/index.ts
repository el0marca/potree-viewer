import { makeAutoObservable } from "mobx";
import { CognitoRefreshToken } from "amazon-cognito-identity-js";
import axios from "axios";
import { userPool } from "../../api/cognito";
import { PointCloudChilds, UserInfo } from "./types";

export const getFileName = (name: string): string => {
  return name.split(".").slice(0, -1).join(".");
};
export const getFileExt = (name: string): string | undefined => {
  return name.split(".").pop();
};

class User {
  userInfo: UserInfo | null = null;
  accessToken: string = "";
  cognitoUser: any = null;
  pointCloudChilds: PointCloudChilds[] = [];
  pointCloudChildsWasFetched: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  verifySession() {
    this.cognitoUser = userPool.getCurrentUser();
    return new Promise<void>((res, rej) => {
      this.cognitoUser.getSession((err: string, info: UserInfo) => {
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
        `${process.env.baseUrl}/api/files/${projectId}/${fileId}/get-childs`,
        axiosConfig
      )
      .then((res) => {
        let childs = res.data.data.childs;

        const isPointCloudValid = (e: PointCloudChilds, pushData: boolean) => {
          const fileFormat: string = e.name.slice(-4);
          if (e.size! > 1024 * 10000 && e.tileStatus === "available") {
            if (fileFormat === ".laz" || fileFormat === ".las") {
              if (pushData) {
                this.pointCloudChilds!.push({
                  ...e,
                  name: getFileName(e.name),
                });
              } else return true;
            }
          }
        };
        if (childs.some((e: PointCloudChilds) => isPointCloudValid(e, false))) {
          this.pointCloudChilds.push({
            fileId,
            name: getFileName(name),
          });
          childs.forEach((e: PointCloudChilds) => isPointCloudValid(e, true));
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

export const userStore = new User();
