// internal structure referred by API_Caller
// basic FIFO (First-In-First-Out) structure that is circular
// this is meant to store GitHub tokens for each team member
// All 4 tokens should be provided to the constructor as strings

class TokenBuffer {
    private buffer: [string, string, string, string];    //a tuple that only takes in 4 tokens
    private size: number = 4;               //fixed size of 4 tokens from each member
    private currentTokenIdx: number;
    
    constructor(tokens: [string, string, string, string]) {
        this.buffer = tokens;
        this.currentTokenIdx = 0;
    }

    // getCurrentToken returns the token pointed to by currentTokenIdx, 
    // use this to get current token
    getCurrentToken(): string {
        return this.buffer[this.currentTokenIdx];
    }
    
    //shiftToken should only be invoked when current token reaches its API call limit
    shiftToken(): void {
        this.currentTokenIdx = (this.currentTokenIdx + 1) % this.size;
    }

}

export {TokenBuffer};