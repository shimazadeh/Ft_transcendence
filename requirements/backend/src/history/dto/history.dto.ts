import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class HistoryDto {
	// @IsNumber()
	@IsNotEmpty()
	userID: string;

	@IsString()
	@IsNotEmpty()
	result: string;

	@IsString()
	@IsNotEmpty()
	mode: string;

	// @IsNumber()
	@IsNotEmpty()
	pointsWon: string;

	// @IsNumber()
	@IsNotEmpty()
	pointsLost: string;

	// @IsNumber()
	@IsNotEmpty()
	elo: string;
}

export class HistoryID {
    id: number;
}
