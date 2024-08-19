import { useContext } from "react";
import { Editorcontext } from "../pages/editorpage";

const Tag = ({ tag }) => {
  let {
    blog,setBlog,blog: { tags },
  } = useContext(Editorcontext);
  const handleTagDelete = () => {
    tags = tags.filter((t) => t != tag);
    setBlog({...blog,tags})
  };
  return (
    <div className="relative p-2 mt-2 mr-2 px-5 rounded-full inline-block bg-white hover:bg-opactiy-50 pr-10">
      <p className="outline-none" contentEditable="true">
        {tag}
      </p>
      <button
        className="mt-[2px] rounded-full absolute right-3 top-1/2 -translate-y-1/2"
        onClick={handleTagDelete}
      >
        <i className="fi fi-br-cross text-sm pointer-events-none"></i>
      </button>
    </div>
  );
};

export default Tag;
