<template>
  <div class="wrap">
    <pre>
      ╔═══════════════════════════════════════════════════════════╗
      ║                                                           ║
      ║                                                           ║
      ║                                                           ║
      ║                                                           ║
      ║                                                           ║
      ║                                                           ║
      ║                                                           ║
      ╚═══════════════════════════════════════════════════════════╝
    </pre>
    <div class="content">
      Enter HASH of your platform, please :
      <div class="field">
        <pre>░░░░░░░</pre>
        <div class="stars">{{stars}}<span class="cursor">▐</span></div>

      </div>
      <input
          v-model="pass"
          :maxlength="4"
          v-on:keyup.enter="submit"
          @blur="setFocus"
          ref="hash"
          type="text"
          class="hide">
    </div>
  </div>
</template>

<script>
  import store from '../store';

  export default {
    name: "auth",
    data: () => ({
      pass: '',
      stars: ''
    }),
    watch: {
      pass() {
        this.stars = this.pass.split('').reduce(acc => acc += '*', '');
      },
    },
    created() {
      fetch(`${window.location.origin}/config.json`)
        .then(res => res.json())
        .then(config => {
          console.log('TEST: ', config);
          store.config = config
        });
    },
    mounted() {
      this.setFocus();
    },
    methods: {
      setFocus() {
        this.$refs['hash'].focus();
      },
      submit() {
        console.log('submit')
      }
    }
  }
</script>

<style lang="scss" scoped>
  .wrap {
    position: relative;
    width: 500px;
    margin-left: auto;
    margin-right: auto;
    margin-top: 100px;
    .content {
      position: absolute;
      left: 60px;
      top: 30px;
      height: 40px;
      font-size: 22px;
    }
  }
  .field {
    position: relative;
    .stars {
      position: absolute;
      left: 4px;
      top: -2px;
    }
    .cursor {
      position: relative;
      left: -11px;
      animation-name: cursor;
      animation-duration: 1s;
      animation-iteration-count: infinite;
    }
  }
  .hide {
    //display: none;
    opacity: 0;
    height: 0;
    width: 0;
  }
  @keyframes cursor {
    0%   {opacity: 1;}
    100%  {opacity: 0;}
  }
</style>
