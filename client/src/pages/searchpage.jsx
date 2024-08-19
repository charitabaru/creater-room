import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpageNavigation";
import { useEffect, useState } from "react";
import BlogPostCard from "../components/blogcard.component";
import Animalwrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/loadmoredata.component";
import axios from "axios";
import { filterPaginationData } from "../components/pagination.component";
import UserCard from "../components/user.component";

const SearchPage = () => {
  let { query } = useParams();
  let [blogs, setBlog] = useState(null);
  let [users,setUsers] = useState(null)

  const searchBlogs = ({ page = 1, create_new_arr = false }) => {
    axios
      .post(import.meta.env.VITE_SERVER_HOST + "/search-blogs", {
        query,
        page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_To_Send: { query },
          create_new_arr,
        });
        setBlog(formatedData);
      })
      .catch((err) => {
        console.error("Error fetching blogs:", err);
      });
  };

  const fetchUsers =()=>{
    axios
      .post(import.meta.env.VITE_SERVER_HOST + "/search-users", {query})
      .then(({data: {users}})=>{
        console.log(users)
        setUsers(users)
      })
  }

  useEffect(() => {
    resetState();
    searchBlogs({ page: 1, create_new_arr: true });
    fetchUsers()
  }, [query]);

  const resetState = () => {
    setBlog(null);
    setUsers(null)
  };

  const UserCardWrapper =()=>{
    return(
        <>
            {
                users == null ? <Loader /> : users.length ? users.map((user,i)=>{
                    return <Animalwrapper transition={{ duration: 1, delay: i * 0.08 }}
                    key={i}>
                        <UserCard  user={user}/>
                    </Animalwrapper>
                }) : <NoDataMessage message="No User Found" />
            }
        </>
    )
  }

  return (
    <section className="h-cover flex justify-center gap-10">
      <div className="w-full">
        <InPageNavigation
          routes={[`Search results from "${query}"`, "Accounts Matched"]}
          hiddenRoute={["Accounts Matched"]}
        >
          <>
            {blogs == null ? (
              <Loader />
            ) : blogs.results.length ? (
              blogs.results.map((blog, i) => {
                return (
                  <Animalwrapper
                    transition={{ duration: 1, delay: i * 0.1 }}
                    key={i}
                  >
                    <BlogPostCard
                      content={blog}
                      author={blog.author.personal_info}
                    />
                  </Animalwrapper>
                );
              })
            ) : (
              <NoDataMessage message="No blogs found in this category" />
            )}
            <LoadMoreDataBtn state={blogs} fetchDataFun={searchBlogs} />
          </>

          <UserCardWrapper />
        </InPageNavigation>
      </div>
      <div className="min-w-[40%] lg:min-w-[350px] max-w-min bl border-grey pl-8 pt-3 max-md:hidden">
            <h1 className="font-medium text-xl mb-8">User related to search <i className="fi fi-rr-user mt-1"></i></h1>

            <UserCardWrapper />
        </div>
    </section>
  );
};
export default SearchPage;
