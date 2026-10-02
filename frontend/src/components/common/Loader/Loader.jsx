import { LoaderCircle } from "lucide-react";
import "./Loader.css";

function Loader({ text = "Loading..." }) {
  return (
    <div className="common-loading">
      <div className="common-loader-spinner">
        <LoaderCircle size={42} />
      </div>

      <p>{text}</p>
    </div>
  );
}

export default Loader;
