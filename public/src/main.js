import Vue from 'vue';
import control from './components/control';
import platform from './components/platform';

Vue.config.productionTip = false;

new Vue({
  el: '#app',
  data: {
  },
  components: {
    control,
    platform
  }
});
