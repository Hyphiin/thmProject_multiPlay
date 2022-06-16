<template>
  <q-page class="items-center justify-evenly">
    <q-btn class="new-game-btn" @click="createNewLobby">Create Game</q-btn>
    <div class="lobby-div">
      <div class="lobby-card" v-for="lobby in lobbys" :key="lobby.lobbyId">
        <lobby-card 
        :playerId="playerId"
        :lobbyId="lobbyId"
        :gamemode="gamemode" 
        :currentPlayers="lobby.currentPlayers" 
        @deleteLobby="deleteLobby"
        @joinGame="joinGame"
        />    
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { LobbyInterface } from 'src/components/LobbyInterface';
import { defineComponent, ref } from 'vue';
import LobbyCard from '../components/LobbyCard.vue'
import {
  DatabaseReference,
  getDatabase,
  onDisconnect,
  push,
  ref as storageRef,
set,
update,
} from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import routes from 'src/router/routes';
import { useRouter } from 'vue-router';


export default defineComponent({
  name: 'MainLobby',
  components: { LobbyCard },
  setup() {
    // onMounted(() => {
    //   initGame();
    // }); 
    const router = useRouter();
    
    const lobbys = ref<LobbyInterface[]>([])
    let tempId = 1;

    const db = getDatabase();
    let playerId = ref<string>('');
    let playerRef: DatabaseReference;

    let lobbyId = playerId.value + tempId;
    let lobbyRef: DatabaseReference;

    const gamemode = 'Coin-Game'
   

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


    const createNewLobby = () => {
      lobbyRef = storageRef(db, 'lobbys/' + playerId.value + tempId);
      set(lobbyRef, {
        id: playerId.value + tempId,
        playerId: playerId.value          
      });
      update(playerRef, {
          lobbyId: playerId.value + tempId       
        });

      lobbys.value.push(new LobbyInterface(tempId.toString(),tempId,'CoinGame',1))
      tempId ++ 
    }    

    const deleteLobby = (deleteId: number) => {       
      lobbys.value.forEach((element,idx) =>{
        if(element.lobbyId === deleteId){
          lobbys.value.splice(idx,1)          
        }
      })     
    }

    const joinGame = () => {
      console.log('MOIN') 
      router.replace({ name: 'CoinGame' });     
    }

    return {
      LobbyCard,
      lobbys,
      playerId,
      lobbyId,
      gamemode,
      createNewLobby,
      deleteLobby,
      joinGame
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
