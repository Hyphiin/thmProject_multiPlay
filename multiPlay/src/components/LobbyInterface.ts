export class LobbyInterface {
    lobbyId: string;
    lobbyName: string;
    playerId: string;
    gamemode: string;
    currentPlayers: number;
    isPrivate: boolean;
    isFull:boolean;
    password: string

    constructor(lobbyId: string, lobbyName: string,playerId: string, gamemode: string, isPrivate: boolean, isFull: boolean, password = '') {
        this.lobbyId =  lobbyId,
        this.lobbyName = lobbyName,
        this.playerId = playerId,
        this.gamemode = gamemode,
        this.currentPlayers = 1,
        this.isPrivate = isPrivate,
        this.isFull = isFull
        this.password = password
    }
}

