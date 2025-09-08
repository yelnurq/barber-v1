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

export default function Home() {
  return (
    <div>
        <Header/>
        <Hero/>
        <Services />
        <Description/>
      {/* <BookingForm /> */}
      {/* <Masters /> */}
      {/* <Reviews /> */}
        <Address/>
        <MapIframe/>
        <Footer/>
    </div>
  );
}
