import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import TrustedBy from "../components/TrustedBy";
import WorkProcess from "../components/WorkProcess";
import TestimonialSlider from "../components/TestimonialSlider";
import Footer from "../components/Footer";
import Services from "../components/Services";
import WebDevelopment from "../components/WebDevelopment";
import UltimosClientes from "../components/UltimosClientes";


import InstagramGallery from "../components/InstragramGallery";

const Home = () => {
  return (
    <div className="bg-black min-h-screen text-white overflow-x-hidden">
      <Navbar />
      <div id="hero">
        <Hero />
      </div>
      <TrustedBy />
      <div id="work-process">
        <WorkProcess />
      </div>
      
      <div id="services">
        <Services />
      </div>
      <WebDevelopment />
     
      <InstagramGallery /> 
      <div id="testimonial-slider">
        <TestimonialSlider />
      </div>
      <UltimosClientes />
      <Footer />
    </div>
  );
};

export default Home;
