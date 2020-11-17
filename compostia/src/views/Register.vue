<template>
<v-container>
    <v-row no-gutters>
      <v-col
        md="6"
        offset-md="3">
        <v-form v-model="valid">
          <v-radio-group
            v-model="radioGroupTypeProfil"
            row
            mandatory>
            <v-radio
              label="Particulier"
              value="radio-1"
            ></v-radio>
            <v-radio
              label="Collectivité"
              value="radio-2"
            ></v-radio>
          </v-radio-group>
          <v-text-field
            v-model="nom"
            :rules="ruleIdentite"
            label="Nom"
            required
          ></v-text-field>
          <v-text-field
            v-model="prenom"
            :rules="ruleIdentite"
            label="Prénom"
            required
          ></v-text-field>
          <v-text-field
            v-if="radioGroupTypeProfil == 'radio-2'"
            v-model="codeMairie"
            :rules="ruleCodeMairie"
            label="Code d'inscription"
            required
          ></v-text-field>
          <v-select
            v-if="radioGroupTypeProfil == 'radio-2'"
            :items="listeMairies"
            :rules="ruleMairie"
            label="Mairie"
            required
          ></v-select>
          <v-text-field
            v-model="email"
            :rules="ruleEmail"
            label="E-mail"
            required
          ></v-text-field>
          <v-text-field
            v-model="motDePasse"
            type="password"
            :rules="[ruleMotDePasse.requis]"
            label="Mot de passe"
            required
          ></v-text-field>
          <v-text-field
            v-model="confirmerMotDePasse"
            type="password"
            :rules="[ruleMotDePasse.requis, ruleMotDePasse.passwordMatch]"
            label="Confirmer le mot de passe"
            required
          ></v-text-field>
          <v-btn
          :disabled="!valid"
          @click="register"
          >S'inscrire</v-btn>
        </v-form>
        <v-btn
        @click="getListeMairies">
        coucou</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import { getAllMairies } from '../services/RegisterService'
export default {
  name: 'Register',
  data: () => ({
    valid: false,
    radioGroupTypeProfil: false,
    nom: null,
    prenom: null,
    email: null,
    motDePasse: null,
    confirmerMotDePasse: null,
    listeMairies: []
  }),
  computed: {
    ruleIdentite() {
      return [
        v => !!v ||"Le champ ne doit pas être vide"
      ]
    },
    ruleEmail() {
      return [
        v => !!v ||"L'email est requis",
        v => /.+@.+\..+/.test(v) ||"L'email doit être au formats xxxxx@yyy.zz"
      ]
    },
    ruleMotDePasse() {
      return {
        requis: v => !!v || "Mot de passe requis",
       // min: v => v.length >= 8 || "Le mot de passe avoir 8 caractères minimum",
        passwordMatch: () => this.motDePasse === this.confirmerMotDePasse || "Le mot de passe ne correspond pas"
      }
    },
    ruleMairie() {
      return [
        v => !!v || "Vous devez sélectionner au moins une mairie"
      ]
    }
  },
  methods: {
    register() {
      alert("S'enregistrer")
      this.$refs.form.validate()
    },
    async getListeMairies () {
      const reponse = await getAllMairies()
      alert(reponse)
    }
  }
}
</script>

<style>

</style>