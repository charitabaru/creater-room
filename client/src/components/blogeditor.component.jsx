import { Link } from "react-router-dom";
import logo from "../imgs/logo.png";
import BlogBanner from "../imgs/blogbanner.png";
import Animalwrapper from "../common/page-animation";
import { useContext, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { Editorcontext } from "../pages/editorpage";

const BlogEditor = ({ token }) => {
  let {
    blog,
    blog: { title, banner, content, tags, des },
    setBlog,
  } = useContext(Editorcontext);

  console.log(blog);

  const handleBannerUpload = async (e) => {
    let img = e.target.files[0];
    console.log(img);
    if (img) {
      let loadingToast = toast.loading("uploading..");
      const formData = new FormData();
      formData.append("banner", img);

      try {
        console.log("token from prop: ", token);
        if (!token) {
          console.error("No access token found");
          return;
        }
        const response = await axios.post(
          "http://localhost:3005/upload-banner",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response.data.banner_url);
        if (response.data.banner_url) {
          toast.dismiss(loadingToast);
          toast.success("uploaded 👍");
          setBlog({ ...blog, banner: response.data.banner_url });
        }
      } catch (error) {
        toast.dismiss(loadingToast);
        return toast.error(error);
      }
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.keycCode == 13) {
      e.preventDefault();
    }
  };

  const handleOnChange = (e) => {
    let input = e.target;

    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";

    setBlog({ ...blog, title: input.value });
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-40">
          <img src={logo} />
        </Link>
        <p className="max-mid:hidden line-clamp-1 text-black w-full">
          {title.length ? title : "new Blog"}
        </p>
        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2">Publish</button>
          <button className="btn-light py-2">Save Draft</button>
        </div>
      </nav>
      <Toaster />
      <Animalwrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bf-white border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img
                  src={banner || BlogBanner}
                  className="z-20"
                  alt="Blog Banner"
                />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>

            <textarea
              placeholder="Blog-title"
              className="text-4xl font-medium h-20 w-full outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
              onKeyDown={handleTitleKeyDown}
              onChange={handleOnChange}
            ></textarea>

            <hr className = "w-full opacity-10 my-5" />
          </div>
        </section>
      </Animalwrapper>
    </>
  );
};
export default BlogEditor;
