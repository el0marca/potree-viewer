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

export enum FileFormat {
  las = "las",
  laz = "laz"
}

export enum TileStatus {
  available = "available"
}