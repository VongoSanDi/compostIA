<template>
  <v-container space-between>
    <v-row>
     <slider
      :width="200" 
      style="margin-left:10px;"
      :customStyles="{'navMenu': {'background-color': '#509a3b'}, 'navIcon': {'color': 'green'}}"
      format="push"
      direction="left"
      :opacity="0.15"
      :links="[{'id': 1, 'text': 'Accueil', 'url': 'https://github.com'},
        {'id': 2, 'text': 'Mes avantages', 'url': 'https://github.com'},
        {'id': 3, 'text': 'Mon compte', 'url': 'https://github.com'},
        {'id': 4, 'text': 'Paramètres', 'url': 'https://github.com'},
        {'id': 5, 'text': 'Information', 'url': 'https://github.com'}]"
    ></slider>
    </v-row>
    <v-row no-gutters space-around>
      <v-col
        cols="8"
        sm="6"
      >
        <DashboardTotalPoints/>
      </v-col>
      <v-col
        cols="4"
        sm="6"
      >
        <DashboardQRCode/>
      </v-col>
    </v-row>
    <v-row no-gutters center style="margin-top:10px">
      <v-col
        cols="12"
        sm="12"
      >
      <DashboardMap/>
      </v-col>
    </v-row>
    <v-row no-gutters center style="margin-top:-80px">
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
  import Slider from '@jeremyhamm/vue-slider'
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
    DashboardListeSites,
    'slider': Slider
  }

}
</script>

<style>

</style>