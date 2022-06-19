<template>
  <q-page class="items-center justify-evenly">
    <q-btn class="new-game-btn" @click="openDialog = true">Create Game</q-btn>
    <div class="lobby-div">
      <div class="lobby-card" v-for="lobby in allLobbysArray" :key="lobby.lobbyId">
        <lobby-card 
        :playerId="lobby.playerId"
        :lobbyId="lobby.lobbyId"
        :lobbyName="lobby.lobbyName"
        :gamemode="lobby.gamemode" 
        :isPrivate="lobby.isPrivate"
        @deleteLobby="deleteLobby"
        @joinGame="joinGame"
        />    
      </div>
    </div>
    <q-dialog v-model="openDialog">
      <q-card>
        <q-card-section class="row items-center">          
          <q-form class="q-gutter-md">
            <q-input
              filled
              v-model="lobbyName"
              label="Name of the Lobby"
              lazy-rules
              :rules="[ val => val && val.length > 0 || 'Please type something']"
            />
            <q-select v-model="gamemode" :options="gamesList" label="Standard" />
            <q-toggle v-model="closedLobby" label="Make it a private Lobby" />           
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Create Game" color="primary" v-close-popup @click="createNewLobby"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { LobbyInterface } from 'src/components/LobbyInterface';
import { defineComponent, ref } from 'vue';
import LobbyCard from '../components/LobbyCard.vue'
import {
  DatabaseReference,
  getDatabase,
  onChildAdded,
  onDisconnect,
  ref as storageRef,
  remove,
set,
update,
} from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router';


export default defineComponent({
  name: 'MainLobby',
  components: { LobbyCard },
  setup() {
    const router = useRouter();

    const openDialog = ref<boolean>(false)    
    let tempId = 1;

    const db = getDatabase();

    let playerId = ref<string>('');
    let playerRef: DatabaseReference;

    let lobbyId = playerId.value + tempId;
    let allLobbysRef: DatabaseReference;
    const allLobbysArray = ref<LobbyInterface[]>([])

    const lobbyName = ref<string>('')
    const gamemode = ref<string>('CoinGame')
    const gamesList = ref<string[]>(['CoinGame', 'AnotherGame'])
    const closedLobby = ref<boolean>(false)

    const createNewLobby = () => {
      allLobbysRef = storageRef(db, 'lobbys/' + playerId.value + tempId);
      set(allLobbysRef, {
        id: playerId.value + tempId,
        playerId: playerId.value,
        lobbyName: lobbyName.value,
        gamemode: gamemode.value,
        isPrivate: closedLobby.value        
      });
      const allPlayers = storageRef(db, `lobbys/${playerId.value + tempId}/players/${playerId.value}`);
      set(allPlayers, {
        id: playerId.value,          
      });

      update(playerRef, {
        lobbyId: playerId.value + tempId       
      });
      
      tempId ++       
    }    

    onChildAdded(storageRef(db, 'lobbys/'), (snapshot) => {
      console.log(snapshot.val())
      const addedLobby = snapshot.val();
      allLobbysArray.value.push(new LobbyInterface(addedLobby.id,addedLobby.lobbyName,addedLobby.playerId,addedLobby.gamemode,addedLobby.isPrivate))
    })

    const deleteLobby = (deleteId: string) => {       
      allLobbysArray.value.forEach((element,idx) =>{
        if(element.lobbyId === deleteId){
          allLobbysArray.value.splice(idx,1)          
        }
      })     
      console.log(deleteId)
      remove(storageRef(db, `lobbys/${deleteId}`));
    }     

    const joinGame = (lobbyId: string) => {
      console.log('Lobby to join:', lobbyId) 
      router.replace({ name: 'CoinGame' });     
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
      console.log('TEST')
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        playerId.value = user.uid;

        const name = 'Dulli';

        playerRef = storageRef(db, 'players/' + playerId.value);
        set(playerRef, {
          id: playerId.value,
          name: name,          
        });

        //remove Player from Firebase, whem disconnect
        onDisconnect(playerRef).remove();       
      } else {
        // User is signed out
        // ...
      }
    });     
    //********************
   

    return {
      LobbyCard,
      allLobbysArray,
      playerId,
      lobbyId,
      lobbyName,
      gamemode,
      gamesList,
      closedLobby,
      createNewLobby,
      deleteLobby,
      joinGame,
      openDialog
    };
  },
});
</script>

<style lang="scss" scoped>

.new-game-btn{
  background-color: rgb(241, 157, 0);
  color: white;
}
.lobby-div{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
</style>
