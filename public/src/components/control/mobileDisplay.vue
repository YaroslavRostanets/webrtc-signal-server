<template>
  <div>
    <switches class="transmission" v-model="drive" :text-disabled="'R'" :text-enabled="'D'"></switches>
    <div class="appliances">
      <div>POWER: {{power + '%'}}</div>
      <div>SELECTED GEAR: {{drive ? 'D' : 'R'}}</div>
      <button @click="connect">CONNECT</button>
    </div>
    <div class="power-container stick-container">
      <vue-slider
          :height="180"
          :width="16"
          :direction="'btt'"
          :dotSize="45"
          class="power-slider stick"
          v-model="power" />
    </div>
    <div class="video-wrap" :style="{height: height + 'px'}">
      <video ref="video" :height="height"></video>
    </div>
    <div class="direction-container stick-container">
      <i class="arrow right"></i>
      <i class="arrow left"></i>
      <vue-slider
          @drag-end="dragEnd"
          @dragging="dragging"
          :clickable="false"
          :tooltip="'none'"
          :min="-1"
          :max="1"
          :interval="0.01"
          :duration="0.15"
          :width="180"
          :dotSize="45"
          class="direction-slider stick"
          v-model="direction" />
    </div>
  </div>
</template>

<script>
  import Switches from 'vue-switches';
  import VueSlider from 'vue-slider-component';
  import 'vue-slider-component/theme/antd.css';
  import '../../assets/thema.scss';
  import RTC from "../../RTC";

  const floor = num => Math.floor(num * 100) / 100;

  export default {
    name: "mobileDisplay",
    props: ['se'],
    data() {
      return {
        power: 0,
        direction: 0,
        drive: true,
        left: 0,
        right: 0,
        channel: null
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
    methods: {
      dragEnd(index) {
        this.direction = 0;
      },
      dragging(value) {

      },
      connect() {
        this.webrtc.createOffer();
      },
      run() {
        setInterval(() => {
          const power = this.power * 0.01;
          const direction = this.drive ? 1 : -1;
          const left = floor(this.left * direction * power);
          const right = floor(this.right * direction * power);
          this.channel.send(JSON.stringify([left, right]));
        }, 200);
      }
    },
    watch: {
      channel() {
        if (this.channel) {
          this.run();
        }
      },
      direction(value) {
        if(value > 0) {
          this.left = 1;
          this.right = floor(1 - value);
        } else if (value < 0) {
          this.right= 1;
          this.left = floor(1 + value);
        } else {
          this.left = 1;
          this.right = 1;
        }
      }
    },
    created() {
      this.webrtc = new RTC({isControl: true}, this.se, srcObject => {
        this.video = true;
        this.$refs.video.srcObject = srcObject;
        this.$refs.video.play();
      }, dataChannel => this.channel = dataChannel);
    },
    components: {
      VueSlider,
      Switches
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
  .transmission {
    position: absolute;
    left: 15px;
    top: 15px;
    > div{
      height: 35px;
      width: 56px;
      &:after {
        height: 32px;
        width: 32px;
      }
    }
  }

  .power-container {
    left: 5%;
    z-index: 1;
  }
  .direction-container {
    right: 5%;
    display: flex;
    align-items: center;
    justify-content: center;
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
  .power-slider {
    margin: 10px auto;
  }
  .appliances {
    position: absolute;
    right: 10px;
    top: 5px;
    font-size: 25px;
  }
  button {
    font-size: 24px;
    margin-top: 6px;
  }
</style>



