export class LobbyInterface { 
    lobbyId: string;
    lobbyName: string;
    playerId: string;
    gamemode: string;
    currentPlayers: number;
    isPrivate: boolean
    
    constructor(lobbyId: string, lobbyName: string,playerId: string, gamemode: string, isPrivate: boolean) {
        this.lobbyId =  lobbyId,
        this.lobbyName = lobbyName,
        this.playerId = playerId,
        this.gamemode = gamemode,
        this.currentPlayers = 1,
        this.isPrivate = isPrivate
    }
}

