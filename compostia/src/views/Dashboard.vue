<template>
  <v-container>
    <v-row no-gutters center>
      <v-col
        cols="6"
        sm="6"
      >
        <DashboardTotalPoints/>
      </v-col>
      <v-col
        cols="6"
        sm="6"
      >
        <DashboardQRCode/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import DashboardTotalPoints from '../components/Dashboard_TotalPoints'
  import DashboardQRCode from '../components/Dashboard_QRCode'
export default {
  name: 'Dashboard',
  components: {
    DashboardTotalPoints,
    DashboardQRCode
  }

}
</script>

<style>

</style>