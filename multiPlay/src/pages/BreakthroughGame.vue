<template>
  <q-page class="row items-center justify-evenly">
    <div class="player-info">
      <div>
        <q-input outlined :model-value="playerNameInput" label="Dein Name" bg-color="white"
          standout="bg-light-green-11 text-black" @update:model-value="(value) => changeName(value)" />
      </div>
      <div>
        <q-btn label="Change Color" @click="changeColor" />
      </div>
    </div>
    <main class="main-container">
      <h1 class="main-container_h1">Breakthrough</h1>

      <h3 class="main-container_h3">Player {{ currentPlayer }}'s turn</h3>

      <div class="main-container_board">
        <div v-for="(row, x) in board" :key="x" class="board_div">
          <div v-for="(cell, y) in row" :key="y" @click="MakeMove(x, y)" class="div_cell"
            :style="cell === 'X' ? 'color:green' : 'color:red'">
            <span class="material-symbols-outlined"
              :style="cell === 'X' ? 'color:rgb(241, 157, 0);' : 'color:rgb(73, 0, 141);'">
              {{ cell === 'X' ? 'Close' : cell === 'O' ? 'Circle' : ''}}
            </span>
          </div>
        </div>
      </div>

      <div class="main-container_bottom">
        <h2 v-if="winner" class="bottom_h2">Player '{{ winner }}' wins!</h2>
        <q-btn class="bottom_resetBtn" color="secondary" @click="ResetGame">Reset</q-btn>
      </div>
    </main>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  getDatabase,
  ref as storageRef,
  set,
  onDisconnect,
  onValue,
  onChildAdded,
  DatabaseReference,
  onChildRemoved,
  update,
  get,
  child,
} from 'firebase/database';
import { useRoute } from 'vue-router';
import { Players } from './CoinGame.vue';
import { computed } from '@vue/reactivity';

interface DatabaseEntry {
  id: string;
  name: string;
  sign: string;
  gamesWon: number;
}


