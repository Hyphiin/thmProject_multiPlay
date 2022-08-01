<template>
  <q-page class="row items-center justify-evenly">
    <div class="game-container">
      <div class="player-info">
        <div class="info">
          <div>
            <q-input
              outlined
              :model-value="playerNameInput"
              label="Dein Name"
              bg-color="white"
              standout="bg-orange-2 text-black"
              @update:model-value="(value) => changeName(value)"
            />
          </div>
          <div>
            <q-btn
              :color="playerId === xPlayer.id ? xPlayer.color : oPlayer.color"
              label="Change color"
              @click="changeColor"
            />
          </div>
        </div>
        <div>
          <q-btn class="goBackBtn" icon="home" @click="goBack"></q-btn>
        </div>
      </div>
      <main class="main-container">
        <h1 class="main-container_h1">Connect Four</h1>

        <h3 v-if="oPlayer.id !== ''" class="main-container_h3">
          Player {{ currentSign === 'X' ? xPlayer.name : oPlayer.name }}'s turn
        </h3>
        <h3 v-else class="main-container_h3">You need another Player!</h3>

        <div class="main-container_board">
          <div v-for="(row, x) in board" :key="x" class="board_div">
            <div
              v-for="(cell, y) in row"
              :key="y"
              @click="oPlayer.id !== '' ? MakeMove(x, y) : null"
              class="div_cell"
            >
              <span
                class="material-symbols-outlined"
                :style="
                  cell === 'X'
                    ? 'color:' + xPlayer.color
                    : 'color:' + oPlayer.color
                "
              >
                {{ cell === 'X' ? 'Close' : cell === 'O' ? 'Circle' : '' }}
              </span>
            </div>
          </div>
        </div>

        <div class="main-container_bottom">
          <h2 v-if="winner" class="bottom_h2">
            Player '{{ winner === 'X' ? xPlayer.name : oPlayer.name }}' wins!
          </h2>
          <q-btn class="bottom_resetBtn" color="secondary" @click="ResetGame"
            >Reset</q-btn
          >
        </div>
        <div class="score" v-if="xPlayer.gamesWon >= oPlayer.gamesWon">
          <h1 class="main-container_h1">SCORES:</h1>
          <div class="score-div">
            {{ xPlayer.name }}: {{ xPlayer.gamesWon }} points!
          </div>
          <div v-if="oPlayer.id !== ''" class="score-div">
            {{ oPlayer.name }}: {{ oPlayer.gamesWon }} points!
          </div>
        </div>
        <div class="score" v-if="xPlayer.gamesWon < oPlayer.gamesWon">
          <h1 class="main-container_h1">SCORES:</h1>
          <div class="score-div">
            {{ oPlayer.name }}: {{ oPlayer.gamesWon }} points!
          </div>
          <div class="score-div">
            {{ xPlayer.name }}: {{ xPlayer.gamesWon }} points!
          </div>
        </div>
      </main>
    </div>
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
  DatabaseReference,
  update,
  get,
  child,
  onChildRemoved,
  remove,
  // onChildAdded,
} from 'firebase/database';
import { useRoute, useRouter } from 'vue-router';
import { Players } from './CoinGame.vue';
import { computed } from '@vue/reactivity';

interface DatabaseEntry {
  id: string;
  name: string;
  sign: string;
  gamesWon: number;
  color: string;
}

