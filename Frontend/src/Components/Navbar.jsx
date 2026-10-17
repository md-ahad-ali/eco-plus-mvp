import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="flex items-center justify-between px-4 py-4 shadow-md sticky top-0 bg-white z-30 lg:pr-12">
      {/* Logo */}

      <div className="flex items-center py-2">
        <NavLink to="/">
          <img src={logo} alt="Logo" className="h-10" />
        </NavLink>
      </div>

      {/* Menu Icon */}
      <div
        className="md:hidden text-2xl cursor-pointer ml-6"
        onClick={toggleMenu}
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Navigation Links for Desktop */}
      <div className="hidden md:flex space-x-6 text-gray-800 text-lg ">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `relative hover:text-[#004F98] transition duration-300 ${
              isActive ? "text-[#004F98]  font-semibold border-b-2" : ""
            }`
          }
        >
          Heim
        </NavLink>

        <NavLink
          to="/dienstleistungen"
          className={({ isActive }) =>
            `relative hover:text-[#004F98] transition duration-300 ${
              isActive ? "text-[#004F98] font-semibold border-b-2" : ""
            }`
          }
        >
          Dienstleistungen
        </NavLink>

        <NavLink
          to="/uber-uns"
          className={({ isActive }) =>
            `relative hover:text-[#004F98] transition duration-300 ${
              isActive ? "text-[#004F98] font-semibold border-b-2" : ""
            }`
          }
        >
          über
        </NavLink>
        <NavLink
          to="/impressum-and-datenschutz"
          className={({ isActive }) =>
            `relative hover:text-[#004F98] transition duration-300 ${
              isActive ? "text-[#004F98] font-semibold border-b-2" : ""
            }`
          }
        >
          Impressum & Datenschutz
        </NavLink>
      </div>

      <div>
        <Link
          className="hidden md:block bg-[#004F98] text-white px-6 py-2 font-semibold text-lg rounded-full hover:bg-[#004F98]"
          to="/kontakt"
        >
          Kontakt
        </Link>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 w-full bg-white shadow-lg transform ${
          menuOpen ? "translate-y-0" : "-translate-y-full"
        } transition-transform duration-500 md:hidden`}
      >
        <div className="flex justify-end p-4">
          <FaTimes className="text-2xl cursor-pointer" onClick={toggleMenu} />
        </div>
        <div className="flex flex-col items-center space-y-6 pb-6 text-lg text-gray-800">
          <NavLink to="/" onClick={toggleMenu} className="hover:text-[#004F98]">
          Heim
          </NavLink>
          <NavLink
            to="/dienstleistungen"
            onClick={toggleMenu}
            className="hover:text-[#004F98]"
          >
            Dienstleistugen
          </NavLink>
          <NavLink
            to="/uber-uns"
            onClick={toggleMenu}
            className="hover:text-[#004F98]"
          >
            über
          </NavLink>
          <NavLink to="/impressum-and-datenschutz" onClick={toggleMenu} className="hover:text-blue-600">Impressum & Datenschutz</NavLink>
 

          <div>
            <Link
              className=" bg-[#004F98] text-white px-6 py-2 font-semibold text-lg rounded-full hover:bg-[#004F98]"
              to="/kontakt"
            >
              Kontakt
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
