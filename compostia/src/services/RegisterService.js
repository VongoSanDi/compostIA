export async function getAllMairies() {
  const reponse = await fetch('http://localhost:4000/api/liste_communes');
  console.log("test alert", reponse)
  return await reponse;
}