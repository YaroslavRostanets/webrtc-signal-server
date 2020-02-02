<template>
  <auth @submit="connect"></auth>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import RTC from '../../RTC';
  import auth from './auth';
  import store from '../../configureStore';

  export default {
    name: "control",
    store: store,
    components: {
      auth
    },
    computed: mapState(['config', 'isConnect']),
    methods: {
      ...mapMutations(['setAuth']),
      connect(id) {
        this.webrtc = new RTC({
          isControl: true,
          signalServer: this.config.signalServer,
          id: id
        });

        this.webrtc.SE.connection.onopen = () => {}
      },
    },
    created() {
      console.log('la-');
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
