import React from "react";
import { motion } from "framer-motion";
const images = [
  "https://images.pexels.com/photos/30671086/pexels-photo-30671086/free-photo-of-majestic-cranes-at-cadiz-port-spain.jpeg?auto=compress&cs=tinysrgb&w=576&dpr=1",
  "https://images.pexels.com/photos/1427541/pexels-photo-1427541.jpeg?auto=compress&cs=tinysrgb&w=576&dpr=1",
  "https://images.pexels.com/photos/14400831/pexels-photo-14400831.jpeg?auto=compress&cs=tinysrgb&w=576&dpr=1",
];
// Motion variant for a smooth fade and slide-up
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};
const PartnerAbout = () => {
  return (
    <div className="bg-white">
      {/* About Us Section */}
      <section className="container px-4 lg:px-16 py-16 md:py-24 flex flex-col md:flex-row gap-8 mx-auto">
        {/* Left Column: Text */}
        <motion.div {...fadeInUp} className="md:w-1/2 w-full">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center lg:text-left">
            Über unser Unternehmen
          </h2>
          <p className="text-gray-700 text-lg mb-6 text-center lg:text-left">
            Mit Zugang zu großen Lieferanten und Herstellern weltweit.
          </p>
          <div className="w-full flex items-center justify-center lg:justify-start">
            <button className="bg-[#004F98] text-white px-8 py-3 rounded-full hover:bg-[#004F98] transition duration-300">
              Mehr Erfahren
            </button>
          </div>
        </motion.div>

        {/* Right Column: 3 Rounded Square Images */}
        <motion.div {...fadeInUp} className="md:w-1/2 grid grid-cols-3 gap-2">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Partner ${index + 1}`}
              className="w-full h-64 object-cover rounded-xl shadow-lg"
            />
          ))}
        </motion.div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto ">
          <div className="relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
            {/* Image Container */}
            <img
              src="https://images.unsplash.com/photo-1587149185211-28a2ef4c9a10?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Mission background"
              className="w-full h-64 md:h-96 object-cover"
            />

            {/* Text Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/30 flex items-center justify-center p-6">
              <div className="text-center space-y-4 md:space-y-6 text-white">
                <motion.h2
                  {...fadeInUp}
                  className="text-xl md:text-4xl font-bold drop-shadow-md"
                >
                  UNSERE MISSION
                </motion.h2>
                <motion.p
                  {...fadeInUp}
                  className="text-md md:text-xl max-w-2xl mx-auto drop-shadow-md leading-relaxed"
                >
                  UNSERE MISSION ist es, erstklassige Qualität und
                  Dienstleistungen allen unseren wertvollen Kunden zu bieten und
                  stets innovativ und aufmerksam auf dem Markt zu sein, den wir
                  bedienen.
                </motion.p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartnerAbout;
