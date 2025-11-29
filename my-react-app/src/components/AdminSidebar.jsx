import { Link, useLocation } from "react-router-dom";
import { FiLogOut, FiGrid, FiFileText } from "react-icons/fi";

const AdminSidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/projects-dashboard", label: "Projects", icon: FiGrid },
    { path: "/task-submissions", label: "All Submissions", icon: FiFileText },
    { path: "/admin-dashboard", label: "Logout", icon: FiLogOut, danger: true },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-md border-r border-gray-200 text-gray-800 w-64 min-h-screen p-6 shadow-xl flex flex-col">
      {/* Logo / Title */}
      <h2 className="text-2xl font-extrabold tracking-tight mb-10 text-indigo-700">
        Admin Panel
      </h2>

      {/* Navigation */}
      <ul className="space-y-3 flex-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm"
                    : "hover:bg-gray-100 text-gray-700"
                } ${item.danger ? "hover:bg-red-100 hover:text-red-600" : ""}`}
              >
                <Icon
                  size={22}
                  className={`${
                    isActive
                      ? "text-indigo-600"
                      : item.danger
                      ? "text-red-500"
                      : "text-gray-500 group-hover:text-indigo-500"
                  }`}
                />
                <span
                  className={`${
                    isActive
                      ? "text-indigo-700 font-semibold"
                      : item.danger
                      ? "text-red-500"
                      : "text-gray-700"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="mt-6 text-xs text-gray-400 text-center">
        © {new Date().getFullYear()} Admin Panel
      </div>
    </div>
  );
};

export default AdminSidebar;
