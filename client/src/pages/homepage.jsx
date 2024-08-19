import axios from "axios";
import Animalwrapper from "../common/page-animation";
import InPageNavigation, { activeTabRef } from "../components/inpageNavigation";
import { useEffect, useState } from "react";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blogcard.component";
import MinimalBlogPost from "../components/trendingblogcard.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../components/pagination.component";
import LoadMoreDataBtn from "../components/loadmoredata.component";

const HomePage = () => {
  let [blogs, setBlog] = useState(null);
  let [trendingBlogs, setTrendingBlog] = useState(null);
  let [pageState, setPageState] = useState("home");

  let categories = [
    "coding",
    "cooking",
    "social media",
    "film making",
    "traveling",
    "tech",
    "finance",
    "tollywood",
  ];

  const fetchLatestBlogs = async ({ page = 1 }) => {
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_HOST + "/latest-blogs",
        { page }
      );
      let formatedData = await filterPaginationData({
        state: blogs,
        data: data.blogs,
        page,
        countRoute: "/all-latest-blogs-count",
      });
      console.log(formatedData);
      setBlog(formatedData);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchBlogsByCategory = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_HOST + "/search-blogs", {
        tag: pageState,
        page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_To_Send: { tag: pageState },
        });
        setBlog(formatedData);
      })
      .catch((err) => {
        console.error("Error fetching blogs:", err);
      });
  };
  const fetchTrendingBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_HOST + "/trending-blogs")
      .then(({ data }) => {
        setTrendingBlog(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const loadBlogByCategory = (e) => {
    let category = e.target.innerText.toLowerCase();
    setBlog(null);

    if (pageState == category) {
      setPageState("home");
      return;
    }

    setPageState(category);
  };

  useEffect(() => {
    activeTabRef.current.click();
    if (pageState == "home") {
      fetchLatestBlogs({ page: 1 });
    } else {
      fetchBlogsByCategory({ page: 1 });
    }

    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
  }, [pageState]);

  return (
    <Animalwrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* Latest Blogs */}
        <div className="w-full">
          <InPageNavigation
            routes={[pageState, "trending blogs"]}
            hiddenRoute={["trending blogs"]}
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
              <LoadMoreDataBtn
                state={blogs}
                fetchDataFun={
                  pageState == "home" ? fetchLatestBlogs : fetchBlogsByCategory
                }
              />
            </>
            {/*tredning blogs */}
            {trendingBlogs == null ? (
              <Loader />
            ) : trendingBlogs.length ? (
              trendingBlogs.map((blog, i) => {
                return (
                  <Animalwrapper
                    transition={{ duration: 1, delay: i * 0.1 }}
                    key={i}
                  >
                    <MinimalBlogPost blog={blog} index={i} />
                  </Animalwrapper>
                );
              })
            ) : (
              <NoDataMessage message="No Trending Blogs" />
            )}
          </InPageNavigation>
        </div>

        {/* Filters and Trending blogs*/}
        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            <div>
              <h1 className="font-medium text-xl mb-8">
                stories from all interests
              </h1>
              <div className="flex flex-wrap gap-3">
                {categories.map((category, i) => {
                  return (
                    <button
                      onClick={loadBlogByCategory}
                      className={
                        "tag " +
                        (pageState == category ? "bg-black text-white " : "")
                      }
                      key={i}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h1 className="font-medium text-xl mb-8">
                Trending <i class="fi fi-rr-arrow-trend-up"></i>
              </h1>
              {trendingBlogs == null ? (
                <Loader />
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog, i) => {
                  return (
                    <Animalwrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <MinimalBlogPost blog={blog} index={i} />
                    </Animalwrapper>
                  );
                })
              ) : (
                <NoDataMessage message="No Trending Blogs" />
              )}
            </div>
          </div>
        </div>
      </section>
    </Animalwrapper>
  );
};

export default HomePage;
