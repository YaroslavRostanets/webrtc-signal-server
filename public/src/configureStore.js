import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    isConnect: false,
    config: {},
    error: null
  },
  mutations: {
    setConfig(state, config) {
      state.config = config;
    },
    setAuth(state) {
      state.isConnect = true;
    }
  }
});

export default store
