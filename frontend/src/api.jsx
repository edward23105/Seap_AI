// api.js
import Cookies from "universal-cookie";
import  { jwtDecode } from "jwt-decode";
const API_BASE = "http://localhost:8000";
const cookies = new Cookies(null,{path: '/'});

export function getCookieJWT(){
  return cookies.get("jwt");
}

export async function getLoggedStatus() {
  return await verifyJwt();
}
export function getUsername() {
  
  try{
    let cookie = cookies.get("jwt");
    console.log("cookie: ");
    console.log(cookie);
    let jwt = jwtDecode(cookie);
    console.log(jwt["username"]);
    return jwt["username"];
  }
  catch(err){
    console.log("error: ");
    console.log(err);
    return "invalid username";
  }
}

async function verifyJwt() {
  try{
    
    const token = cookies.get("jwt");
    
    if(!token) return false;

    const response = await fetch(`${API_BASE}/verify_jwt`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if(!response.ok){
      cookies.remove("jwt", { path: "/" });
      return false;  
    }

    return true;
  
  }
  catch(error){
    return false;
  }
}

async function changeJwt() {
  try{
    
    const token = cookies.get("jwt");
    
    if(!token) return false;

    const response = await fetch(`${API_BASE}/refresh_jwt`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if(!response.ok){
      cookies.remove("jwt", { path: "/" });
      return false;  
    }

    const data =  await response.json();
    if(!data.jwt) return false;
    cookies.set("jwt",data.jwt,{path: "/"});

    return true;
  
  }
  catch(error){
    return false;
  }
}

export function DelogUser(){
  cookies.remove("jwt",{path: "/"});
}

export async function authUser(payload) {
  const response = await fetch(`${API_BASE}/auth_user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) return null;

  const data = await response.json();
  if (!data.jwt) return null;

  cookies.set("jwt", data.jwt, { path: "/" });
  return data;
}

export async function getData(payload) {
  

  const token = cookies.get("jwt");
  if (!token) return null;

  let response = await fetch(`${API_BASE}/get_reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  // if token expired, try to refresh once
  if (response.status === 401) {
    const refreshed = await changeJwt();
    if (!refreshed) {
      // refresh failed – user must log in again
      cookies.remove("jwt", { path: "/" });
      return null;
    }

    const newToken = cookies.get("jwt");
    response = await fetch(`${API_BASE}/get_reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${newToken}`,
      },
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    // some other error
    throw new Error(`get_reports failed: ${response.status}`);
  }
  return await response.json();
}
