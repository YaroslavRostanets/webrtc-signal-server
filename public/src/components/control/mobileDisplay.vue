<template>
  <div>
    <div class="power-container stick-container">
      <vue-slider
          :height="180"
          :direction="'btt'"
          class="power-slider stick"
          v-model="value" />
    </div>
    <div class="video-wrap" :style="{height: height + 'px'}">
      <video ref="video"></video>
    </div>

  </div>
</template>

<script>
  import VueSlider from 'vue-slider-component'
  import 'vue-slider-component/theme/antd.css'

  export default {
    name: "mobileDisplay",
    props: ['se'],
    data() {
      return {
        power: 0
      }
    },
    computed: {
      width() {
        return window.innerWidth;
      },
      height() {
        return window.innerHeight;
      }
    },
    components: {
      VueSlider
    }
  }
</script>

<style lang="scss" scoped>
  .video-wrap {
    border: 1px solid #00F601;
    margin: 0 auto;
    display: block;
    position: relative;
    width: 480px;
    video {
      height: 100%;
      width: 100%;
      position: static;
      display: block;
      background: gray;
    }
    &:before {
    }
  }
  .stick {
    height: 180px;
    background: rgba(0, 246, 1, 0.5);
    margin: 10px auto;
    border-top: 4px solid rgba(0, 246, 1, 0.5);
  }
  .power-container {
    left: 5%;
    z-index: 1;
  }
  .stick-container {
    position: absolute;
    top: 50%;
    border: 2px solid #00F601;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    margin-top: -100px;
  }
  .vue-slider-dot {
    width: 45px;
    height: 45px;
  }
</style>


