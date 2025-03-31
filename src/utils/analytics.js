// Este archivo se encarga de la configuración y el uso de Google Analytics en la aplicación
import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = "G-K7L148773L";

export const initGA = () => {
  ReactGA.initialize(GA_MEASUREMENT_ID);
};

export const trackPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

export const trackEvent = ({ category, action, label }) => {
  ReactGA.event({ category, action, label });
};
