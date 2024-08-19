import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm";
import { useEffect, useState } from "react";
import { lookInSession } from "./common/session";
import { createContext } from "react";
import Editor from "./pages/editorpage";
import HomePage from "./pages/homepage";
import SearchPage from "./pages/searchpage";
import PageNotFound from "./components/pagenotfound.component";
import ProfilePage from "./pages/profilepage";

export const UserContext = createContext();

const App = () => {
  const [userAuth, setUserAuth] = useState({});

  useEffect(() => {
    let userInSession = lookInSession("user");

    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null });
  }, []);

  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <Routes>
        <Route path="/editor" element={<Editor />} />
        <Route path="/" element={<Navbar />}>
          <Route index element={<HomePage />}></Route>
          <Route
            path="/signin"
            element={<UserAuthForm type="sign-in" />}
          ></Route>
          <Route
            path="/signup"
            element={<UserAuthForm type="sign-up" />}
          ></Route>
          <Route path="/search/:query" element={<SearchPage />}></Route>
          <Route path="/user/:id" element={<ProfilePage />}></Route>
          <Route path="*" element={<PageNotFound />}></Route>
        </Route>
      </Routes>
    </UserContext.Provider>
  );
};

export default App;
