import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBpHZcs6qgXihQ1m2nBWUmpf4fH5XloaDM",
  authDomain: "creative-room-af909.firebaseapp.com",
  projectId: "creative-room-af909",
  storageBucket: "creative-room-af909.appspot.com",
  messagingSenderId: "143615004439",
  appId: "1:143615004439:web:596d34f12a711b6805f152"
};

const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();
const auth = getAuth();

async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const idToken = await user.getIdToken();
    return { access_token: idToken };
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export default loginWithGoogle;