export default defineComponent({
  name: 'ConnectFourGame',
  components: {},
  setup() {
    onMounted(() => {
      initGame();
    });
    const db = getDatabase();
    const route = useRoute();
    const router = useRouter();

    let playerId = ref<string>('');
    let lobbyId = ref<string>('');
    let playerRef: DatabaseReference;
    let boardRef: DatabaseReference;
    let playerLobbyRef: DatabaseReference;
    let players: Players = {};

    //updates Player Name
    const playerNameInput = ref<string>();
    const changeName = (newValue: string | number | null) => {
      if (typeof newValue === 'string') {
        playerNameInput.value = newValue;
        update(playerLobbyRef, {
          name: newValue,
        });
      }
    };

    //updates Player Color
    const playerCurrentColor = ref<string>('orange');
    const changeColor = () => {
      const myColorIndex = playerColors.indexOf(players[playerId.value].color);
      const nextColor = playerColors[myColorIndex + 1] || playerColors[0];
      playerCurrentColor.value = nextColor;
      update(playerLobbyRef, {
        color: nextColor,
      });
    };

    const currentSign = ref<string>('X');

    const xPlayer = ref<DatabaseEntry>({
      id: '',
      name: '',
      sign: 'X',
      gamesWon: 0,
      color: 'orange',
    });

    const oPlayer = ref<DatabaseEntry>({
      id: '',
      name: '',
      sign: 'O',
      gamesWon: 0,
      color: 'purple',
    });

    let currentPlayerRef: DatabaseReference;
    const board = ref([
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
    ]);

    const CalculateWinner = (board: Array<Array<string>>) => {
      var winner = '';

      var xSign = 0;
      var oSign = 0;

      //check vertical
      for (let x = 0; x <= 5; x++) {
        for (let y = 0; y <= 7; y++) {
          if (board[x][y] === 'O') {
            xSign = 0;
            oSign += 1;
          } else if (board[x][y] === '') {
            xSign = 0;
            oSign = 0;
          } else if (board[x][y] === 'X') {
            oSign = 0;
            xSign += 1;
          }

          if (oSign === 4) {
            break;
          } else if (xSign === 4) {
            break;
          }
        }
        if (oSign === 4) {
          winner = 'O';
          return winner;
        } else if (xSign == 4) {
          winner = 'X';
          return winner;
        }
        oSign = 0;
        xSign = 0;
      }
      oSign = 0;
      xSign = 0;

      //check horizontal
      for (let y = 0; y <= 7; y++) {
        for (let x = 0; x <= 5; x++) {
          if (board[x][y] === 'O') {
            xSign = 0;
            oSign += 1;
          } else if (board[x][y] === '') {
            xSign = 0;
            oSign = 0;
          } else if (board[x][y] === 'X') {
            oSign = 0;
            xSign += 1;
          }

          if (oSign === 4) {
            break;
          } else if (xSign === 4) {
            break;
          }
        }
        if (oSign === 4) {
          winner = 'O';
          return winner;
        } else if (xSign == 4) {
          winner = 'X';
          return winner;
        }
        oSign = 0;
        xSign = 0;
      }

      //check diagonal
      for (let x = 0; x <= 5; x++) {
        for (let y = 0; y <= 7; y++) {
          if (checkDiagonal(board, x, y, 'O') === true) {
            winner = 'O';
            return winner;
          } else if (checkDiagonal(board, x, y, 'X') === true) {
            winner = 'X';
            return winner;
          }
        }
      }

      return null;
    };

    const checkDiagonal = (
      board: Array<Array<string>>,
      x: number,
      y: number,
      playerSign: string
    ) => {
      if (x + 3 <= 5 && y + 3 <= 7) {
        if (board[x][y] === playerSign) {
          if (board[x + 1][y + 1] === playerSign) {
            if (board[x + 2][y + 2] === playerSign) {
              if (board[x + 3][y + 3] === playerSign) {
                return true;
              }
            }
          }
        }
      }
      if (x - 3 >= 0 && y + 3 <= 7) {
        if (board[x][y] === playerSign) {
          if (board[x - 1][y + 1] === playerSign) {
            if (board[x - 2][y + 2] === playerSign) {
              if (board[x - 3][y + 3] === playerSign) {
                return true;
              }
            }
          }
        }
      }
      return false;
    };

    const winner = computed(() => {
      let tempWinner = CalculateWinner(board.value);
      if (tempWinner === 'X') {
        const winningPlayerRef = storageRef(
          db,
          `lobbys/${lobbyId.value}/players/${xPlayer.value.id}`
        );
        update(winningPlayerRef, {
          gamesWon: xPlayer.value.gamesWon + 1,
        });
      } else if (tempWinner === 'O') {
        const winningPlayerRef = storageRef(
          db,
          `lobbys/${lobbyId.value}/players/${oPlayer.value.id}`
        );
        update(winningPlayerRef, {
          gamesWon: oPlayer.value.gamesWon + 1,
        });
      }
      return tempWinner;
    });

    const MakeMove = (x: number, y: number) => {
      get(child(playerLobbyRef, 'sign')).then((snapshot) => {
        if (snapshot.exists()) {
          if (snapshot.val() === currentSign.value) {
            if (winner.value) return;
            if (board.value[x][y] !== '') return;

            for (let i = x; i < 6; i++) {
              if (board.value[i][y] == '') {
                x = i;
              }
            }

            board.value[x][y] = currentSign.value;

            currentSign.value = currentSign.value === 'X' ? 'O' : 'X';

            update(boardRef, {
              board: board.value,
            });
            update(currentPlayerRef, {
              currentPlayer: currentSign.value,
            });
          }
        }
      });
    };

    const ResetGame = () => {
      board.value = [
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ];
      currentSign.value = 'X';
      set(boardRef, {
        board: board.value,
      });
      set(currentPlayerRef, {
        currentPlayer: currentSign.value,
      });
    };

    const initGame = () => {
      if (route.params.lobbyId) {
        lobbyId.value = route.params.lobbyId.toString();

        const allPlayersRef = storageRef(db, `lobbys/${lobbyId.value}/players`);
        boardRef = storageRef(db, `lobbys/${lobbyId.value}/board/`);
        const currLobbyRef = storageRef(db, `lobbys/${lobbyId.value}`);
        currentPlayerRef = storageRef(
          db,
          `lobbys/${lobbyId.value}/currentPlayer/`
        );

        //fires when change occurs
        onValue(allPlayersRef, (snapshot) => {
          players = snapshot.val() || {};
          Object.keys(players).forEach((key) => {
            const characterState = players[key] as unknown as DatabaseEntry;
            if (characterState.sign === 'X') {
              xPlayer.value = characterState;
            } else if (characterState.sign === 'O') {
              oPlayer.value = characterState;
            }
          });
          if (Object.keys(players).length === 1) {
            oPlayer.value = {
              id: '',
              name: '',
              sign: 'O',
              gamesWon: 0,
              color: 'purple',
            };
            update(currLobbyRef, {
              currentPlayers: 1,
            });
          }
        });
        onValue(boardRef, (snapshot) => {
          if (snapshot.val() != null) {
            board.value = snapshot.val().board;
          }
        });
        onValue(currentPlayerRef, (snapshot) => {
          if (snapshot.val() != null) {
            currentSign.value = snapshot.val().currentPlayer;
          }
        });
        // //fires when a new node is added to the db
        // onChildAdded(allPlayersRef, (snapshot) => {
        //   const addedPlayer = snapshot.val();
        // });
        //remove character DOM Element when they leave
        onChildRemoved(allPlayersRef, (snapshot) => {
          const removedPlayer = snapshot.val();
          if (lobbyId.value.includes(removedPlayer.id)) {
            router.push({ name: 'MainLobby' });
          }
        });

        set(boardRef, {
          board: board.value,
        });
        set(currentPlayerRef, {
          currentPlayer: currentSign.value,
        });
      }
    };

    const goBack = () => {
      const playerRef = storageRef(
        db,
        `lobbys/${lobbyId.value}/players/${oPlayer.value.id}`
      );
      remove(playerRef);
      ResetGame();
      router.push({ name: 'MainLobby' });
    };

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
        playerId.value = user.uid;

        const name = createName();
        playerNameInput.value = name;

        playerRef = storageRef(db, 'players' + playerId.value);
        get(child(playerRef, 'lobbyId'))
          .then((snapshot) => {
            if (snapshot.exists()) {
              lobbyId.value = snapshot.val();
            } else {
              lobbyId.value = route.params.lobbyId.toString();
            }
          })
          .catch((error) => {
            console.error(error);
          })
          .then(() => {
            playerLobbyRef = storageRef(
              db,
              `lobbys/${lobbyId.value}/players/` + playerId.value
            );
            if (Object.keys(players).length === 1) {
              update(playerLobbyRef, {
                id: playerId.value,
                name: playerNameInput.value,
                sign: 'X',
                gamesWon: 0,
                color: randomFromArray(playerColors),
              });
            } else {
              update(playerLobbyRef, {
                id: playerId.value,
                name: playerNameInput.value,
                sign: 'O',
                gamesWon: 0,
                color: randomFromArray(playerColors),
              });
            }
          });

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
      playerId,
      xPlayer,
      oPlayer,
      currentSign,
      board,
      winner,
      playerNameInput,
      MakeMove,
      ResetGame,
      changeName,
      createName,
      changeColor,
      playerCurrentColor,
      goBack,
    };
  },
});
</script>

