import axios from "axios";
import store from '../store/index'

export async function sendMailToBackForQrCode() {
  const mail = store.getters.infoUtilisateurGetters.email;
  console.log("qrcode", mail)
  const baseURL = 'http://localhost:4000/qr_code?email='

  const reponse = await axios.get(baseURL+mail)
  console.log("reponse mail",reponse)
  return reponse.data.val
}

export async function searchRQCode(val) {
  const baseURL =  "http://api.qrserver.com/v1/create-qr-code/?data=";
  console.log("url qrcode",baseURL+val)
  console.log(typeof(val))
  const urlQRCode = baseURL+val;
  console.log(typeof(urlQRCode))
  console.log(urlQRCode)
  const reponse = await axios.get(urlQRCode)
  return reponse;
}

export async function getPoints() {
  const mail = store.getters.infoUtilisateurGetters.email;
  const baseURL = 'http://localhost:4000/points?email='
  const reponse =  await axios.get(baseURL+mail)
  console.log("reponse points",reponse)
  return reponse.data.val
}

export async function getListesSitesComposte() {
  const baseURL = "http://localhost:4000/geo_json_all"
  const reponse = await axios.get(baseURL)
  return reponse.data;
}