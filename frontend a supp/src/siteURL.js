import  axios  from "axios";

const PRINCIPLE_URL = "http://localhost:5000/api";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NjY4MDYxODQsImV4cCI6MTY2NzA2NTM4NH0.siVI58Zchm6WklKeb874A6D3Q_0fZ7I8L84k1Z8Mcpw";


export const publicURL = axios.create({
    baseURL: PRINCIPLE_URL,
});

export const adminURL = axios.create({
    baseURL: PRINCIPLE_URL,
    header: {token:`Bearer ${TOKEN}`},
});