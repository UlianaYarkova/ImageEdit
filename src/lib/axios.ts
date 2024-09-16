import axios from "axios";

const axiosInstance = axios.create({
  responseType: 'blob'
})

export { axiosInstance }