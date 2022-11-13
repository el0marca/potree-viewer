export interface UserInfo {
  refreshToken: {
    token: string;
  };
  name: string;
}
export interface PointCloudChilds {
  name: string;
  size?: number;
  tileStatus?: string;
  fileId: number;
  projectId?: number;
}
