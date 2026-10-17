import React from "react";

const ContactForm = () => {
  return (
    <div className="bg-white container mx-auto flex p-4 lg:p-0">
      <div className="container mx-auto lg:px-24 py-8 flex flex-col md:flex-row items-start justify-between lg:gap-8 ">
        {/* Left Column: Contact Form */}
        <div className="w-full lg:w-1/3 space-y-6  pb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Nehmen Sie <span className="text-[#004F98]">Kontakt auf</span>
          </h2>
          <p className="text-gray-600">
            Enim tempor eget pharetra facilisis sed maecenas adipiscing. Eu leo
            molestie vel, ornare non id blandit netus --- "Wir helfen Ihnen
            gerne mit dem Transport und der Zollabfertigung.
          </p>

          <form className="space-y-4">
            <div>
              <input
                id="name"
                type="text"
                placeholder="Name"
                required
                className="w-full border border-gray-200 rounded  px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 "
              />
            </div>

            <div>
              <input
                id="email"
                type="email"
                placeholder="E-Mail"
                required
                className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 "
              />
            </div>

            <div>
              <input
                id="phone"
                type="tel"
                placeholder="Telefonnummer"
                required
                className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <textarea
                id="message"
                rows={4}
                placeholder="Nachricht"
                required
                className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="bg-[#004F98] text-white px-6 py-2 rounded-full hover:bg-[#004F98] transition-colors duration-300 w-full cursor-pointer "
            >
              senden
            </button>
          </form>
        </div>

        {/* Right Column: Map */}
        <div className="w-full lg:w-1/2 lg:h-[450px] h-[300px] md:pl-8">
          <iframe
            title="Google Maps"
            className="w-full h-full rounded-2xl"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2558.647562799119!2d8.923972176076921!3d50.1116034117042!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd16f3888c6e61%3A0x4b591067472f85d4!2sVoltastra%C3%9Fe%2010%2C%2063457%20Hanau%2C%20Germany!5e0!3m2!1sen!2sbd!4v1740951071499!5m2!1sen!2sbd"
            allowFullScreen={true}
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
