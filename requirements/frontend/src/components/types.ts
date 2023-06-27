export interface User {
  username: string;
  avatar?: string;
  avatarSelected?: boolean;
  gameLogin?: string;
  id: number;
  elo: number;
  win: number;
  loose: number;
  createAt: string;
  updateAt: string;
  state: string;
  rank?: number;
}

export interface rankData {
  id: number;
  username: string;
  gameLogin?: string;
  elo: number;
  win: number;
  loose: number;
  rank?: number;
}

export interface PublicUserInfo {
  createAt: string;
  state: boolean;
  gameLogin: string;
  elo: number;
  win: number;
  loose: number;
  avatar: string;
}