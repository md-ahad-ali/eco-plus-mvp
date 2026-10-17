import React from "react";
import { motion } from "framer-motion";

const Banner = () => {
  return (
    <div
      className="relative w-full h-screen flex items-center justify-center text-white text-center p-8"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1617952740732-26b1904d6853?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
      ></div>

      <div className="relative p-6 rounded-xl max-w-2xl">
        <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4">
          Ultimative Lösungen für Ihre Geschäftsträume
        </h1>
        <p className="text-lg mb-6">
          Wir bieten erstklassige Lösungen im Bauwesen und in der Entwicklung.
        </p>
      </div>
    </div>
  );
};

export default Banner;
