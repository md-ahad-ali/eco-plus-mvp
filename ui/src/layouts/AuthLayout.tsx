import { Outlet } from "react-router";
import { Leaf } from "lucide-react";

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="rounded-xl bg-green-600 p-3 text-white">
            <Leaf size={28} />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-wide text-gray-900">EcoPulse</h1>
            <p className="text-xs text-gray-500">Smart Energy Management</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
