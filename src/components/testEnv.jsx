import React from "react";

const TestEnv = () => {
  return (
    <div>
      <p>URL: {import.meta.env.VITE_SUPABASE_URL || "No definida"}</p>
      <p>KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? "Existe" : "No definida"}</p>
    </div>
  );
};

export default TestEnv;
