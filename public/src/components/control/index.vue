<template>
  <display :se="se" v-if="isConnect"></display>
  <auth v-else @submit="connect"></auth>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import SignalEmitter from '../../SignalEmitter';
  import RTC from '../../RTC';
  import auth from './auth';
  import display from './display';
  import store from '../../configureStore';

  export default {
    name: "control",
    store: store,
    components: {
      auth,
      display
    },
    computed: mapState(['config', 'isConnect']),
    methods: {
      ...mapMutations(['setAuth']),
      connect(id) {
        this.SE = new SignalEmitter({
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
