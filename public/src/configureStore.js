
const store = new Vuex.Store({
  state: {
    isConnect: false,
    config: {

    }
  },
  mutations: {
    setConfig(state, config) {
      state.config = config;
    },
    
  }
});
