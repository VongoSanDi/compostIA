<template>
  <v-container>
    <v-alert
      v-if="invalidConnection"
      type="error"
      dismissible
      @input="fermeAlerte">
        Mauvais identifiants
    </v-alert>
    <v-row no-gutters>
      <v-col
        md="6"
        offset-md="3">
        <v-img
          src="../assets/compostia1.png"
          max-width="200"
          class="mx-auto mt-4"
        ></v-img>
      <h1 class="text-center mt-3">Connexion</h1>
        <v-form
          v-model="valid"
          ref="form"
          class="text-center"
        >
          <v-text-field
            v-model="email"
            :rules="emailRules"
            label="E-mail"
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            name="password"
            :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[passwordRules.required, passwordRules.min]"
            :type="show1 ? 'text' : 'password'"
            label="Mot de passe"
            @click:append="show1 = !show1"
            required
          ></v-text-field>
          <v-btn
            :disabled="!valid"
            color="success"
            class="mr-4 text-center"
            @click="submit"
            > Connexion
          </v-btn>
          <!-- <v-btn
          > Mot de passe oublié ?
          </v-btn> -->
          <v-btn
            :to="{name: 'Register'}"
          > Pas encore inscrit ?
          </v-btn>
        </v-form>
        <!-- <div class="text-center mt-3" ><a> Mot de passe oublié ? </a></div> -->
        <!-- <div class="text-center mt-5"><a>Pas encore inscrit ?</a></div> -->
    </v-col>
    </v-row> 
  </v-container>
</template>

<script>
import { loginUser } from '../services/LoginService'
  export default {
    name: 'Login',
    data: () => ({
      valid: false,
      password:null,
      email: null,
      show1: false,
      invalidConnection: false
    }),
    computed: {
      emailRules() {
        return [
          v => !!v || 'Veuillez renseigner une adresse email',
          v => /.+@.+\..+/.test(v) || 'E-mail invalide'
        ]
      },
      passwordRules() {
        return {
          required: value => !!value || 'Requis.',
          min: v => v.length >= 8 || '8 caractères minimum'
        }
      }
    },
    methods: {
      async submit () {
        const user = { email: this.email, password: this.password }

        const reponse = await loginUser(user);
        if (reponse.data == true) {
          const infoUtilisateur = {
            email: this.email,
          }
          this.$store.commit('authentification', true)
          this.$store.commit("updateInfoUtilisateur", infoUtilisateur)
          this.$router.push({name: 'Dashboard'})
        } else {
          this.invalidConnection = true
        }
      },
      fermeAlerte() {
        this.invalidConnection = !this.invalidConnection
      }
    }
  }
</script>