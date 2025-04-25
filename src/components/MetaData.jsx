import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

const MetaData = ({ 
  title, 
  description, 
  imageUrl, 
  keywords = "gestión de almacenes, software para pymes, logística, optimización de inventarios, transformación digital", 
  imageWidth = "1200", 
  imageHeight = "630" 
}) => {
  const location = useLocation();
  const currentUrl = `https://threelogicsapp.vercel.app${location.pathname}`;

  // Valores por defecto para metadatos
  const defaultTitle = title || "ThreeLogics | Gestión de Almacenes para PYMES";
  const defaultDescription = description || "Optimiza tu logística con ThreeLogics, el software de gestión de almacenes para pymes.";
  const defaultImage = imageUrl || "https://threelogicsapp.vercel.app/og-image.png";

  return (
    <Helmet>
      <title>{defaultTitle}</title>
      <meta name="description" content={defaultDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="ThreeLogics - Iker Domínguez, Adrián Vaquero, Daniel Ramiro" />
      <meta name="robots" content="index, follow" />

      {/* Open Graph */}
      <meta property="og:title" content={defaultTitle} />
      <meta property="og:description" content={defaultDescription} />
      <meta property="og:image" content={defaultImage} />
      <meta property="og:image:width" content={imageWidth} />
      <meta property="og:image:height" content={imageHeight} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content="website" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={defaultTitle} />
      <meta name="twitter:description" content={defaultDescription} />
      <meta name="twitter:image" content={defaultImage} />

      {/* JSON-LD Schema for Organization */}
      <script type="application/ld+json">
        {`
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "ThreeLogics",
          "url": "${currentUrl}",
          "logo": "${defaultImage}",
          "description": "Software de gestión de almacenes para PYMES que optimiza procesos logísticos, automatiza inventarios y mejora la eficiencia operativa.",
          "sameAs": [
            "https://github.com/ThreeLogics",
            "https://www.instagram.com/threelogicsenterprise"
          ]
        }
        `}
      </script>
    </Helmet>
  );
};

export default MetaData;
