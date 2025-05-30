import axios from "axios";

const api = axios.create({
  baseURL: "https://hris-livid.vercel.app",
  withCredentials: true,
});

export default api;
