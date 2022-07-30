<template>
  <q-card class="my-card">
    <q-card-section class="bg-primary text-white">
      <q-icon name="sports_esports" style="font-size: 4.5em" />
      <q-btn class="new-game-btn" color="secondary" @click="$emit('createGame')">
        Create Game</q-btn>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LobbyCard',
  components: {},
  props: {},
  setup() {
    return {
    };
  },
});
</script>

<style lang="scss" scoped>
.my-card {
  width: 170px;
  height: 180px;
  margin: 20px;

  .q-card__section{
    display: flex;
    flex-direction: column;
    height: 180px;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }

}
</style>