<style lang="scss" scoped scss>
.game-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 20px;
  .main-container {
    padding-top: 8px;
    text-align: center;
    color: white;
    min-height: 100vh;

    .main-container_h1 {
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

      .board_div {
        display: flex;

        @media only screen and (max-width: 600px) {
          .div_cell {
            width: 50px !important;
            height: 50px !important;
          }
        }

        .div_cell {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid white;
          width: 80px;
          height: 80px;
          cursor: pointer;

          &:hover {
            background-color: #86aeff;
          }
        }
      }
    }

    .main-container_bottom {
      .bottom_h2 {
        margin-bottom: 8px;
        font-size: 60px;
        line-height: 1;
      }

      .bottom_resetBtn {
        margin-top: 20px;
        font-weight: bold;
      }
    }
  }

  .material-symbols-outlined {
    font-size: 70px;
    line-height: 70px;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;
  }
  @media only screen and (max-width: 600px) {
    .material-symbols-outlined {
      font-size: 40px;
      line-height: 40px;
    }
  }

  .player-info {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .info {
      padding: 1em;
      display: flex;
      gap: 0.5em;
      align-items: flex-end;

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
        border: 1px solid white;
      }

      button:active {
        position: relative;
        top: 1px;
      }
    }

    .goBackBtn {
      background-color: rgb(241, 157, 0);
      color: white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      margin-right: 20px;
    }
  }

  .score {
    margin-top: 40px;

    .score-div {
      font-size: 20px;
      line-height: 28px;
      margin-bottom: 4px;
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
}
</style>
