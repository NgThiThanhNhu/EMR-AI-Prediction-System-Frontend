import axios from "axios";

export const axiosClient = axios.create({
    baseURL: 'yourbackendurl',
    withCredentials: true
});