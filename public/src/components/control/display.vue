<template>
  <div v-else class="container">
    <video width="800" ref="video"></video>
    <div class="flex">
      <div class="col">
        <button @click="connect">CONNECT</button>
        <table>
          <tr><td>power: </td><td>{{power}}%</td></tr>
          <tr><td>left cat: </td><td>{{leftCat}}</td></tr>
          <tr><td>right cat: </td><td>{{rightCat}}</td></tr>
        </table>
      </div>
      <div class="col">
        <div @mousemove="mouseMove" ref="balance" class="balance"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import RTC from '../../RTC';

  export default {
    name: "display",
    props: ['se'],
    methods: {
      connect() {
        this.webrtc.createOffer();
      },
      powerChange(event) {
        const delta = Math.floor(event.deltaY/100);
        let power = this.power;
        if (delta > 0) {
          power -= 5;
        } else {
          power += 5;
        }
        this.power = (power <= 100 && power >= 0) ? power : this.power;
      },
      mouseMove(e) {
        const x = e.layerX || e.offsetX;
        const half = this.balanceWidth / 2;
        if (x >= half) {
          this.leftCat = 1;
          this.rightCat = floor((this.balanceWidth - x) / (half / 100) / 100);
        } else {
          this.rightCat = 1;
          this.leftCat = floor(x / (half / 100) / 100);
        }
      },
      run() {
        setInterval(() => {
          const power = this.power * 0.01;
          const direction = this.forward || this.back;
          const left = floor(this.leftCat * direction * power);
          const right = floor(this.rightCat * direction * power);
          this.channel.send(JSON.stringify([left, right]));
        }, 100);
      }
    },
    data: () => ({
      video: false,
      power: 0,
      leftCat: 0,
      rightCat: 0,
      forward: 0,
      back: 0,
      channel: null
    }),
    watch: {
      channel: function () {
        if (this.channel) {
          this.run();
        }
      }
    },
    created() {
      console.log(window.webrtc);
      this.webrtc = new RTC({isControl: true}, this.se, srcObject => {
        this.video = true;
        this.$refs.video.srcObject = srcObject;
        this.$refs.video.play();
      }, dataChannel => this.channel = dataChannel);
      document.querySelector('body').addEventListener("wheel", this.powerChange);
      document.addEventListener("keyup", event => {
        if (event.isComposing || event.keyCode === 229) {
          return;
        }

        if (event.keyCode === 87) this.forward = 0;
        if (event.keyCode === 83) this.back = 0;
      });
      document.addEventListener("keydown", event => {
        if (event.isComposing || event.keyCode === 229) {
          return;
        }
        if (event.keyCode === 87) this.forward = 1;
        if (event.keyCode === 83) this.back = -1;
        //console.log(event);
      });
    },
    mounted() {
      this.balanceWidth = this.$refs.balance.offsetWidth;
    }
  }
</script>

<style scoped>

</style>
