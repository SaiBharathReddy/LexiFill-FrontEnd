import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-indigo-600 mb-4">LexiFill</h1>
      <Outlet />
    </div>
  );
}
