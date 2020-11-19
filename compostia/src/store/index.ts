import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isAuthenticated: false,
    infoUtilisateur: [],
    listeSitesCompostes: []
  },
  mutations: {
    authentification(state, value) {
      state.isAuthenticated = value
    },
    updateInfoUtilisateur(state, value) {
      state.infoUtilisateur = value
    },
    updateListeSitesCompostes(state, value) {
      state.listeSitesCompostes = value
    }
  },
  actions: {
  },
  getters: {
    authenticatedGetters: state => {
      return state.isAuthenticated
    },
    infoUtilisateurGetters: state => {
      return state.infoUtilisateur
    },
    listeSitesCompostesGetters: state => {
      return state.listeSitesCompostes
    }
  },
  modules: {
  }
})
