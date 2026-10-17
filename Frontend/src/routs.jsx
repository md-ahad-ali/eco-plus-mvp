import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./Pages/Home/Home";
import About from "./Pages/About/About";
import Contact from "./Pages/Contact/Contact";
import Services from "./Pages/Services/Services";
import PrivacyPolicy from "./Pages/PrivacyPolicy/PrivacyPolicy";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App></App>,
    children: [
      {
        path: "/",
        element: <Home></Home>,
      },
      // About us
      {
        path: "/uber-uns",
        element: <About></About>,
      },
      // contact
      {
        path: "/kontakt",
        element: <Contact></Contact>,
      },
      // Services
      {
        path: "/dienstleistungen",
        element: <Services></Services>,
      },
      {
        path: "/impressum-and-datenschutz",
        element: <PrivacyPolicy></PrivacyPolicy>,
      },
    ],
  },
]);
