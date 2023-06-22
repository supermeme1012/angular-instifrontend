export interface GuacCredential {
  Password: string;
  Username: string;
}

export interface GuacAuth {
  authToken: string;
  username: string;
  dataSource: string;
  availableDataSources: string[];
}