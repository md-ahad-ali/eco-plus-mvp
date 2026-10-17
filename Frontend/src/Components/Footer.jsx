import React from "react";
import { FaRegCopyright } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosMail } from "react-icons/io";
import { IoCall } from "react-icons/io5";

const Footer = () => {
  return (
    <div>

      <footer className="bg-[#004F98] text-white py-10 px-6 md:px-16 ">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-b pb-6 mt-12  pt-10">

        <div className="flex flex-col justify-center text-center items-center md:items-start md:text-left">
            <h2 className="font-bold text-lg mb-2">BY Transport</h2>
            <p className="mb-2 flex items-center gap-x-3"><IoCall className="text-xl" /> +49 4154 5924016</p>
            <a
              href="mailto:info@by-transport.de"
              className="text-blue-100 underline mb-2 flex items-center gap-x-3"
            >
             <IoIosMail className="text-2xl" /> info@by-transport.de
            </a>
            <p className="mb-1 flex items-center gap-x-3"><FaLocationDot className="text-xl" /> Voltastr. 10, 63457 Hanau, Germany.</p>
            
          </div>

          {/* Left Section */}
          <div className=" text-center">
            
            <p className="text-lg font-semibold">Firma</p>
            <p className="mt-3">über</p>
            <p className="mt-2">Dienstleistungen</p>
            <p className="mt-2">Kontakt</p>
          </div>

          {/* Right Section */}
          <div className="flex flex-col justify-center">
            <h3 className="font-bold mb-3">Newsletter</h3>
            <label htmlFor="email" className="mb-2">
              Ihre E-Mail-Adresse
            </label>
            <input
              type="email"
              id="email"
              placeholder="Geben Sie Ihre E-Mail ein"
              className="px-3 py-2 rounded-md text-black mb-3 focus:outline-none bg-white"
            />
            <button className="bg-[#020d17] hover:bg-[#262946] text-white font-medium py-2 px-4 rounded-full">
              Anfrage jetzt senden
            </button>
          </div>
        </div>

        <p className="text-center mt-2 ">© BY Transport. Alle Rechte vorbehalten</p>
      </footer>
    </div>
  );
};

export default Footer;
