<template>
  <q-page class="row items-center justify-evenly">
    <div ref="gameContainer" class="game-container"></div>
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
} from 'firebase/database';
import { KeyPressListener } from 'components/KeyPressListener';

interface PlayerElements {
  [key: string]: string | HTMLDivElement;
}
interface Players {
  [key: string]: string | DatabaseEntry;
}

interface DatabaseEntry {
  id: string;
  name: string;
  direction: string;
  color: string;
  x: number;
  y: number;
  coins: number;
}

export default defineComponent({
  name: 'CoinGame',
  components: {},
  setup() {
    onMounted(() => {
      initGame();
    });
    const db = getDatabase();
    let playerId: string;
    let playerRef: DatabaseReference;
    let players: Players = {};
    let playerElements: PlayerElements = {};

    // const gameContainer = document.querySelector('.game-container');
    const gameContainer = ref<HTMLElement>();

    const initGame = () => {
      new KeyPressListener('ArrowUp', () => handleArrowPress(0, -1));
      new KeyPressListener('ArrowDown', () => handleArrowPress(0, 1));
      new KeyPressListener('ArrowRight', () => handleArrowPress(1, 0));
      new KeyPressListener('ArrowLeft', () => handleArrowPress(-1, 0));

      const allPlayersRef = storageRef(db, 'players');
      const allCoinsRef = storageRef(db, 'coins');

      //fires when change occurs
      onValue(allPlayersRef, (snapshot) => {
        console.log('onValue fired');
        players = snapshot.val() || {};
        Object.keys(players).forEach((key) => {
          const characterState = players[key] as DatabaseEntry;
          let el = playerElements[key];
          //update the dom
          if (el instanceof HTMLDivElement) {
            el.querySelector('.Character_name')!.textContent =
              characterState.name;
            el.querySelector('.Character_coins')!.textContent =
              characterState.coins.toString();
            el.setAttribute('data-color', characterState.color);
            el.setAttribute('data-direction', characterState.direction);
            const top = 16 * characterState.y - 4 + 'px';
            const left = 16 * characterState.x + 'px';
            el.style.transform = `translate3d(${left},${top}, 0)`;
          }
        });
      });

      //fires when a new node is added to the db
      onChildAdded(allPlayersRef, (snapshot) => {
        const addedPlayer = snapshot.val();
        const characterElement = document.createElement('div');
        characterElement.classList.add('Character', 'grid-cell');
        if (addedPlayer.id === playerId) {
          characterElement.classList.add('you');
        }
        characterElement.innerHTML = `
          <div class="Character_shadow grid-cell"></div>
          <div class="Character_sprite grid-cell"></div>
          <div class="Character_name-container">
            <span class="Character_name">hello</span>
            <span class="Character_coins">0</span>
          </div>
          <div class="Character_you-arrow"></div>
        `;

        playerElements[addedPlayer.id] = characterElement;

        //fill in some initial states
        if (
          characterElement instanceof HTMLDivElement &&
          characterElement !== null
        ) {
          characterElement.querySelector('.Character_name')!.textContent =
            addedPlayer.name;
          characterElement.querySelector('.Character_coins')!.textContent =
            addedPlayer.coins;
          characterElement.setAttribute('data-color', addedPlayer.color);
          characterElement.setAttribute(
            'data-direction',
            addedPlayer.direction
          );
          const top = 16 * addedPlayer.y - 4 + 'px';
          const left = 16 * addedPlayer.x + 'px';
          characterElement.style.transform = `translate3d(${left},${top}, 0)`;
          gameContainer.value?.appendChild(characterElement);
        }
      });
    };

    //*****Key Events */

    const handleArrowPress = (xChange: number, yChange: number) => {
      const tempVar = players[playerId] as DatabaseEntry;
      const newX = tempVar.x + xChange;
      const newY = tempVar.y + yChange;

      if (true) {
        //move next space
        tempVar.x = newX;
        tempVar.y = newY;
        if (xChange === 1) {
          tempVar.direction = 'right';
        }
        if (xChange === -1) {
          tempVar.direction = 'left';
        }
        if (playerRef) {
          set(playerRef, tempVar);
        }

        console.log(tempVar);
      }
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
        playerId = user.uid;

        playerRef = storageRef(db, 'players/' + playerId);
        set(playerRef, {
          id: playerId,
          name: createName(),
          direction: 'right',
          color: randomFromArray(playerColors),
          x: 3,
          y: 10,
          coins: 0,
        });

        //remove Player from Firebase, whem disconnect
        onDisconnect(playerRef).remove();
      } else {
        // User is signed out
        // ...
      }
    });

    //*****helper Functions*****
    const instanceOfDatabaseEntry = (object: any): object is DatabaseEntry => {
      if (object && object.inputData) {
        return 'inputData' in object; // true
      }
      return false;
    };
    const randomFromArray = (array: string[]) => {
      return array[Math.floor(Math.random() * array.length)];
    };
    // const getKeyString = (x: number, y: number): string => {
    //   return `${x}x${y}`;
    // };

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

    return { gameContainer };
  },
});
</script>

<style scoped>
.game-container {
  position: relative;
  width: 240px;
  height: 208px;
  background: url(../assets/map.png) no-repeat no-repeat;
  transform: scale(3);
  image-rendering: pixelated;
}

.player-info {
  position: absolute;
  top: 0;
  left: 0;
  padding: 1em;
  display: flex;
  gap: 0.5em;
  align-items: flex-end;
}

label {
  display: block;
  font-weight: bold;
}

input[type='text'],
button {
  font-family: inherit;
  font-weight: bold;
  font-size: 18px;
  height: 44px;
  border-radius: 4px;
  outline: 0;
}

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

button {
  padding-left: 0.5em;
  padding-right: 0.5em;
  background: #59ff5a;
  border: 0;
  border-bottom: 2px solid #1e830b;
  cursor: pointer;
}
button:active {
  position: relative;
  top: 1px;
}
</style>
