import axios from "axios";

const getBaseURL = () => {
  if (process.env.NODE_ENV === "production") {
    return "https://todo.twfyer.com";
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: { "Content-Type": "application/json" },
});
