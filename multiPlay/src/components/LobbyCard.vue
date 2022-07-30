<template>
  <q-card class="my-card">
    <q-card-section class="my-card-section bg-primary text-white">
      <div class="text-h6">{{lobbyName}}</div>
      <div class="subtitles">
        <div class="text-subtitle">GAME: {{gamemode}}</div>
        <!-- <div class="text-subtitle">by {{playerId}}</div> -->
        <div v-if="gamemode !== 'CoinGame'" class="current-players">
          <div class="text-subtitle"> {{ currentPlayers }} / 2</div>
          <q-icon name="people" color="secondary" size="sm"></q-icon>
        </div>
        <div v-else class="current-players">
          <div class="text-subtitle"> {{ currentPlayers }} / 5</div>
          <q-icon name="people" color="secondary" size="sm"></q-icon>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions class="buttons">
      <q-btn outline color="primary" :disable="isFull" @click="$emit('joinGame', lobbyId) ">Join Game</q-btn>
      <!-- <q-btn flat color="primary" icon="delete" @click="$emit('deleteLobby', lobbyId)" /> -->
      <q-icon v-if="isPrivate" name="lock" color="secondary" size="sm"></q-icon>
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
  min-height: 180px;
  margin: 20px;
  .my-card-section{
    min-height: 144px;

  }
    .subtitles {
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .text-subtitle {
        margin-top: 3px;
        margin-right: 8px;
      }

      .current-players {
        display: flex;
        flex-direction: row;
      }
    }

    .buttons {
      display: flex;
      justify-content: space-between;
    }
}
</style>
