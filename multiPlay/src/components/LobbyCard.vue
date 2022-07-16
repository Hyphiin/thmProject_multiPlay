<template>
  <q-card class="my-card">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">{{lobbyName}}</div>
      <div class="subtitles">
        <div class="text-subtitle">GAME: {{gamemode}}</div>
        <div class="text-subtitle">by {{playerId}}</div>
        <div class="text-subtitle">Private: {{isPrivate}}</div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions class="buttons">
      <q-btn flat :disable="isFull" @click="$emit('joinGame', lobbyId) ">Join Game</q-btn>
      <q-btn flat icon="delete" @click="$emit('deleteLobby', lobbyId)" />
    </q-card-actions>
  </q-card>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LobbyCard',
  components: {},
  props:{
    gamemode:{
      type: String,
      required: true
    },
    playerId:{
      type: String,
      required: true
    },
    lobbyName:{
      type: String,
      required: true
    },
    lobbyId:{
      type: String,
      required: true
    },
    currentPlayers:{
      type: Number,
      default: 1
    },
    isPrivate:{
      type: Boolean,
      required: true
    },
    isFull:{
      type: Boolean,
      default: false
    }
  },
  setup() {
    return {
    };
  },
});
</script>

<style lang="scss" scoped>
.my-card{
  width: 200px;
  margin: 20px;

  .subtitles{
    display:flex;
    flex-direction: column;
    justify-content: space-between;
    .text-subtitle{
      margin-top: 3px;
    }
  }

  .buttons{
    display: flex;
    justify-content: space-between;
  }
}
</style>
