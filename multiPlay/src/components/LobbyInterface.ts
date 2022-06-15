export class LobbyInterface { 
    playerId: string;
    lobbyId: number;
    gamemode: string;
    currentPlayers: number;
    
    constructor(playerId: string, lobbyId: number, gamemode: string, currentPlayers: number) {

        this.playerId = playerId,
        this.lobbyId =  lobbyId,
        this.gamemode = gamemode,
        this.currentPlayers = currentPlayers

    }
}

