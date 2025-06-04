export interface AuthTokenResult {
    sub:      number;
    username: string;
    role:     string;
    expires:  string;
    iat:      number;
    exp:      number;
}

export interface IUseToken {
    sub:      number;
    role:     string;
    isExpires:  boolean;
}