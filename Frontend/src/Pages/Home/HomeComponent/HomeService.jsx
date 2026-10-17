import React, { useEffect } from "react";

const HomeService = () => {
    // useEffect(() => {
    //   window.scrollTo({ top: 0, behavior: "smooth" });
    // }, []);

  return (
    <div className="relative w-full flex flex-col items-center text-white ">
      {/* Background Image */}
      <div className="w-full h-[350px] relative">
        <img
          src="https://www.constructionworld.in/assets/uploads/20f5aa8f827629e9ddb6f62b289002d5.jpg"
          alt="Shipping"
          className="w-full h-full object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/30 flex items-center justify-center p-6">
          <h1 className="absolute inset-0 flex items-center justify-center text-4xl font-bold  text-center">
            Unsere Dienstleistungen
          </h1>
        </div>
      </div>

      {/* Content Card */}
      <div className="relative bg-white text-black p-3 md:p-10 rounded-3xl text-left  max-w-4xl flex flex-col md:flex-row -mt-24 mx-3 md:mx-0">
        {/* Service Texts */}
        <div className="flex-1 p-4">
          <h2 className="text-xl font-bold">Zollabfertigung</h2>
          <p className="text-gray-600 mb-4">
            Professionelle Unterstützung bei der Zollabfertigung und der
            Vorbereitung der Begleitdokumente
          </p>

          <h2 className="text-xl font-bold">Lagerung & Verpackung</h2>
          <p className="text-gray-600 mb-4">
            Sichere Verpackung und Lagerung Ihrer Waren für einen reibungslosen
            Transport.
          </p>

          <h2 className="text-xl font-bold">Transportvermittlung </h2>
          <p className="text-gray-600">
            Effiziente Transportvermittlung für Ihre Waren in Osteuropa.
          </p>
        </div>

        {/* Service Images */}
        <div className="flex-1 p-4 flex flex-col gap-4 relative">
          <img
            src="https://media.istockphoto.com/id/486570435/photo/crane-lifting-up-container-in-yard.jpg?s=612x612&w=0&k=20&c=L3fiF5bi6rN8FdA3mdD7w7oCgXBHar6UvcqKGZZ9OyI="
            alt="Shipping"
            className="rounded-lg w-full"
          />
          <img
            src="https://media.istockphoto.com/id/1250035520/photo/foreman-holding-document-walking-and-checking-the-containers-box-from-cargo-ship-for-export.jpg?s=612x612&w=0&k=20&c=UYv1k-mjHCdFUEWORzSCSf5TtlW234D7kd0tyozCWwQ="
            alt="Packing"
            className="border-8 border-white w-[220px]  absolute -bottom-3 -left-5"
          />
        </div>
      </div>
    </div>
  );
};

export default HomeService;
