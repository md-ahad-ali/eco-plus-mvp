import React from "react";
import { FaStar } from "react-icons/fa";

const CustomerReview = () => {
  const reviewOne = (
    <div className="bg-gray-100 shadow-lg p-6 rounded-2xl min-h-[250px] max-w-sm flex flex-col">
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 rounded-full mr-4 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1508341591423-4347099e1f19?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="John Martin"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="font-semibold text-gray-800">John Martin</p>
          <p className="text-sm text-gray-500">Acme Inc.</p>
        </div>
      </div>
      <p className="mb-4 text-gray-800 flex-1">
        Schnell, effizient und professionell. Die Logistikfirma hat all unsere
        Anforderungen erfüllt und dafür gesorgt, dass alles reibungslos
        verläuft. Eine der besten in der Branche.
      </p>
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className="text-yellow-500" />
        ))}
      </div>
    </div>
  );

  const reviewTwo = (
    <div className="bg-[#004F98] shadow-lg p-6 rounded-2xl min-h-[250px] max-w-sm flex flex-col ">
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 rounded-full mr-4 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="John Smith"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="font-semibold text-white">Kathleen Smith</p>
          <p className="text-sm text-blue-200">Beta Corp.</p>
        </div>
      </div>
      <p className="mb-4 text-white flex-1">
        Exzellenter Service! Die Lieferung war schnell und die Ware kam in
        einwandfreiem Zustand an. Wir schätzen die zuverlässige Kommunikation
        und den professionellen Umgang mit unseren Bedürfnissen.
      </p>
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <FaStar key={i} className="text-yellow-300" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="py-6 lg:py-16 container mx-auto">
      <h2 className="text-2xl md:text-3xl font-semibold text-center mb-4 p-4">
        Was unsere Kunden sagen
      </h2>
      <div className="max-w-4xl flex flex-col lg:flex-row justify-center items-center mx-auto gap-4 p-4 ">
        {reviewOne}
        {reviewTwo}
      </div>
    </div>
  );
};

export default CustomerReview;
