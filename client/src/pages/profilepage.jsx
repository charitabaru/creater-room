import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Animalwrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { Link } from "react-router-dom";
import { UserContext } from "../App";

export const profileDataStructure = {
  personal_info: {
    fullname: "",
    username: "",
    bio: "",
    profile_img: "",
  },
  account_info: {
    total_posts: 0,
    total_reads: 0,
  },
  social_links: {},
  joinedAt: "",
};

const ProfilePage = () => {
  const { id: profileId } = useParams();
  const [profile, setProfile] = useState(profileDataStructure);
  let [loading, setLoading] = useState(true);

  let {
    personal_info: { fullname, username: profile_username, profile_img, bio },
    account_info: { total_posts, total_reads },
    social_links,
    joinedAt,
  } = profile;

  const { userAuth: { username: loggedInUsername } } = useContext(UserContext);

  const fetchUserProfile = () => {
    axios
      .post(import.meta.env.VITE_SERVER_HOST + "/get-profile", {
        username: profileId,
      })
      .then(({ data: user }) => {
        console.log(user);
        setProfile(user);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    resetStates()
    fetchUserProfile();
  }, [profileId]);

  const resetStates =()=>{
    setProfile(profileDataStructure)
    setLoading(true)
  }

  return (
    <Animalwrapper>
      {loading ? (
        <Loader />
      ) : (
        <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12 ">
          <div className="flex flex-col max-md:items-center gap-5 min-w-[250px]">
            <img
              src={profile_img}
              className="w-48 h-48 rounded-full bg-grey md:h-32 md:w-32 "
            />
            <h1 className="text-2xl font-medium ">@{profile_username}</h1>
            <p className="text-xl capitalize h-6">{fullname}</p>
            <p>
              {total_posts.toLocaleString()} Blogs &nbsp;&nbsp;
              {total_reads.toLocaleString()} Reads
            </p>

            <div className="flex gap-4 mt-2">
              {profileId == loggedInUsername ? (
                <Link
                  to={"/settings/edit-profile"}
                  className="btn-light rounded-md"
                >
                  Edit Profile
                </Link>
              ) : (
                ""
              )}
            </div>
          </div>
        </section>
      )}
    </Animalwrapper>
  );
};

export default ProfilePage;
