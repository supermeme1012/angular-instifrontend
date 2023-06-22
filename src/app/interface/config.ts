export interface Config {
    apiUrl: string;
    guacUrl: string;
    serverApiKey: string;
    firebase: {
        apiKey: string;
        authDomain: string;
        databaseURL: string;
        projectId: string;
        storageBucket: string;
        messagingSenderId: string;
        appId: string;
        measurementId: string;
    };
}