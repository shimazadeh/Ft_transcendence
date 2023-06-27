
export interface GameState {
	player1: number[];
	player2: number[];
	ball: number;
	deltaY: number;
	deltaX: number;
	pause: boolean;
	playerScore: number;
	opponentScore: number;
	numofPlayers: number;
	gameSpeed: number,
	elapsedTime: number,
}

export interface BounceBallDto {
	deltaX: number;
	deltaY: number;
}

export interface movePaddleDto {
	movedPlayer: number[];
	playerID: number;
}

export interface gameModeDto {
	Mode: string
	opponentid: number
}
