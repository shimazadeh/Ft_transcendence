export interface ApiData {
	access_token : string;
	token_type : string;
	expires_in : number;
	scope : string;
	created_at : number;
}

export interface ApiToken {
	access_token : string;
	token_type: string,
	expires_in: number,
	scope: string,
	created_at: number,
}

export interface User42 {
	email: string,
	login: string,
	avatar: string,
	id: number,
	twoFactorAuthenticationSecret: string;
}