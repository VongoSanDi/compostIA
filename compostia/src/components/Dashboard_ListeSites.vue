<template>
  <v-container>
    <div>
      <strong>Point de collectes</strong>
    </div>
    <v-data-table
      :headers="headers"
      :items="listeSites"
      item-key="name"
    >
    </v-data-table>
  </v-container>
</template>

<script>
export default {
  name: "Dashboard_ListeSites",
  data:() => ({
  }),
  computed:{
    headers() {
      return [
        {
          text: "Nom",
          value: "nom"
        },
        {
          text: "Adresse",
          value: "adresse"
        },
        {
          text: "Code Postal",
          value: "codpostal"
        }
      ]
    },
    listeSites() {
      return this.$store.getters.listeSitesCompostesGetters.map(m => m.properties)
    }
  }
}
</script>

<style>

</style>