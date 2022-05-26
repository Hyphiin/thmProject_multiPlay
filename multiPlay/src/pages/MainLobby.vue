<template>
  <q-page class="row items-center justify-evenly">
    <LobbyCard />
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LobbyCard from '../components/LobbyCard.vue'

export default defineComponent({
  name: 'MainLobby',
  components: {},
  setup() {
    return {
      LobbyCard
    };
  },
});
</script>
