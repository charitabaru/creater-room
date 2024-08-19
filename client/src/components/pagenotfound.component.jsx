import pageNotFoundImage from "../imgs/404.png";
import { Link } from "react-router-dom";
import logo from "../imgs/logo.png"

const PageNotFound = () => {
  return (
    <section className="h-cover p-10 flex flex-col relative items-center gap-20 text-center">
      <img
        src={pageNotFoundImage}
        className="select-none border-2 border-grey w-72 aspect-square object-cover rounded"
      />
      <h1 className="text-4xl leading-7 font-gelasio">Pgae Not Found..!!</h1>
      <p className="text-dark-grey text-xl leading-7 -mt-8">
        The page you are looking for doesn't exist. Head back to the{" "}
        <Link to={"/"} className="text-black underline">
          Home Page
        </Link>
      </p>

      <div className="mt-auto">
        <img src={logo} className="h-10 object-contain block mx-auto select-none"/>
        <p className="text-dark-grey mt-5">Read Milions of Stories around the world from here</p>
      </div>
    </section>
  );
};

export default PageNotFound;
