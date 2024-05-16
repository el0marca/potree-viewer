import { makeAutoObservable } from "mobx";
import { CognitoRefreshToken } from "amazon-cognito-identity-js";
import axios from "axios";
import { FileFormat, PointCloudChilds, TileStatus, UserInfo } from "./types";
import { CognitoUserPool } from "amazon-cognito-identity-js";

const baseUrl = process.env.REACT_APP_BASE_URL;

export const userPool = new CognitoUserPool({
  UserPoolId: "eu-central-1_7PBGxs6Qb",
  ClientId: "77gp5fjth1n8irbche3aj4tpd7",
});

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

  async verifySession() {
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
  async refreshToken() {
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
        `${baseUrl}/api/files/${projectId}/${fileId}/get-childs`,
        axiosConfig
      )
      .then((res) => {
        const childs = res.data.data.childs as PointCloudChilds[];

        const isPointCloudValid = (pc: PointCloudChilds, pushData: boolean) => {
          const { name, size, tileStatus } = pc;
          const fileFormat = getFileExt(name);
          if (size! > 1024 * 10000 && tileStatus === TileStatus.available) {
            if (
              fileFormat === FileFormat.laz ||
              fileFormat === FileFormat.las
            ) {
              if (pushData) {
                this.pointCloudChilds!.push({
                  ...pc,
                  name: getFileName(name),
                });
              } else return true;
            }
          }
        };
        if (childs.some((pc) => isPointCloudValid(pc, false))) {
          this.pointCloudChilds.push({
            fileId,
            name: getFileName(name),
          });

          childs.forEach((pc) => isPointCloudValid(pc, true));

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
