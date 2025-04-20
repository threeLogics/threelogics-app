import { motion } from "framer-motion";
import githubLogo from "../assets/github1.png";
import trelloLogo from "../assets/logotrello.webp";
import notionLogo from "../assets/notion1.webp";
import visualLogo from "../assets/vsc.webp";
import davanteLogo from "../assets/davante.webp";

const logos = [
  { src: githubLogo, alt: "GitHub", name: "GitHub" },
  { src: trelloLogo, alt: "Trello", name: "Trello" },
  { src: notionLogo, alt: "Notion", name: "Notion" },
  { src: visualLogo, alt: "VS Code", name: "VS Code" },
  { src: davanteLogo, alt: "Davante", name: "Davante" },
];

export default function TrustedBy() {
  return (
    <section className="py-16 bg-black text-gray-400">
      <div className="max-w-7xl mx-auto text-center px-6">
        <p className="text-lg uppercase tracking-wide mb-8 text-gray-300">
          Trusted by teams at
        </p>

        {/* Contenedor de logos con animación */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 place-items-center">
          {logos.map((logo) => (
            <motion.div
              key={logo.alt}
              className="flex flex-col items-center group"
              whileHover={{ scale: 1.1 }}
            >
              <motion.img
                src={logo.src}
                alt={logo.alt}
                className="h-12 sm:h-14 md:h-16 grayscale transition-all duration-500 group-hover:grayscale-0"
                whileHover={{ opacity: 1 }}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 0.8 }}
                transition={{ duration: 0.5 }}
                loading="lazy"
              />
              <motion.p
                className="mt-2 text-sm sm:text-base transition-all duration-300 group-hover:text-white"
                whileHover={{ scale: 1.05 }}
              >
                {logo.name}
              </motion.p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
