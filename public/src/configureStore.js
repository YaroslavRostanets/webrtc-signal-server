import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    isConnect: true,
    config: {},
    error: null,
    fetching: false
  },
  mutations: {
    setConfig(state, config) {
      state.config = config;
    },
    setAuth(state, value) {
      state.isConnect = value;
    },
    setFetching(state, value) {
      state.fetching = value;
    }
  }
});

export default store
