import { motion } from "framer-motion";

const images = [
  {
    src: "https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/instagram/1Insta.webp",
    link: "https://www.instagram.com/p/DGLmI0yo5BQ/",
  },
  {
    src: "https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/instagram/2Insta.webp",
    link: "https://www.instagram.com/p/DGLmo2qoq3w/",
  },
  {
    src: "https://cazaomhrosdojmlbweld.supabase.co/storage/v1/object/public/instagram/3Insta.webp",
    link: "https://www.instagram.com/p/DGLnDC0IyC7/",
  },
];
const InstagramGallery = () => {

  
  return (
    <div className="my-16 flex justify-center">
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: false, amount: 0.2 }}
      >
        {images.map((img, index) => (
          <motion.a
            key={index}
            href={img.link} // Enlace dinámico
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: false, amount: 0.2 }}
            className="relative group overflow-hidden rounded-2xl bg-gray-900 shadow-2xl border border-gray-700 p-4 block"
          >
            <motion.img
              src={img.src}
              alt={`Instagram post ${index + 1}`}
              className="w-75 h-100 object-cover rounded-xl transition-transform duration-300 transform group-hover:scale-105"
              whileHover={{ scale: 1.1 }}
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-xl"></div>
          </motion.a>
        ))}
      </motion.div>
    </div>
  );
};

export default InstagramGallery;
