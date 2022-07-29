<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title> MultiPlay </q-toolbar-title>
        <q-btn class="goBackBtn" icon="directions" @click="goBack"></q-btn>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MainLayout',

  components: {},

  setup() {
    const goBack=()=>{
      console.log("BACK!")
    }
    return {
      goBack
    };
  },
});
</script>

<style>
.goBackBtn {
  background-color: rgb(241, 157, 0);
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  }
</style>
