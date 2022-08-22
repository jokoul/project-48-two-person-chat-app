import logo from "./logo.svg";
import "./App.css";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

//import hooks
import { useAuthState, useSignInWithGoogle } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useState } from "react";

firebase.initializeApp({
  //config
  apiKey: "AIzaSyDGsdIzMHZTzChlUISX4xoc0DfZjaYGhGQ",
  authDomain: "two-person-chat-app.firebaseapp.com",
  projectId: "two-person-chat-app",
  storageBucket: "two-person-chat-app.appspot.com",
  messagingSenderId: "1058037694407",
  appId: "1:1058037694407:web:6d02feab21403b257423e2",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth); //if user is signed in=>user is an object, if sign out=> user is null
  return (
    <div className="App">
      <header className="App-header"></header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    //instatiate a provider
    const provider = new firebase.auth.GoogleAuthProvider();
    //then we pass provider as argument
    auth.signInWithPopup(provider);
  };

  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function ChatRoom() {
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);
  //react to change in realtime
  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");

  //Write value to firestore
  const sendMessage = async(e)=>{
    e.preventDefault();
    
    const {uid,photoURL} = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');//to empty field
  }

  return (
    <div>
      <div>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
      </div>
      <form onSubmit={sendMessage}>
        {/*Bind state to form input*/}
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />

        <button type="submit">🕊️</button>
      </form>
    </div>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  //for conditional CSS
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  // return <p>{text}</p>
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="logo" />
      <p>{text}</p>
    </div>
  );
}

export default App;
