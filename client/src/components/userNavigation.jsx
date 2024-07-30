import { Link } from "react-router-dom";
import Animalwrapper from "../common/page-animation";
import { UserContext } from "../App";
import { useContext } from "react";
import { removeFromSession } from "../common/session";

const UserNavigation1 = () => {

    let {userAuth : {username},setUserAuth} = useContext(UserContext);

    function signOutUser(){
        removeFromSession("user");
        setUserAuth({access_token: null});
    }
  return (
    <Animalwrapper className="absolute right-0 z-50"  transition={{ duration: 0.2 }}>
      <div className="bg-white absolute right-0 border border-grey w-60 overflow-hidden duration-200">
        <Link to="/editor" className="flex gap-2 md:hidden pl-8 py-4 link">
          <i class="fa-regular fa-pen-to-square"></i>
          <p>Write</p>
        </Link>
        <Link to={`/user/${username}`} className="link pl-8 py-4">
            Profile
        </Link>
        <Link to="/dashboard/blogs" className="link pl-8 py-4">
          Dashboard
        </Link>
        <Link to="settings/edit-profile" className="link pl-8 py-4">
          Settings
        </Link>

        <span className="absolute border-t border-grey w-[100%]"></span>

        <button className="text-left p-4 hover:bg-grey w-full pl-8 py-4" onClick={signOutUser}>
            <h1 className="font-bold mg-1 text-xl">Sign Out</h1>
            <p className="text-dark-grey">@{username}</p>
        </button>
      </div>
    </Animalwrapper>
  );
};

export default UserNavigation1;
