import BookingForm from "../../components/BookingForm/BookingForm";
import Header from "../../components/Header/Header";
import Masters from "../../components/Masters/Masters";
import Reviews from "../../components/Reviews/Reviews";
import Services from "../../components/Services/Services";
import Hero from "../../components/Hero/Hero";
import Description from "../../components/Description/Description";
import MapIframe from "../../components/MapIframe/MapIframe";
import Footer from "../../components/Footer/Footer";
import Address from "../../components/Address/Address";
import About from "../../components/About/About";

export default function Home() {
  return (
    <div>
        <Header/>
        <Hero/>
        <Services />
        <Description/>
        <About/>
      {/* <BookingForm /> */}
      {/* <Masters /> */}
      {/* <Reviews /> */}
        <Address/>
        <MapIframe/>
        <Footer/>
    </div>
  );
}
