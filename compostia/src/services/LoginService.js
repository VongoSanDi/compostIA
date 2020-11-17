import axios from "axios";

export async function loginUser(data) {
  console.log('d', data)
  const url = 'http://localhost:4000/login';
  //let res = null;

  try {
    //res = axios.post(url, d);
    const response = await axios({
      method: "post",
      url: url,
      data: {
        email: data.email,
        password: data.password
      }
    })
    console.log("service", response);
    return response;
    /* res = axios.post(url, {}, data)
    return res.data; */

  } catch (err) {
    console.error(err);
  }
}


/*
async LogIn({commit}, User) {
  await axios.post('login', User)
  await commit('setUser', User.get('username'))
},
*/