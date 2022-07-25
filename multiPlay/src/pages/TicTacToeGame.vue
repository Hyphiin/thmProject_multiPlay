<template>
  <q-page class="row items-center justify-evenly">
    <main class="main-container">
      <h1 class="main-container_h1">Tic Tac Toe</h1>

      <h3 class="main-container_h3">Player {{ player }}'s turn</h3>

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
        <q-btn class="bottom_resetBtn" @click="ResetGame">Reset</q-btn>
      </div>
    </main>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
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
  remove,
get,
child,
} from 'firebase/database';
import { useRoute } from 'vue-router';

interface Players {
  [key: string]: DatabaseEntry;
}
interface PlayerElements {
  [key: string]: HTMLDivElement;
}
interface DatabaseEntry {
  id: string;
  name: string;
  direction: string;
  color: string;
  x: number;
  y: number;
  coins: number;
  value: string;
}
interface Coordinates {
  x: number,
  y: number
}


export default defineComponent({
  name: 'TicTacToeGame',
  components: {},
  setup() {
    const db = getDatabase();
    const route = useRoute()

    let playerId: string;
    let lobbyId = ref<string>('');
    let playerRef: DatabaseReference;
    let playerLobbyRef: DatabaseReference;
    let players: Players = {};
    let playerElements: PlayerElements = {};


    const player = ref('X' )
    const board = ref([
       ['','',''],
       ['','',''],
       ['','','']
    ])

    onMounted(() => {
      initGame();
    })

    const CalculateWinner = (board: Array<string>) => {
      const winningLines = [[0, 1, 2],[3, 4, 5],[6, 7, 8],[0, 3, 6],[1, 4, 7],[2, 5, 8],[0, 4, 8],[2, 4, 6]]
      for (let i = 0; i < winningLines.length; i++) {
        const [a, b, c] = winningLines[i]

        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          return board[a]
        }
      }
      return null
    }

    const winner = computed(() => {
      let tempArray = board.value.reduce((acc, val) => acc.concat(val), []);

      return CalculateWinner(tempArray)
    })

    const MakeMove = (x: number, y: number) => {
      if (winner.value) return

      if(board.value[x][y] !== '') return

      board.value[x][y] = player.value
      var playerValue = player.value
      const boardRef = storageRef(db, `lobbys/${lobbyId.value}/board/${getKeyString(x, y)}`);
        set(boardRef, {
          x,
          y,
          playerValue,
        });

      player.value = player.value === 'X' ? 'O' : 'X'
    }

    const ResetGame = () => {
      board.value = [
        ['','',''],
        ['','',''],
        ['','','']
      ]
      player.value = 'X'
    }

    const initGame = () => {

      if(route.params.lobbyId){
      lobbyId.value = route.params.lobbyId.toString()

      const allPlayersRef = storageRef(db, `lobbys/${lobbyId.value}/players`);
      const allBoardRef = storageRef(db, `lobbys/${lobbyId.value}/board`);

      onValue(allPlayersRef, (snapshot) => {
        players = snapshot.val() || {};
        Object.keys(players).forEach((key) => {
          
        });
      });

      onChildAdded(allBoardRef, (snapshot) => {
        const piece = snapshot.val();
        const key: string = getKeyString(piece.x, piece.y);
        piece[key] = true;

        
      });

      onChildRemoved(allBoardRef, (snapshot) => {
        const { x, y } = snapshot.val();
        const keyToRemove = getKeyString(x, y);
      });

    }
    };
    const getKeyString = (x: number, y: number): string => {
      return `${x}x${y}`;
    };

    return { player, board, winner, MakeMove , ResetGame};
  },
});
</script>

<style lang="scss" scoped scss>
.main-container{
  padding-top: 8px;
  text-align: center;
  color: white;
  min-height: 100vh;
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
      background-color: rgb(241, 157, 0);
      color: white;
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
</style>
