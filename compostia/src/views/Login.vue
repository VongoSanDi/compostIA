<template>
<v-container>
  <v-row no-gutters>
      <v-col
        md="6"
        offset-md="3"
      >
  <v-form
    ref="form"
    v-model="valid"
    class="text-center"
    method="POST"
    @submit.prevent
  >
    <v-text-field
      v-model="email"
      :rules="emailRules"
      label="E-mail"
      required
    ></v-text-field>
    <v-text-field
       v-model="password"
       :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
       :rules="[passwordRules.required,passwordRules.min]"
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
    >
      Connexion
    </v-btn>
    <div class="text-center mt-3" ><a> Mot de passe oublié ? </a></div>
    

  </v-form>
  <div class="text-center mt-5"><p>Pas encore inscrit ? alors Ntm</p>
      <v-btn
      :to="{name: 'Register'}"
      >Register
      </v-btn></div>


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
      show1: false
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
      submit () {
        const data = { email: this.email, password: this.password }
        this.$refs.form.validate()
        loginUser(data);
        
      }
    },
  }
</script>