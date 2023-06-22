export interface AuthenticatorDetail {
    SharedKey: string;
    AuthenticatorUri: string;
  }

  export interface VerifyAuthenticatorResult {
    Message: string;
    Status: string;
    Data: any
  }