export default defineComponent({
  name: 'BreakthroughGame',
  components: {},
  setup() {
    onMounted(() => {
      initGame();
    });
    const db = getDatabase();
    const route = useRoute()

    let playerId: string;
    let lobbyId = ref<string>('');
    let playerRef: DatabaseReference;
    let boardRef: DatabaseReference;
    let playerLobbyRef: DatabaseReference;
    let players: Players = {};
    var getPossibleMoves = false
    var oldPosition: any[] = []
    var moves: any[] = []


    //updates Player Name
    const playerNameInput = ref<string>();
    const changeName = (newValue: string | number | null) => {
      if (typeof newValue === 'string') {
        playerNameInput.value = newValue
        update(playerLobbyRef, {
          name: newValue,
        });
      }
    };

    const currentPlayer = ref('X')
    let currentPlayerRef: DatabaseReference;
    const board = ref([
      ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
      ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
      ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
    ]);
    const moveboard = ref([
      ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
      ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
      ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
    ]);

    const CalculateWinner = (board: Array<Array<string>>) => {
      var winner = ''

      var xSign = 0
      var oSign = 0

      if (checkline(board, 7,'O') === true) {
            winner = 'O'
            console.log('O GEWINNT DIAGONAL!')
            return winner
          } else if (checkline(board, 0, 'X') === true) {
            winner = 'X'
            console.log('X GEWINNT DIAGONAL!')
            return winner
          }
      return null
    }

    const winner = computed(() => {

      return CalculateWinner(board.value)
    })

    const checkline = (board: Array<Array<string>>, x: number, playerSign: string ) => {
      for(let i = 0; i <= 7; i++){
        if(board[x][i] === playerSign){
          return true
        }
      }
    }

   const MakeMove = (x: number, y: number) =>  {
      console.log(playerRef)
      console.log(playerId)
      get(child(playerLobbyRef, 'sign')).then((snapshot) => {
        if (snapshot.exists()) {
          if (snapshot.val() === currentPlayer.value) {
            console.log('MAKEMOVE:', playerRef)
            if (winner.value) return
            console.log(getPossibleMoves);


            if (!getPossibleMoves && board.value[x][y] == currentPlayer.value){
              GetMoves(x,y);
              oldPosition.push([x,y])
              getPossibleMoves = true
              return
            }

            if(moveboard.value[x][y] == "P"){
            moves = []
            board.value[x][y] = currentPlayer.value

            board.value[oldPosition[0][0]][oldPosition[0][1]] = ''
            moveboard.value = board.value
            oldPosition = []
            getPossibleMoves = false
            currentPlayer.value = currentPlayer.value === 'X' ? 'O' : 'X'

            update(boardRef, {
              board: board.value
            });
            update(currentPlayerRef, {
              currentPlayer: currentPlayer.value
            });
          }
        }}})

    }

    const GetMoves = (x: number, y: number) => {
      if(currentPlayer.value == 'X'){
        if(y-1 >= 0 ){
          if(board.value[x-1][y-1] != 'X'){
            moves.push([[x-1, y-1]])
          }
        }
          if(board.value[x-1][y] == ''){
            moves.push([[x-1, y]])
          }
        if(y+1 <= 7 ){
          if(board.value[x-1][y+1] != 'X'){
            moves.push([[x-1, y+1]])
          }
        }
      }
      if(currentPlayer.value == 'O'){
        if(y-1 >= 0 ){
          if(board.value[x+1][y-1] != 'O'){
            moves.push([[x+1, y-1]])
          }
        }
          if(board.value[x+1][y] == ''){
            moves.push([[x+1, y]])
          }
        if(y+1 <= 7 ){
          if(board.value[x+1][y+1] != 'O'){
            moves.push([[x+1, y+1]])
          }
        }
      }
      console.log(moves)
      moves.forEach((move)  => {
        moveboard.value[move[0][0]][move[0][1]] = "P"
      }
      )
    }

    const ResetGame = () => {
      board.value = [
      ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
      ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
      ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
      ]
      currentPlayer.value = 'X'
    }

    const initGame = () => {
      if (route.params.lobbyId) {
        lobbyId.value = route.params.lobbyId.toString()

        const allPlayersRef = storageRef(db, `lobbys/${lobbyId.value}/players`)
        boardRef = storageRef(db, `lobbys/${lobbyId.value}/board/`);
        currentPlayerRef = storageRef(db, `lobbys/${lobbyId.value}/currentPlayer/`);

        //fires when change occurs
        onValue(allPlayersRef, (snapshot) => {
          players = snapshot.val() || {}
          Object.keys(players).forEach((key) => {
            const characterState = players[key] as unknown as DatabaseEntry
            console.log('characterState', characterState)
          })
        })
        onValue(boardRef, (snapshot) => {
          console.log('onValue - boardRef', snapshot.val())
          if (snapshot.val() != null){
            board.value = snapshot.val().board
          }
        })
        onValue(currentPlayerRef, (snapshot) => {
          console.log('onValue - currentPlayerRef',snapshot.val())
          if (snapshot.val() != null) {
            currentPlayer.value = snapshot.val().currentPlayer
          }
        })
        //fires when a new node is added to the db
        onChildAdded(allPlayersRef, (snapshot) => {
          const addedPlayer = snapshot.val()
          console.log('addedPlayer',addedPlayer)
        })
        //remove character DOM Element when they leave
        onChildRemoved(allPlayersRef, (snapshot) => {
          const removedKey = snapshot.val().id;
          console.log('removedKey', removedKey)
        });

        set(boardRef, {
          board: board.value
        });
        set(currentPlayerRef, {
          currentPlayer: currentPlayer.value
        });
      }
    }


    //*****firebase stuff*****
    const auth = getAuth();
    signInAnonymously(auth)
      .then(() => {
        // Signed in..
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(
          'So sorry, something went wrong! errorCode: ' +
            errorCode +
            ' | errorMessage: ' +
            errorMessage
        );
      });

     onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        playerId = user.uid;

        const name = createName();
        playerNameInput.value = name;

        playerRef = storageRef(db, 'players' + playerId);
        get(child(playerRef, 'lobbyId')).then((snapshot) => {
          if (snapshot.exists()) {
            lobbyId.value = snapshot.val();
          } else {
            lobbyId.value = route.params.lobbyId.toString()
            console.log('Joined Lobby ID:', lobbyId.value);
          }
        }).catch((error) => {
          console.error(error);
        }).then(() => {
          console.log('>>>>>>>>>', lobbyId.value)
          playerLobbyRef = storageRef(db, `lobbys/${lobbyId.value}/players/` + playerId)
          if (Object.keys(players).length === 1) {
            update(playerLobbyRef, {
              id: playerId,
              name: playerNameInput.value,
              sign: 'X',
              gamesWon: 0
            });
          } else {
            update(playerLobbyRef, {
              id: playerId,
              name: playerNameInput.value,
              sign: 'O',
              gamesWon: 0
            });
          }

        }
        )

        //remove Player from Firebase, when disconnect
        onDisconnect(playerRef).remove();
        onDisconnect(playerLobbyRef).remove();

      } else {
        // User is signed out
        // ...
      }
    });

    //*****helper Functions*****
    const randomFromArray = (array: any[]) => {
      return array[Math.floor(Math.random() * array.length)];
    };

    //create a randome start name
    const createName = () => {
      const prefix = randomFromArray([
        'COOL',
        'SUPER',
        'HIP',
        'SMUG',
        'COOL',
        'SILKY',
        'GOOD',
        'SAFE',
        'DEAR',
        'DAMP',
        'WARM',
        'RICH',
        'LONG',
        'DARK',
        'SOFT',
        'BUFF',
        'DOPE',
      ]);
      const animal = randomFromArray([
        'BEAR',
        'DOG',
        'CAT',
        'FOX',
        'LAMB',
        'LION',
        'BOAR',
        'GOAT',
        'VOLE',
        'SEAL',
        'PUMA',
        'MULE',
        'BULL',
        'BIRD',
        'BUG',
      ]);
      return `${prefix} ${animal}`;
    };
    // Options for Player Colors... these are in the same order as our sprite sheet
    const playerColors = ['blue', 'red', 'orange', 'yellow', 'green', 'purple'];


    return {
    currentPlayer,
    board,
    winner,
    playerNameInput,
    MakeMove,
    ResetGame,
    changeName,
    createName,
    };
  },
});
</script>

