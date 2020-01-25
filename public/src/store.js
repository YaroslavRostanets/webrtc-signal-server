
const CreateStore = function() {
  this.isAuth = false;
  Object.defineProperty(this, "config", { set: function (config) {
      this.config = config;
    }
  });
};

export default new CreateStore();
