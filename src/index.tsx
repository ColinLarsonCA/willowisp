import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCllCbryXXQu3x5VHeKdtrsJlJEsH7X3CU",
  authDomain: "willowisp-37689.firebaseapp.com",
  projectId: "willowisp-37689",
  storageBucket: "willowisp-37689.appspot.com",
  messagingSenderId: "572752021929",
  appId: "1:572752021929:web:bc922922d2c06f604e5cb8",
  measurementId: "G-LHDD4V9YTS"
};
initializeApp(firebaseConfig);

ReactDOM.render(<App />, document.querySelector("#app"));
