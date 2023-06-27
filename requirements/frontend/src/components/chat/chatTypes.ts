import { User } from "../types";

export interface Room {
    name: string;
    id: number;
    type: string;
    owner?: User;
}

export interface ChatRoomData {
	whitelist: User[];
	admins: User[];
	banned: User[];
	connected: User[];
	friends: User[];
	blocked : User[];  
	room: Room;
	owner: User;
	messages: Message[];
}

export interface Message {
	id: number;
    author: User;
    text: string;
}
