<template>
  <v-card
    class="mx-auto"
    max-width="344"
  >
  <v-card-title>
    <i class="fa fa-leaf"></i>
    <div style="margin-left:10px">Dupont Jean</div>
    </v-card-title>
    <v-card-text>
      <div style="font-size:20px">
        {{nombrePoints}} points
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import {getPoints} from '../services/DashboardService'
export default {
  name: 'Dashboard_TotalPoints',
  data: () => ({
    nombrePoints: 0
  }),
  mounted() {
    this.recuperationPoints()
  },
  methods: {
    async recuperationPoints() {
      this.nombrePoints = await getPoints() >= 0 ? await getPoints() : 0
    }
  }

}
</script>

<style>

</style>