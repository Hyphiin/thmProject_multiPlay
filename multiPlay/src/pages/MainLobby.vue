<template>
  <q-page class="items-center justify-evenly">
    <div class="lobby-container">
      <div class="lobby-div">
        <div class="lobby-card" v-for="lobby in allLobbysArray" :key="lobby.lobbyId">
          <lobby-card :playerId="lobby.playerId" :lobbyId="lobby.lobbyId" :lobbyName="lobby.lobbyName"
            :gamemode="lobby.gamemode" :isPrivate="lobby.isPrivate" :isFull="lobby.isFull" :currentPlayers="lobby.currentPlayers" @deleteLobby="deleteLobby"
            @joinGame="joinGame" />
        </div>
        <add-game-card @createGame="openDialog = true" />
      </div>
      <div class="helperText">Can't find your Lobby? Try to reload!</div>
    </div>

    <q-dialog v-model="openDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-form class="q-gutter-md">
            <q-input filled lazy-rules v-model="lobbyName" label="Name of the Lobby" :error="errorMode"
              error-message="You need a name for your Lobby!"
              :rules="[ val => val && val.length > 0 || 'Please type something']" />
            <q-select v-model="gamemode" :options="gamesList" label="Gamemode" />
            <q-toggle v-model="closedLobby" color="secondary" label="Make it a private Lobby" />
            <q-input v-if="closedLobby" :error="lobbyPassword === '' ? true : false"
              error-message="Please choose a Password" type="password" filled v-model="lobbyPassword" label="Password"
              lazy-rules :rules="[ val => val && val.length >= 0 || 'Please type something']" />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn outline label="Cancel" color="primary" v-close-popup />
          <q-btn label="Create Game" color="primary" :disable="errorMode || (lobbyPassword === '' && closedLobby === true)"
            v-close-popup @click="createNewLobby" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="openPWDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-form class="q-gutter-md">
            <q-input type="password" :error="wrongPassword" error-message="Thats the wrong Password!" filled
              v-model="typedPassword" label="Password of the Lobby" lazy-rules
              :rules="[ val => val && val.length > 0 || 'Please type something']" />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn outline label="Cancel" color="primary" v-close-popup />
          <q-btn label="Join Game" color="primary" :disable="wrongPassword" v-close-popup @click="checkPassword" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { LobbyInterface } from 'src/components/LobbyInterface';
import { computed, defineComponent, ref } from 'vue';
import LobbyCard from '../components/LobbyCard.vue'
import AddGameCard from '../components/addGameCard.vue'
import {
  DatabaseReference,
  getDatabase,
  onChildAdded,
  onChildRemoved,
  onDisconnect,
  onValue,
  ref as storageRef,
  remove,
set,
update,
} from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router';


