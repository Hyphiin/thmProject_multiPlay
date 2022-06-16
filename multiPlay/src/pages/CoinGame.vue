<template>
  <q-page class="row items-center justify-evenly">
    <div ref="gameContainer" class="game-container"></div>
    <div class="player-info">
      <div>
        <q-input
          outlined
          v-model="playerNameInput"
          label="Dein Name"
          bg-color="white"
          standout="bg-light-green-11 text-black"
        />
      </div>
      <div>
        <q-btn
          color="light-green-13"
          text-color="black"
          label="Farbe wechseln"
          @click="changeColor"
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
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
import { KeyPressListener } from '../components/KeyPressListener';

interface Players {
  [key: string]: DatabaseEntry;
}
interface PlayerElements {
  [key: string]: HTMLDivElement;
}
interface Coins {
  [key: string]: boolean;
}
interface CoinElements {
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
}

interface MapData {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  blockedSpaces: {
    [key: string]: boolean;
  };
}

interface Coordinates {
  x: number,
  y: number
}

export default defineComponent({
  name: 'CoinGame',
  components: {},
  setup() {
    const db = getDatabase();
    let playerId: string;
    let lobbyId = ref<string>('');
    let playerRef: DatabaseReference;
    let players: Players = {};
    let playerElements: PlayerElements = {};
    let coins: Coins = {};
    let coinElements: CoinElements = {};

    watch(
      () => lobbyId.value, 
      () => {
        initGame();
      }
    )

    // const gameContainer = document.querySelector('.game-container');
    const gameContainer = ref<HTMLElement>();

    //updates Player Name
    const playerNameInput = ref<string>();
    watch(playerNameInput, (newValue) => {
      update(playerRef, {
        name: newValue,
      });
    });
    //updates Player Color
    const changeColor = () => {
      const mySkinIndex = playerColors.indexOf(players[playerId].color);
      const nextColor = playerColors[mySkinIndex + 1] || playerColors[0];
      update(playerRef, {
        color: nextColor,
      });
    };

    //place Coin
    const placeCoin = () => {
      // if(lobbyId !== undefined){
        const { x, y } = getRandomSafeSpot();
        const coinRef = storageRef(db, `lobbys/${lobbyId.value}/coins/${getKeyString(x, y)}`);
        set(coinRef, {
          x,
          y,
        });
        const coinTimeouts = [2000, 3000, 4000, 5000];
        setTimeout(() => {
          placeCoin();
        }, randomFromArray(coinTimeouts) as number);
      // }
    };

    //grab coin
    const attemptGrabCoin = (x: number, y: number) => {
      const key = getKeyString(x, y);
      if (coins[key]) {
        //remove this key from data, then +1 player coins
        remove(storageRef(db, `lobbys/${lobbyId.value}/coins/${key}`));
        update(playerRef, {
          coins: players[playerId].coins + 1,
        });
      }
    };

    const initGame = () => {
      new KeyPressListener('ArrowUp', () => handleArrowPress(0, -1));
      new KeyPressListener('ArrowDown', () => handleArrowPress(0, 1));
      new KeyPressListener('ArrowRight', () => handleArrowPress(1, 0));
      new KeyPressListener('ArrowLeft', () => handleArrowPress(-1, 0));

      const allPlayersRef = storageRef(db, 'players');
      const allCoinsRef = storageRef(db, `lobbys/${lobbyId.value}/coins`);
      console.log("ALLCOINSREF",allCoinsRef)

      //fires when change occurs
      onValue(allPlayersRef, (snapshot) => {
        players = snapshot.val() || {};
        Object.keys(players).forEach((key) => {
          const characterState = players[key] as DatabaseEntry;
          let el = playerElements[key];
          //update the dom
          if (el instanceof HTMLDivElement) {        
            let temp = el.querySelector('.Character_name') as Element
            temp.textContent = characterState.name;
            let temp2 = el.querySelector('.Character_coins') as Element
            temp2.textContent = characterState.coins.toString();
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
          let temp = characterElement.querySelector('.Character_name') as Element
          temp.textContent = addedPlayer.name;
          let temp2 =characterElement.querySelector('.Character_coins') as Element
          temp2.textContent =  addedPlayer.coins;
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

      //remove character DOM Element when they leave
      onChildRemoved(allPlayersRef, (snapshot) => {
        const removedKey = snapshot.val().id;
        const tempVar = playerElements[removedKey] as HTMLDivElement;
        gameContainer.value?.removeChild(tempVar);

        delete playerElements[removedKey];
      });

      onChildAdded(allCoinsRef, (snapshot) => {
        console.log("SNAPSHOT", snapshot.val())
        const coin = snapshot.val();
        const key: string = getKeyString(coin.x, coin.y);
        coins[key] = true;

        //create the Coin DOM Element
        const coinElement = document.createElement('div');
        coinElement.classList.add('Coin', 'grid-cell');
        coinElement.innerHTML = `
        <div class="Coin_shadow grid-cell"></div>
        <div class="Coin_sprite grid-cell"></div>
        `;
        //Position the Element
        const top = 16 * coin.y - 4 + 'px';
        const left = 16 * coin.x + 'px';
        coinElement.style.transform = `translate3d(${left}, ${top}, 0)`;
        //Keep a reference for removal later and add to DOM
        coinElements[key] = coinElement;
        gameContainer.value?.appendChild(coinElement);
      });

      onChildRemoved(allCoinsRef, (snapshot) => {
        const { x, y } = snapshot.val();
        const keyToRemove = getKeyString(x, y);
        gameContainer.value?.removeChild(coinElements[keyToRemove]);
        delete coinElements[keyToRemove];
      });

      //Place the first coin
      placeCoin();    
      
    };

    //*****Key Events */

    const handleArrowPress = (xChange: number, yChange: number) => {
      const newX = players[playerId].x + xChange;
      const newY = players[playerId].y + yChange;

      if (!isSolid(newX, newY)) {
        //move next space
        players[playerId].x = newX;
        players[playerId].y = newY;
        if (xChange === 1) {
          players[playerId].direction = 'right';
        }
        if (xChange === -1) {
          players[playerId].direction = 'left';
        }
        if (playerRef) {
          set(playerRef, players[playerId]);
          attemptGrabCoin(newX, newY);
        }
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

        const name = createName();
        playerNameInput.value = name;

        const { x, y } = getRandomSafeSpot();

        playerRef = storageRef(db, 'players/' + playerId);
        get(child(playerRef, 'lobbyId')).then((snapshot) => {
          if (snapshot.exists()) {
            console.log(snapshot.val());
            lobbyId.value = snapshot.val();
          } else {
            console.log("No data available");
          }
        }).catch((error) => {
          console.error(error);
        });

        update(playerRef, {
          direction: 'right',
          color: randomFromArray(playerColors),
          x,
          y,
          coins: 0,
        });

        //remove Player from Firebase, whem disconnect
        console.log("!!!!!!!!!!!!!!!!!!!!",playerRef)
        onDisconnect(playerRef).remove();
      } else {
        // User is signed out
        // ...
      }
    });

    //*****helper Functions*****
    const randomFromArray = (array: string[] | number[] | Coordinates[]): string | number | Coordinates => {
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

    const getKeyString = (x: number, y: number): string => {
      return `${x}x${y}`;
    };
    //blocked spaces
    const mapData: MapData = {
      minX: 1,
      maxX: 14,
      minY: 4,
      maxY: 12,
      blockedSpaces: {
        '7x4': true,
        '1x11': true,
        '12x10': true,
        '4x7': true,
        '5x7': true,
        '6x7': true,
        '8x6': true,
        '9x6': true,
        '10x6': true,
        '7x9': true,
        '8x9': true,
        '9x9': true,
      },
    };
    //returns true, if space is blocked
    const isSolid = (x: number, y: number) => {
      const blockedNextSpace = mapData.blockedSpaces[getKeyString(x, y)];
      if (
        blockedNextSpace ||
        x >= mapData.maxX ||
        x < mapData.minX ||
        y >= mapData.maxY ||
        y < mapData.minY
      ) {
        return true;
      } else {
        return false;
      }
    };
    //returns a randome StartSpot
    function getRandomSafeSpot():Coordinates {
      //We don't look things up by key here, so just return an x/y
      const temp = randomFromArray([
        { x: 1, y: 4 },
        { x: 2, y: 4 },
        { x: 1, y: 5 },
        { x: 2, y: 6 },
        { x: 2, y: 8 },
        { x: 2, y: 9 },
        { x: 4, y: 8 },
        { x: 5, y: 5 },
        { x: 5, y: 8 },
        { x: 5, y: 10 },
        { x: 5, y: 11 },
        { x: 11, y: 7 },
        { x: 12, y: 7 },
        { x: 13, y: 7 },
        { x: 13, y: 6 },
        { x: 13, y: 8 },
        { x: 7, y: 6 },
        { x: 7, y: 7 },
        { x: 7, y: 8 },
        { x: 8, y: 8 },
        { x: 10, y: 8 },
        { x: 8, y: 8 },
        { x: 11, y: 4 },
      ]);      
      return temp as Coordinates
    }

    return { gameContainer, playerNameInput, changeColor };
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
