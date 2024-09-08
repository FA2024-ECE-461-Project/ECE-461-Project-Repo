// this is a module responsible for making API calls to the urls (uris)
import {TokenBuffer} from './TokenBuffer';

class API_Caller {
    private GitHubTokens: TokenBuffer;
    private successfulCall: boolean;
    
    constructor(tokens: [string, string, string, string]) {
        this.GitHubTokens = new TokenBuffer(tokens);
    }
    
    makeCallTo(url: string, action: string) {
        // use await/sync function to make request to url
        // records the call status to successfulCall
        // stores the json rendered 
    }

    is_successfulCall(): boolean {
        //return the status of the most recent API call
        return this.successfulCall;
    }

}