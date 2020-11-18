import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isAuthenticated: false,
    infoUtilisateur: []
  },
  mutations: {
    authentification(state, value) {
      state.isAuthenticated = value
    },
    updateInfoUtilisateur(state, value) {
      state.infoUtilisateur = value
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
    }
  },
  modules: {
  }
})
