<template>
  <q-page class="items-center justify-evenly">
    <q-btn class="new-game-btn" @click="createNewLobby">Create Game</q-btn>
    <div class="lobby-div">
      <div class="lobby-card" v-for="lobby in lobbys" :key="lobby.lobbyId">
        <lobby-card 
        :playerId="lobby.playerId"
        :lobbyId="lobby.lobbyId"
        :gamemode="lobby.gamemode" 
        :currentPlayers="lobby.currentPlayers" 
        @deleteLobby="deleteLobby"
        />    
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { LobbyInterface } from 'src/components/LobbyInterface';
import { defineComponent, ref } from 'vue';
import LobbyCard from '../components/LobbyCard.vue'


export default defineComponent({
  name: 'MainLobby',
  components: { LobbyCard },
  setup() {
    const lobbys = ref<LobbyInterface[]>([])
    let tempId = 1;

    const createNewLobby = () => {
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

    return {
      LobbyCard,
      lobbys,
      createNewLobby,
      deleteLobby
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
