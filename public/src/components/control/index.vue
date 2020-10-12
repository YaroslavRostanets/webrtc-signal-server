<template>
  <div>
    <div v-if="isConnect">
      <mobile-display :se="se" v-if="detectMob"></mobile-display>
      <display :se="se" v-else></display>
    </div>
    <auth v-else @submit="connect"></auth>

    <div v-if="fetching" class="fetching">LOADING...</div>
  </div>
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
      ...mapState(['config', 'isConnect', 'fetching']),
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
      ...mapMutations(['setAuth', 'setFetching']),
      connect(id) {
        this.setFetching(true);
        this.se = new SignalEmitter({
          id: id,
          isControl: true,
          signalServer: this.config.signalServer,
        });

        this.se.connection.onopen = () => {
          store.commit('setAuth', true);
          this.setFetching(false);
        };
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

<style lang="scss" scoped>
  .fetching {
    position: fixed;
    z-index: 1;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
