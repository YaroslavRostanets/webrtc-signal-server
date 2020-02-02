import Vue from 'vue';
import Vuex from 'vuex';
import control from './components/control';
import platform from './components/platform';
import "babel-polyfill";

Vue.use(Vuex);
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
