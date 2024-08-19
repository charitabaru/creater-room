import { Toaster, toast } from "react-hot-toast";
import Animalwrapper from "../common/page-animation";
import { useContext } from "react";
import { Editorcontext } from "../pages/editorpage";
import Tag from "./tag.component";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";

const PublishForm = () => {
  let characterLimit = 200;
  let tagLimit = 10;
  let {
    setEditorState,
    blog,
    blog: { banner, tags, des, title, content },
    setBlog,
  } = useContext(Editorcontext);

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  let navigate = useNavigate();

  const handleCloseEvent = () => {
    setEditorState("editor");
  };
  const handleBlogTitleChange = (e) => {
    let input = e.target.value;
    setBlog({ ...blog, title: input });
  };
  const handleBlogDesChnage = (e) => {
    let input = e.target.value;
    setBlog({ ...blog, des: input });
  };
  const handleTitleKeyDown = (e) => {
    if (e.keyCode == 13) {
      e.preventDefault();
    }
  };
  const handlekeyDown = (e) => {
    if (e.keyCode == 13 || e.keyCode == 188) {
      e.preventDefault();
      let tag = e.target.value;
      if (tags.length < tagLimit) {
        if (!tags.includes(tag) && tag.length) {
          setBlog({ ...blog, tags: [...tags, tag] });
        }
      } else {
        toast.error(`you can add max ${tagLimit} tags`);
      }
      e.target.value = "";
    }
  };

  const publishBlog = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }
    if (!title.length) {
      return toast.error("Write the blog title before publishing");
    }
    if (!des.length || des.length > characterLimit) {
      return toast.error(
        `Write the description with in the ${characterLimit} characters to Publish`
      );
    }
    if (!tags.length) {
      return toast.error("write at least 1 tag to help us rank your blog");
    }
    let loadingToast = toast.loading("Publishing....");

    e.target.classList.add("disable");

    let blogObj = {
      title,
      des,
      banner,
      content,
      tags,
    };

    axios
      .post(import.meta.env.VITE_SERVER_HOST + "/create-blog", blogObj, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then(() => {
        e.target.classList.remove("disable");
        toast.dismiss(loadingToast);
        toast.success("Published 👍!");

        setTimeout(() => {
          navigate("/");
        }, 500);
      })
      .catch(({ response }) => {
        e.target.classList.remove("disable");
        toast.dismiss(loadingToast);

        return toast.error(response.data.error);
      });
  };

  return (
    <Animalwrapper>
      <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
        <Toaster />
        <button
          className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
          onClick={handleCloseEvent}
        >
          <i className="fi fi-br-cross"></i>
        </button>

        <div className="max-w-[550px] center">
          <p className="text-dark-grey mb-1">Preview</p>
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
            <img src={banner} alt="bannerimage" />
          </div>
          <h1 className="text-4xl font-medium mt-3 leading-tight line-clamp-2">
            {title}
          </h1>
          <p className="font-gelasio text-xl line-clamp-2 leading-7 mt-4">
            {des}
          </p>
        </div>

        <div className="border-grey lg:pl-8 lg:border-1">
          <p className="text-dark-grey mb-2 mt-9">Blog Title</p>
          <input
            type="text"
            placeholder="Blog Title"
            defaultValue={title}
            className="input-box pl-4"
            onChange={handleBlogTitleChange}
          />
          <p className="text-dark-grey mb-2 mt-9">
            Short description about your blog
          </p>
          <textarea
            maxLength={characterLimit}
            defaultValue={des}
            className="leading-7 h-40 resize-none pl-4 input-box "
            onChange={handleBlogDesChnage}
            onKeyDown={handleTitleKeyDown}
          ></textarea>
          <p className="mt-1 text-dark-grey text-sm text-right">
            {characterLimit - des.length} Characters left
          </p>
          <p className="text-dark-grey mb-2 mt-9">
            Topics - (Helps in searching and ranking your blog post)
          </p>
          <div className="relative input-box pl-2 py-2 p-4">
            <input
              type="text"
              placeholder="Topic"
              className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
              onKeyDown={handlekeyDown}
            />
            {tags.map((tag, i) => {
              return <Tag tag={tag} key={i} />;
            })}
          </div>
          <p className="mt-1 mb-4 text-dark-grey text-right">
            {tagLimit - tags.length} Tags left
          </p>
          <button className="btn-dark px-8" onClick={publishBlog}>
            Publish
          </button>
        </div>
      </section>
    </Animalwrapper>
  );
};
export default PublishForm;