export default defineComponent({
  name: 'MainLobby',
  components: { LobbyCard, AddGameCard },
  setup() {
    const router = useRouter();

    const openDialog = ref<boolean>(false)
    let tempId = 'Lobby';

    const db = getDatabase();

    let playerId = ref<string>('');
    let playerRef: DatabaseReference;

    let lobbyId = playerId.value + tempId;
    let allLobbysRef: DatabaseReference;
    const allLobbysArray = ref<LobbyInterface[]>([])

    const lobbyName = ref<string>('My awesome Lobby')
    const lobbyPassword = ref<string>('')
    const gamemode = ref<string>('TicTacToe')
    const gamesList = ref<string[]>(['TicTacToe', 'ConnectFour', 'CoinGame', 'Breakthrough'])
    const closedLobby = ref<boolean>(false)
    const errorMode = computed(() =>{
      let tempBool = false
      if(lobbyName.value === ''){
        tempBool = true
      } else {
        tempBool = false
      }
      return tempBool
    })

    const createNewLobby = () => {
      if(lobbyName.value !== ''){
        allLobbysRef = storageRef(db, 'lobbys/' + playerId.value + tempId);
        set(allLobbysRef, {
          id: playerId.value + tempId,
          playerId: playerId.value,
          lobbyName: lobbyName.value,
          gamemode: gamemode.value,
          isPrivate: closedLobby.value,
          password: lobbyPassword.value,
          currentPlayers: 1
        });
        const allPlayers = storageRef(db, `lobbys/${playerId.value + tempId}/players/${playerId.value}`);
        set(allPlayers, {
          id: playerId.value,
        });

        update(playerRef, {
          lobbyId: playerId.value + tempId
        });

        router.push({ name: gamemode.value, params: { lobbyId: playerId.value + tempId  }})
      } else {
        openDialog.value = true
      }

    }

    onChildAdded(storageRef(db, 'lobbys/'), (snapshot) => {
      const addedLobby = snapshot.val();
      if(addedLobby.id === undefined){
        const currLobbyRef = storageRef(db, `lobbys/${snapshot.key}`);
        remove(currLobbyRef);
      } else {
        let isFull = false;

        if (addedLobby.currentPlayers >= 2 && addedLobby.gamemode !== 'CoinGame') {
          isFull = true
        } else if (addedLobby.currentPlayers >= 5 && addedLobby.gamemode === 'CoinGame') {
          isFull = true
        }
        allLobbysArray.value.push(new LobbyInterface(addedLobby.id, addedLobby.lobbyName, addedLobby.playerId, addedLobby.gamemode, addedLobby.currentPlayers, addedLobby.isPrivate, isFull, addedLobby.password))
      }
    })

    onChildRemoved(storageRef(db, 'lobbys/'), (snapshot) => {
      const removedLobby = snapshot.val();
      allLobbysArray.value.forEach((element,idx) =>{
        if(element.lobbyId === removedLobby.id){
          allLobbysArray.value.splice(idx,1)
        }
      })
    })

    onValue(storageRef(db, 'lobbys/'), (snapshot) => {
      let allLobbys: object = snapshot.val()
        Object.values(allLobbys).forEach(lobby => {
          if (lobby.id !== undefined && lobby.id !== null && lobby.id !== ''){
            let currPlayers = Object.keys(lobby.players).length
            const lobbyRef = storageRef(db, `lobbys/${lobby.id}`);
            update(lobbyRef, {
              currentPlayers: currPlayers
            });

            allLobbysArray.value.forEach(lobbyArray => {
              if (lobbyArray.lobbyId === lobby.id) {
                lobbyArray.currentPlayers = currPlayers
                if (lobbyArray.currentPlayers >= 2 && lobbyArray.gamemode !== 'CoinGame') {
                  lobbyArray.isFull = true
                } else if (lobbyArray.currentPlayers >= 5 && lobbyArray.gamemode === 'CoinGame') {
                  lobbyArray.isFull = true
                }
              }
            })
          }
        })
    })

    const deleteLobby = (deleteId: string) => {
      allLobbysArray.value.forEach((element,idx) =>{
        if(element.lobbyId === deleteId){
          if(element.playerId === playerId.value) {
            allLobbysArray.value.splice(idx,1)
            remove(storageRef(db, `lobbys/${deleteId}`));
          }
        }
      })
    }

    const joinGame = (lobbyId: string) => {
      const playersRef = storageRef(db, `lobbys/${lobbyId}/players/${playerId.value}`);
      set(playersRef, {
        id: playerId.value,
      });

      // router.replace({ name: 'CoinGame' });
      let goToLobby = true;
      allLobbysArray.value.forEach(lobby => {
        if(lobby.lobbyId === lobbyId){
          gamemode.value = lobby.gamemode
          if(lobby.password !== ''){
            openPWDialog.value = true;
            lobbyToJoin.value = lobby.lobbyId
            goToLobby = false
          }
        }
      })
      if (goToLobby){
        router.push({ name: gamemode.value, params: { lobbyId: lobbyId }})
      }
    }

    const openPWDialog = ref<boolean>(false)
    const typedPassword = ref<string>('');
    const lobbyToJoin = ref<string>('');
    const wrongPassword = computed (() => {
      let tempBool = false
      allLobbysArray.value.forEach(lobby => {
        if (lobby.lobbyId === lobbyToJoin.value) {
          if (lobby.password === typedPassword.value) {
            tempBool = false
          } else {
            tempBool = true
          }
        }
      })
      return tempBool
    })

    const checkPassword = () =>{
      if (!wrongPassword.value) {
        allLobbysArray.value.forEach(lobby => {
          if (lobby.lobbyId === lobbyToJoin.value) {
            gamemode.value = lobby.gamemode
            openPWDialog.value = false
            router.push({ name: gamemode.value, params: { lobbyId: lobbyToJoin.value } })
          }
        })
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
        playerId.value = user.uid;

        playerRef = storageRef(db, 'players/' + playerId.value);
        set(playerRef, {
          id: playerId.value,
        });

        //remove Player from Firebase, when disconnect
        onDisconnect(playerRef).remove().then(() => {
          allLobbysArray.value.forEach(lobby => {
            if(lobby.playerId === playerId.value){
              const deleteId = lobby.lobbyId
              remove(storageRef(db, `lobbys/${deleteId}`));
            }
          })
        })

      } else {
        // User is signed out
        // ...
      }
    });
    //********************

    // "$uid": {
    //     	".delete": "auth != null && auth.uid == $uid",
    //   	},

    return {
      LobbyCard,
      allLobbysArray,
      playerId,
      lobbyId,
      lobbyName,
      lobbyPassword,
      gamemode,
      gamesList,
      closedLobby,
      createNewLobby,
      deleteLobby,
      joinGame,
      openDialog,
      openPWDialog,
      typedPassword,
      checkPassword,
      errorMode,
      wrongPassword
    };
  },
});
</script>

<style lang="scss" scoped>
.lobby-container{
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: inherit;
  .helperText {
    color: white;
    font-size: 20px;
    line-height: 28px;
    margin-bottom: 4px;
    margin: 20px;
  }
}
.lobby-div{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
}

///later
.player-info {
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
  border-color: #f2c268;
}


</style>

