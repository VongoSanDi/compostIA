import axios from "axios";

export async function getAllMairies() {
  const baseURI = 'http://localhost:4000/api/liste_communes'
  //const reponse = axios.get(baseURI).then(response => console.log(response)).catch(() => console.log('issue', baseURI))
  const reponse = await axios.get(baseURI)
  //console.log("test alert", reponse)
  return reponse;
}

export async function postInscription(val) {

}