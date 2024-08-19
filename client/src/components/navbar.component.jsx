import { Link, Outlet, useNavigate } from "react-router-dom";
import logo from "../imgs/logo.png";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import UserNavigation1 from "./userNavigation";

const Navbar = () => {
  const [searchVisibility, setSearchVisibility] = useState(false);

  const [userNav1, setUserNav1] = useState(false);

  let navigate = useNavigate()

  const {
    userAuth,
    userAuth: { access_token, profile_img },
  } = useContext(UserContext);

  const handleSearch =(e)=>{
    let query = e.target.value

    if(e.keyCode == 13 && query.length){
      navigate(`/search/${query}`)
    }
  }
  function handleBlur(){
    setTimeout(()=>{
      setUserNav1(false)
    },200)
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-40 mt-2 h-full">
          <img src={logo} className="w-full h-auto" alt="Logo" />
        </Link>

        <div
          className={
            "absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show " +
            (searchVisibility ? "show" : "hide")
          }
        >
          <input
            type="text"
            placeholder="search"
            className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12"
            onKeyDown={handleSearch}
          />
          <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none top-1/2 md:left-5 -translate-y-1/2 text-1.5xl text-dark-grey"></i>
        </div>

        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          <button
            className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center"
            onClick={() => setSearchVisibility((currentvalue) => !currentvalue)}
          >
            <i className="fi fi-rr-search text-1.5xl"></i>
          </button>

          <Link to="/editor" className="hidden md:flex gap-2 link">
            <i class="fa-regular fa-pen-to-square"></i>
            <p>Write</p>
          </Link>

          {
          
          access_token ? (
            <>
              <Link to="/dashboard/notification">
                <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/15">
                  <i className="fi fi-rr-bell block text-2xl mt-1"></i>
                </button>
              </Link>

              <div className="relative">
                <button
                  className="w-12 h-12 mt-2"
                  onClick={() => setUserNav1((currentvalue) => !currentvalue)}
                  onBlur={handleBlur}
                >
                  <img
                    src={profile_img}
                    alt="user profile image"
                    className="w-full h-full object-cover rounded-full"
                  />
                </button>
                {userNav1 ? <UserNavigation1 /> : ""}
              </div>
            </>
          ) : (
            <>
              <Link className="btn-dark py-2" to="/signin">
                Sign In
              </Link>

              <Link className="btn-light py-2 hidden md:block" to="/signup">
                Sign Up
              </Link>
            </>
          )
          
          }
        </div>
      </nav>

      <Outlet />
    </>
  );
};

export default Navbar;
