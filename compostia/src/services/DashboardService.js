import axios from "axios";
import store from '../store/index'

export async function sendMailToBackForQrCode() {
  const mail = store.getters.infoUtilisateurGetters.email;
  console.log("mail",mail)
  const baseURI = 'http://localhost:4000/qr_code?email='

  const reponse = await axios.get(baseURI+mail)
  return reponse.data.qrcode
}

export async function searchRQCode(val) {
  console.log("val",val)
  const baseURL =  "http://api.qrserver.com/v1/create-qr-code/?data=";
  const reponse = await axios.get(baseURL+val)
  console.log(reponse)
  return reponse;
}