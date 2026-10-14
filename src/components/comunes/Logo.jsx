import { logo } from "@/data/logo";
import { useNavigate } from "react-router-dom";

function Logo() {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center gap-2 select-none cursor-pointer"
      onClick={() => {
        navigate("/");
      }}
    >
      <div className="w-7 h-7">
        <img
          src={logo.src}
          alt={logo.alt}
          width={500}
          height={500}
          className="object-center w-full h-full"
        />
      </div>
      <span className="text-xl tracking-tight text-black font-semibold font-poppins">
        CRM inmobitwo
      </span>
    </div>
  );
}

export default Logo;