<style lang="scss" scoped scss>
.main-container{
  padding-top: 8px;
  text-align: center;
  color: white;
  min-height: 100vh;
  padding-top: 150px;
  .main-container_h1{
    margin-bottom: 8px;
    font-size: 30px;
    line-height: 36px;
    font-weight: 700;
    text-transform: uppercase;
  }
  .main-container_h3 {
    font-size: 20px;
    line-height: 28px;
    margin-bottom: 4px;
  }
  .main-container_board {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 8px;
    .board_div{
      display: flex;
      .div_cell{
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid white;
        width: 80px;
        height: 80px;
        cursor: pointer;

        &:hover{
          background-color: #86aeff;
        }
      }
    }
  }
  .main-container_bottom {
    .bottom_h2{
      margin-bottom: 8px;
      font-size: 60px;
      line-height: 1;
    }
    .bottom_resetBtn{
      margin-top: 20px;
      font-weight: bold;
    }
  }
}
.material-symbols-outlined {
  font-size: 70px;
  line-height: 70px;
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 48
}
.player-info {
  position: absolute;
  top: 0;
  left: 0;
  padding: 1em;
  display: flex;
  gap: 0.5em;
  align-items: flex-end;
  margin-top: 20px;

  button {
      font-family: inherit;
      font-weight: bold;
      font-size: 14px;
      height: 44px;
      border-radius: 4px;
      outline: 0;
      padding-left: 0.5em;
      padding-right: 0.5em;
      border: 0;
      cursor: pointer;
      color: white;
      border: 1px solid rgb(241, 157, 0);
      background-color: #f2c268;
    }

    button:active {
      position: relative;
      top: 1px;
    }
}

label {
  display: block;
  font-weight: bold;
}

input[type='text'],

input[type='text'] {
  outline: 0;
  padding-left: 0.5em;
  border: 3px solid #222034;
  width: 150px;
  text-transform: uppercase;
}

input[type='text']:focus {
  border-color: #f000ff;
}
</style>
