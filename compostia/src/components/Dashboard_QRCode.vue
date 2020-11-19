<template>
  <v-card>
  <v-img
    :src="imageData"
     max-height="100"
    max-width="100"></v-img>
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
    await this.readQRCode()
  },
  methods: {
    async readQRCode() {
      const reponse = await searchRQCode(this.qrCode)
      console.log("qrCode1", this.qrCode)
      console.log("qrCode2", reponse)
      this.imageData = 'https://api.qrserver.com/v1/create-qr-code/?data='+this.qrCode
    }
  }
}
</script>

<style>

</style>