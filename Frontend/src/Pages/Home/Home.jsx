import React, { useEffect } from "react";
import Banner from "./HomeComponent/Banner";
import PartnerAbout from "./HomeComponent/PartnerAbout";
import HomeService from "./HomeComponent/HomeService";
import CustomerReview from "../../Components/CustomerReview";
import ContactForm from "../../Components/ContactForm";
const Home = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <div>
      <Banner></Banner>
      <PartnerAbout></PartnerAbout>
      <HomeService></HomeService>
      <CustomerReview />
      <ContactForm />
    </div>
  );
};

export default Home;
