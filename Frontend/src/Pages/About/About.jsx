import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ContactForm from "../../Components/ContactForm";

const About = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Carousel images
  const images = [
    "https://images.unsplash.com/photo-1518527989017-5baca7a58d3c?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.pexels.com/photos/167676/pexels-photo-167676.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/1211787/pexels-photo-1211787.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/3057963/pexels-photo-3057963.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/30671086/pexels-photo-30671086/free-photo-of-majestic-cranes-at-cadiz-port-spain.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  ];

  // Modal handlers
  const openModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage("");
  };

  // Carousel handlers
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Simple upward motion variant
  const upwardMotion = {
    initial: { y: 10 },
    animate: { y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <div className="py-10 lg:py-16 container mx-auto w-[95%]">
      {/* Text Section */}
      <motion.div
        className="flex flex-col md:flex-row items-center justify-between mb-20"
        {...upwardMotion}
      >
        <div className="leading-7 text-md text-center max-w-4xl w-full mx-auto">
          <motion.h1
            className="font-md text-3xl lg:text-4xl mb-4 text-center tracking-wide "
            {...upwardMotion}
          >
            Ihr zuverlässiger Partner für Transport und Logistik
          </motion.h1>
          <motion.p
            className="text-[#004F98] mb-4 w-full text-center font-light"
            {...upwardMotion}
          >
            Seit 2006 bieten wir umfassende Import- und Exportdienstleistungen
            an und haben uns auf Osteuropa spezialisiert. Vertrauen Sie auf
            unsere maßgeschneiderten Lösungen für Ihre Transportbedürfnisse
          </motion.p>
          <Link to="/kontakt">
            <motion.button
              className="p-2 bg-[#004F98] rounded-4xl w-40 text-white cursor-pointer transition duration-300"
              {...upwardMotion}
            >
              Kontakt
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Carousel Section */}
      <motion.h1
        className="text-4xl md:text-4xl font-medium text-center tracking-wide"
        {...upwardMotion}
      >
        Maßgeschneiderte Transportlösungen
      </motion.h1>
      <motion.p
        className="text-center mb-8 text-[#004F98] pb-6 pt-6"
        {...upwardMotion}
      >
        Bereitstellung von Transport-, Logistik- und Zollabfertigungslösungen
        seit 2006
      </motion.p>

      <motion.div
        className="relative w-full h-[55vh] mx-auto overflow-hidden mb-8"
        {...upwardMotion}
      >
        {/* Slider Container */}
        <motion.div
          className="flex transition-transform duration-300 h-full w-full "
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="min-w-full h-full relative">
              <img
                src={image}
                alt={`Gallery Image ${index + 1}`}
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity rounded-2xl"
                onClick={() => openModal(image)}
              />
            </div>
          ))}
        </motion.div>

        {/* Prev Button */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </motion.div>

      {/* Modal */}
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          {...upwardMotion}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeModal}
          ></div>

          {/* Modal Content */}
          <motion.div
            className="bg-white p-4 md:p-6 rounded-lg shadow-2xl z-10 max-w-3xl mx-4 relative"
            {...upwardMotion}
          >
            {/* Close Button */}
            <button
              className="absolute -top-3 -right-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-20"
              onClick={closeModal}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal Image */}
            <img
              src={selectedImage}
              alt="Selected"
              className="max-h-[80vh] w-auto object-contain rounded-lg"
            />
          </motion.div>
        </motion.div>
      )}
      <div>
        <ContactForm />
      </div>
    </div>
  );
};

export default About;
