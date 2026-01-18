import LoginComponent from "../../components/LoginComponent";
import ThemeToggle from "../../components/ThemeToggle";

export default function LoginPage() {
  return (
    <div>
      <header className="bg-base-100 shadow-sm">
        <div className="navbar max-w-7xl mx-auto px-4 lg:px-8">
          {/* Left */}
          <div className="navbar-start">
            <div className="dropdown">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost lg:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h8m-8 6h16"
                  />
                </svg>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-10 p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <a href="#home">Home</a>
                </li>
                <li>
                  <a href="#about">About</a>
                </li>
                <li>
                  <a href="#company">Company</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
              </ul>
            </div>
            <a href="/" className="btn btn-ghost text-xl normal-case">
              Placement Cell RVU
            </a>
          </div>

          {/* Center */}
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
              <li>
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#company">Company</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </div>

          {/* Right */}
          <div className="navbar-end mr-2">
            <a href="/login" className="btn btn-outline btn-primary">
              Login
            </a>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <LoginComponent />
    </div>
  );
}
