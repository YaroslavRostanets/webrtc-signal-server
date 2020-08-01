<template>
  <div v-if="isConnect">
    <mobile-display :se="se" v-if="detectMob"></mobile-display>
    <display :se="se" v-else></display>
  </div>
  <auth v-else @submit="connect"></auth>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import SignalEmitter from '../../SignalEmitter';
  import RTC from '../../RTC';
  import auth from './auth';
  import display from './display';
  import mobileDisplay from "./mobileDisplay";
  import store from '../../configureStore';

  export default {
    name: "control",
    store: store,
    components: {
      auth,
      display,
      mobileDisplay
    },
    computed: {
      ...mapState(['config', 'isConnect']),
      detectMob() {
        const toMatch = [
          /Android/i,
          /webOS/i,
          /iPhone/i,
          /iPad/i,
          /iPod/i,
          /BlackBerry/i,
          /Windows Phone/i
        ];

        return toMatch.some((toMatchItem) => {
          return navigator.userAgent.match(toMatchItem);
        });
      }
    },
    methods: {
      ...mapMutations(['setAuth']),
      connect(id) {
        this.se = new SignalEmitter({
          id: id,
          isControl: true,
          signalServer: this.config.signalServer,
        });

        this.se.connection.onopen = () => store.commit('setAuth', true);
      },
    },
    created() {
      fetch(`${window.location.origin}/config.json`)
        .then(res => res.json())
        .then(config => {
          console.log('CONFIG: ', config);
          store.commit('setConfig', config);
        });
    },
  }
</script>

<style scoped>

</style>
