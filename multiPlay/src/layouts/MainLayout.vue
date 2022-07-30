<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title> MultiPlay </q-toolbar-title>
        <!-- <q-btn v-if="!isStartPage" class="goBackBtn" icon="home" @click="goBack"></q-btn> -->
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { computed } from '@vue/reactivity';
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';


export default defineComponent({
  name: 'MainLayout',
  components: {},
  setup() {
    // const router = useRouter();

    // const isStartPage = computed(() =>{
    //   let tempBool = false
    //   if (router.currentRoute.value.name === 'MainLobby'){
    //     tempBool = true
    //   }
    //   return tempBool
    // })

    // const goBack=()=>{
    //   router.push({ name: 'MainLobby' })
    // }

    return {
      // goBack,
      // isStartPage
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
