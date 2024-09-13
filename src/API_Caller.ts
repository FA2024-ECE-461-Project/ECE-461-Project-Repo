// // this is a module responsible for making API calls to the urls (uris)
// import {TokenBuffer} from './TokenBuffer';

// class API_Caller {
//     private GitHubTokens: TokenBuffer;
//     private successfulCall: boolean;
    
//     constructor() {
//         require('dotenv').config();
//         //type error should be fixed once all environment variables are provided with default value
//         this.GitHubTokens = new TokenBuffer(
//             [process.env.NICK_TOKEN, process.env.GAURAV_TOKEN, 
//              process.env.RYAN_TOKEN,  process.env.JIMMY_TOKEN]);
//         this.successfulCall = false;    //default to false before any made calls
//     }
    
//     async makeCallTo(url: string, action: string) {
//         // use await/sync function to make request to url
//         // records the call status to successfulCall
//         // stores the json rendered 
//     }

//     is_successfulCall(): boolean {
//         //return the status of the most recent API call
//         return this.successfulCall;
//     }

// }