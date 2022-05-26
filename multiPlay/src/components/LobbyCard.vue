<template>
   <q-card class="my-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Our Changing Planet</div>
        <div class="text-subtitle2">by John Doe</div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat>Action 1</q-btn>
        <q-btn flat>Action 2</q-btn>
      </q-card-actions>
    </q-card>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LobbyCard',

  components: {},

  setup() {
    return {};
  },
});
</script>

<style>

</style>