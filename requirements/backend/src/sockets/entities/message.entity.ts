export class UserDto {
    username: string;
    id: number;
    elo: number;
    win: number;
    loose: number;
    createAt: string;
    updateAt: string;
    state: string;
}

export class MessageObj {
    id: number;
    name: string;
    text: string;
    room: number;
    roomName: string;
}

export class CreateRoomDto {
    name: string;
    type: string;
    password: string;
}

export class RoomObj {
    id: number;
    name: string;
}

export class JoinRoomDto {
    name: string;
    roomName: string;
    password: string;
}

export class TypingDto {
    isTyping: boolean;
    roomName: string;
}
