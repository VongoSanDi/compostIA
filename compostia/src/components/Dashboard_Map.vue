<template>
    <div style="height: 500px; width: 100%">
    <l-map
      :zoom="zoom"
      :center="center"
      :options="mapOptions"
      style="height: 80%"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
    >
      <l-tile-layer
        :url="url"
        :attribution="attribution"
      />
      <l-marker v-for="marker in markers" :key="marker.id" :lat-lng="marker.coordinates">
        <l-popup>
          <div>
            <div>{{marker.properties.nom}}</div>
            <div>{{marker.properties.adresse}}</div>
            <div>{{marker.properties.commune}}</div>
            <div>{{marker.properties.codpostal}}</div>
          </div>
        </l-popup>
      </l-marker>
    </l-map>
    </div>
</template>

<script>
import "leaflet/dist/images/marker-shadow.png"
import "leaflet/dist/leaflet.css"
import { latLng } from "leaflet";
import { LMap, LTileLayer, LMarker, LPopup, /* LIcon */} from "vue2-leaflet";
import { getListesSitesComposte } from '../services/DashboardService'

import { Icon } from 'leaflet';

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


export default {
  name: "Dashboard_Map",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    /* LIcon */
  },
  data: () => ({
    zoom: 13,
    center: latLng(45.7702132, 4.8043046),
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    currentZoom: 11.5,
    currentCenter: latLng(47.41322, -1.219482),
    showParagraph: false,
    mapOptions: {
      zoomSnap: 0.5
    },
    test: latLng(45.7703666,4.8066098,17),
    markers: [],
    iconUrl: "../assets/leaf-green.png"
  }),
  mounted() {
    this.recuperationSitesCompostages()
    this.urlIcon = "../assets/leaf-green.png"
  },
  methods: {
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    async recuperationSitesCompostages() {
      this.markers = await getListesSitesComposte()
      this.$store.commit("updateListeSitesCompostes", this.markers)
      for (let i = 0; i < this.markers.length; i++) {
        Object.assign(this.markers[i], {id: 'marker-'+i})
      }
      console.log("markers", this.markers)
    }
  }
};
</script>

<style>
</style>