<template>
  <v-card
    class="mx-auto"
    max-width="344"
  >
  <v-img
    :src="imageData"></v-img>
    <img [src]="imageData" class="img-thumbnail">
  <v-card-title>
      QR Code
    </v-card-title>
    <v-card-actions>
      <v-btn
        @click="readQRCode"
      > lire</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { sendMailToBackForQrCode, searchRQCode } from '../services/DashboardService'
export default {
  name: 'Dashboard_QRCode',
  data: () => ({
    qrCode: null,
    imageData: null
  }),
  async mounted (){
    this.qrCode = await sendMailToBackForQrCode()
    console.log("a")
  },
  methods: {
    async readQRCode() {
      console.log("qrcode",this.qrCode)
      const reponse = await searchRQCode(this.qrCode)
      console.log("reponse readQRCode",reponse)

      const rawResponse = reponse.data
      const b64Response = btoa(this.toBinary(rawResponse));
      console.log("b64Response", b64Response)
      this.imageData = 'data:image/png;base64,' + b64Response;
      console.log("imageData", this.imageData)
    },
    toBinary(string) {
      const codeUnits = new Uint16Array(string.length);
      for (let i = 0; i < codeUnits.length; i++) {
        codeUnits[i] = string.charCodeAt(i);
      }
      return String.fromCharCode(...new Uint8Array(codeUnits.buffer));
    }
  }
}
</script>

<style>

</style>