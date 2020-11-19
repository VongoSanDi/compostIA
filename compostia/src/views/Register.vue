<template>
<v-container>
  <v-alert
    v-if="invalidCreation"
    type="error"
    dismissible
    @input="fermeAlerte">
      Mauvais identifiants
  </v-alert>
    <v-row no-gutters>
      <v-col
        md="6"
        offset-md="3"
      >
      <v-img
        src="../assets/compostia1.png"
        max-width="170"
        class="mx-auto mt-4"
      ></v-img>
      <h1 class="text-center mt-3">Inscription</h1>
        <v-form v-model="valid">
          <v-row justify="space-around">
          <v-radio-group
            v-model="radioGroupTypeProfil"
            row
            mandatory>
            <v-radio
              label="Particulier"
              value="particulier"
            ></v-radio>
            <v-radio
              label="Collectivité"
              value="collectivite"
            ></v-radio>
          </v-radio-group>
          </v-row>
          <v-row>
            <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
            v-model="nom"
            :rules="ruleIdentite"
            label="Nom"
            required
          ></v-text-field>
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
          <v-text-field
            v-model="prenom"
            :rules="ruleIdentite"
            label="Prénom"
            required
          ></v-text-field>
          </v-col>
          </v-row>
          <v-text-field
            v-if="radioGroupTypeProfil == 'collectivite'"
            v-model="codeInscription"
            :rules="ruleCodeInscription"
            label="Code d'inscription"
            required
          ></v-text-field>
          <v-select
            v-model="mairieSelected"
            v-if="radioGroupTypeProfil == 'collectivite'"
            :items="listeMairies"
            item-text="nom"
            item-value="insee"
            :rules="ruleMairie"
            label="Mairie"
            return-object
            cache-items
            required
            @click="getListeMairies"
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
            :rules="[ruleMotDePasse.requis, ruleMotDePasse.min]"
            label="Mot de passe"
            required
          ></v-text-field>
          <v-text-field
            v-model="confirmerMotDePasse"
            type="password"
            :rules="[ruleMotDePasse.requis, ruleMotDePasse.passwordMatch, ruleMotDePasse.min]"
            label="Confirmer le mot de passe"
            required
          ></v-text-field>
          <v-checkbox
            v-model="acceptCGU"
            label="Acceptez-vous les Conditions Générales d'Utilisations"
            :rules="ruleCGU"
          ></v-checkbox>
          <v-btn
            :disabled="!valid"
            @click="inscription">
            S'inscrire
          </v-btn>
          <v-btn
            style="margin-top:10px"
            :to="{name: 'Login'}"
          > Vous avez déjà un compte ?
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { getAllMairies, postInscription } from '../services/RegisterService'
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
    listeMairies: [],
    codeInscription: null,
    mairieSelected: null,
    acceptCGU: false,
    invalidCreation: false
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
        min: v => v.length >= 8 || "Le mot de passe avoir 8 caractères minimum",
        passwordMatch: () => this.motDePasse === this.confirmerMotDePasse || "Le mot de passe ne correspond pas"
      }
    },
    ruleMairie() {
      return [
        v => !!v ||"Vous devez sélectionner au moins une mairie"
      ]
    },
    ruleCodeInscription() {
      return [
        v => !!v ||"Champ obligatoire"
      ]
    },
    ruleCGU() {
      return [
        v => !!v ||"Vous devez accepter les Conditions Générales d'Utilisations"
      ]
    }
  },
  methods: {
    async getListeMairies () {
      const reponse = await getAllMairies()
      this.listeMairies = reponse.data 
    },
    async inscription() {
      const user = {
        typeUtilisateur: this.radioGroupTypeProfil,
        nom: this.nom,
        prenom: this.prenom,
        email: this.email,
        motDePasse: this.motDePasse,
        mairie: this.mairieSelected ? this.mairieSelected.insee : null,
        acceptCGU: this.acceptCGU,
        codeInscription: this.codeInscription ? this.codeInscription : null
      }
      const reponse = await postInscription(user)
      if (reponse.data.success) {
        const infoUtilisateur = {
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
        }
        this.$store.commit("updateInfoUtilisateur", infoUtilisateur)
        this.$router.push({name: "Login"})
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

<style>

</style>