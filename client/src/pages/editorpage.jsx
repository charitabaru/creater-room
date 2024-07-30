import { createContext, useContext, useState } from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/Blogeditor.component";
import PublishForm from "../components/publishform.component";

const blogStructure = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  des: "",
  author: { personal_info: {} },
};

export const Editorcontext = createContext({});
const Editor = () => {
  const [blog, setBlog] = useState(blogStructure);
  const [Editorstate, setEditorstate] = useState("editor");
  let {
    userAuth: { access_token },
  } = useContext(UserContext);
  return (
    <Editorcontext.Provider value={{blog, setBlog,Editorstate, setEditorstate}}>
    
      {access_token === null ? (
        <Navigate to="/signin" />
      ) : Editorstate == "editor" ? (
        <BlogEditor token={access_token} />
      ) : (
        <PublishForm />
      )}
    </Editorcontext.Provider>
  );
};

export default Editor;
