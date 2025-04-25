import { motion } from "framer-motion";



const images = [
  {
    src: "https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/instagram//ig.png",
    link: "https://www.instagram.com/p/DHs1tK2IQ16/",
  },
  {
    src: "https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/instagram//ig2.png",
    link: "https://www.instagram.com/p/DHs5SG0oH1j/",
  },
  {
    src: "https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/instagram//ig4%20(1).png",
    link: "https://www.instagram.com/p/DHs5hsnIHo8/",
  },
];

const InstagramGallery = () => {
  return (
    <section className="mt-10 mb-24 px-4 text-center">

      <a href="https://www.instagram.com/threelogicsenterprise/" target="_blank" rel="noopener noreferrer">
      <h2 className="text-4xl font-bold text-white mb-10">
        Síguenos en <span className="text-teal-400">Instagram</span>
      </h2>
      </a>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4
max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        {images.map((img, index) => (
          <motion.a
            key={index}
            href={img.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true, amount: 0.2 }}
            className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
          >
            <div className="relative overflow-hidden">
              <img
                src={img.src}
                alt={`Instagram post ${index + 1}`}
                className="w-full h-72 object-cover transition-transform duration-300 scale-112 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 pointer-events-none rounded-xl"></div>
            </div>
            <div className="p-3 flex items-center justify-between text-sm text-gray-400 bg-black/30 backdrop-blur-md">
              <span className="font-semibold">@ThreeLogics</span>
              <span className="text-xs">Madrid, España</span>
            </div>
          </motion.a>
        ))}
      </motion.div>
    </section>
  );
};

export default InstagramGallery;
