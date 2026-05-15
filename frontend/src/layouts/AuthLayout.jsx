import { Link, Outlet } from "react-router-dom";
import { Logo } from "../components/ui/Primitives";
import { MeshBackground } from "../components/ui/Background";

export default function AuthLayout() {
  return (
    <MeshBackground className="grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Outlet />
        <div className="mt-8 flex justify-center gap-4 text-sm text-slate-500">
          <Link className="hover:text-cyan-100" to="/login">Login</Link>
          <span>/</span>
          <Link className="hover:text-cyan-100" to="/register">Register</Link>
        </div>
      </div>
    </MeshBackground>
  );
}

