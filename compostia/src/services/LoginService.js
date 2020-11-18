import axios from "axios";

export async function loginUser(data) {
  const url = 'http://localhost:4000/login';

  try {
    const response = await axios({
      method: "post",
      url: url,
      data
    })
    console.log("service", response);
    return response;

  } catch (err) {
    console.error(err);
  }
}