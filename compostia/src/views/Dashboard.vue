<template>
  <v-container space-between>
    <v-row no-gutters>
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
    <v-row no-gutters center>
      <v-col
        cols="12"
        sm="12"
      >
      <DashboardMap/>
      </v-col>
    </v-row>
    <v-row no-gutters center>
      <v-col
        cols="12"
        sm="12"
      >
      <DashboardListeSites/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import DashboardTotalPoints from '../components/Dashboard_TotalPoints'
  import DashboardQRCode from '../components/Dashboard_QRCode'
  import DashboardMap from '../components/Dashboard_Map'
  import DashboardListeSites from '../components/Dashboard_ListeSites'
export default {
  name: 'Dashboard',
  components: {
    DashboardTotalPoints,
    DashboardQRCode,
    DashboardMap,
    DashboardListeSites
  }

}
</script>

<style>

</style>