export interface ApiToken {
  AccessToken: string;
  RefreshToken: string;
  ExpiresIn: number;
  Created: string;
  Uid: string;
}

export interface LoginResult {
  Message: string;
  Status: string;
  Data: any
}