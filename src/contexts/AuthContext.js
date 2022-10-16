import axios from 'axios';
import React, { createContext, useState } from 'react'
import { toastSuccessNotify } from '../helper/ToastNotify';


export const AuthContext = createContext();

const url = "http://127.0.0.1:8000/"; // backend oluşturduğumuz url


const AuthContextProvider = (props) => {

  const [currentUser, setCurrentUser] = useState(sessionStorage.getItem("username") || false);
  // şuanki kullanıcı durumunu backend ten alacağız ve session storage username adında kaydettiğimiz veriyi state yoluyla alacağız yani register yaptığımızda kaydettiğimiz veriyi alacağız ve güncel username oluşturmuş olacağız

  let keys = sessionStorage.getItem("token");
  const [myKey, setMyKey] = useState(keys && window.atob(keys))


  // REGISTER
  const createUser = async (email, password, firstName, lastName, userName, navigate) => {
    // burada register marifetiyle frontendde girdiğimiz verileri backend kısmına post ederek backend kısmında user ile ilgili verileri oluşturup db kaydetmiş oluyoruz
    try {
      const res = await axios.post(`${url}users/auth/register/`,{
          "username": userName,
          "email": email,
          "first_name": firstName,
          "last_name": lastName,
          "password": password,
          "password2": password
      });


      // registerde bilgileri gönderdiğimizde token üretiyor ve bunu dataya atıyor eğer token varsa bu tokeni sessionstorage atacğız ve oradan state yardımıyla çekip kullanacağız
      if (res.data.token){
        console.log(res);
        setMyKey(res.data.token) //register da oluşturduğumuz user in token myKey atacağız
        setCurrentUser(res.data.username) // register da oluşturduğumuz user in username ini currentUser a atacağız
        // buradaki amacımız sürekli değişen yani dinamik olan username ve token bilgisini useState aracılığıyla react ta işlemek
        sessionStorage.setItem("username", res.data.username) 
        const myToken = window.btoa(res.data.token) // btoa vasıtasıyla token u şifreledik
        sessionStorage.setItem("token", myToken) // token adıyla session storage attık ve dinamik olarak kullanmak için gönderdik
        toastSuccessNotify("User registered successfully.")
        navigate("/home")
      }


    } catch (error) {
      console.log(error)
    }
  }

  
// LOGIN
const signIn = async (email, password, userName, navigate) => {

  try {
    const res = await axios.post(`${url}users/auth/login/`, {
      "email": email,
      "username":userName,
      "password":password,
    })

    if(res.data.key){
      // loginde token yerine key ismini kullanmıştık backend te kullandık
      setMyKey(res.data.key) // login endpointindeki  keyi tokenSerializer den almak almak
      setCurrentUser(res.data.user.username) //login endpointindeki  username almak
      sessionStorage.setItem('username',res.data.user.username)
      const myToken = window.btoa(res.data.key)
      sessionStorage.setItem('token',myToken)
      sessionStorage.setItem("is_staff",res.data.user.is_staff)
      toastSuccessNotify('User login successfully.')
      navigate("/home")
    }


  } catch (error) {
    console.log(error)
  }
}

// LOGOUT
const logOut = async (navigate) =>{
  try {
    var config = {
      method: "post",
      url : "http://127.0.0.1:8000/users/auth/logouts/",
      headers: {
        "Authorization": `Token ${myKey}`, 
      }
    };

    const res = await axios(config)

    if(res.status === 200) {
      setCurrentUser(false)
      setMyKey(false)
      sessionStorage.clear()
      toastSuccessNotify('User log out successfully.')
      navigate("/")
    }


  } catch (error) {
    console.log(error)
  }
}


let value = {
  createUser,
  currentUser,
  myKey,
  signIn,
  logOut,
}

  return (
    <AuthContext.Provider value = {value}>
      {props.children}
    </AuthContext.Provider>
  )
}

export default AuthContextProvider