import { useContext, useRef } from "react";
import Animalwrapper from "../common/page-animation";
import InputBox from "../components/input";
import googlelogo from "../imgs/googlelogo.jpeg";
import { Link, Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
import loginWithGoogle from "../common/firebase";

const UserAuthForm = ({ type }) => {
  const authform = useRef();

  let {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  function userAuthFormServer(serverRoute, formData) {
    axios
      .post(import.meta.env.VITE_SERVER_HOST + serverRoute, formData)
      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data));
        setUserAuth(data);
        console.log(data);
      })
      .catch(({ response }) => {
        toast.error(response.data.error);
      });
  }

  function handleSubmit(e) {
    e.preventDefault();

    let serverRoute = type == "sign-in" ? "/signin" : "/signup";

    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    let form = new FormData(authform.current);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { fullname, email, password } = formData;

    if (fullname) {
      if (fullname.length < 3) {
        return toast.error("full name should be more that 3 letters");
      }
    }

    if (!email.length) {
      return toast.error("Enter email");
    }

    if (!emailRegex.test(email)) {
      return toast.error("Enter a valid email");
    }

    if (!passwordRegex.test(password)) {
      return toast.error(
        "Password should be 6-20 characters long, include at least one uppercase letter, one lowercase letter, and one numeric digit"
      );
    }

    userAuthFormServer(serverRoute, formData);
  }

  function handleGoogle(e) {
    e.preventDefault();
    loginWithGoogle()
      .then((user) => {
        let serverRoute = "/google-auth";
        let formData = {
          access_token: user.access_token,
        };
        userAuthFormServer(serverRoute, formData);
      })
      .catch((error) => {
        toast.error("Trouble with login through Google");
        console.error("Google login error:", error);
      });
  }
  

  return access_token ? (
    <Navigate to="/" />
  ) : (
    <Animalwrapper keyvalue={type}>
      <section className="h-cover flex justify-center items-center">
        <Toaster />
        <form ref={authform} className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
            {type == "sign-in" ? "welcome back" : "Join us today"}
          </h1>
          {type != "sign-in" ? (
            <InputBox
              name="fullname"
              type="text"
              placeholder="Full Name"
              icon="fi-rr-user"
            />
          ) : (
            ""
          )}

          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            icon="fi-rr-envelope"
          />

          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon="fi-rr-key"
          />

          <button
            className="btn btn-dark mt-14 center"
            type="submit"
            onClick={handleSubmit}
          >
            {type.replace("-", " ")}
          </button>

          <div className="my-10 gap-2 relative w-full flex items-center opacity-10 uppercase text-black font-bold">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div>

          <button
            className="btn btn-dark flex items-center justify-center gap-4 w-[90%] center"
            onClick={handleGoogle}
          >
            <img src={googlelogo} className="w-5 rounded-full text-6xl" />
            continue with google
          </button>

          {type == "sign-in" ? (
            <p className="mt-6 text-center text-dark-grey text-xl">
              Don't have an account?
              <Link to="/signup" className="text-black underline text-xl ml-1">
                Join us today
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-center text-dark-grey text-xl">
              Already a member?
              <Link to="/signin" className="text-black underline text-xl ml-1">
                Sign in here
              </Link>
            </p>
          )}
        </form>
      </section>
    </Animalwrapper>
  );
};

export default UserAuthForm;
