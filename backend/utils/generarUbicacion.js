import supabase from "../supabaseClient.js";

export const generarUbicacion = async (productoId, userId) => {
  try {
    // 🔍 Buscar si el producto ya tiene una ubicación
    const { data: ubicacionExistente, error: errorUbicacion } = await supabase
      .from("ubicaciones")
      .select("*")
      .eq("producto_id", productoId)
      .single();

    if (errorUbicacion && errorUbicacion.code !== "PGRST116") {
      console.error("❌ Error al verificar ubicación:", errorUbicacion);
      return null;
    }

    // ✅ Si el producto ya tiene una ubicación, devolverla
    if (ubicacionExistente) {
      console.log("🔄 Producto ya tiene ubicación:", ubicacionExistente);
      return ubicacionExistente;
    }

    // 🔍 Obtener configuración inicial del usuario
    const { data: configUsuario, error: errorConfig } = await supabase
      .from("usuario_ubicaciones")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (errorConfig || !configUsuario) {
      console.error(
        "❌ Error al obtener configuración del usuario:",
        errorConfig
      );
      return null;
    }

    // 🆕 Generar ubicación basada en la configuración del usuario
    const ubicacionNueva = {
      almacen: configUsuario.almacen,
      estanteria: String(Math.floor(Math.random() * 20 + 1)).padStart(2, "0"),
      posicion: String(Math.floor(Math.random() * 10 + 1)).padStart(2, "0"),
      altura: String(Math.floor(Math.random() * 5)).padStart(2, "0"),
      producto_id: productoId,
    };

    const { data, error } = await supabase
      .from("ubicaciones")
      .insert([ubicacionNueva])
      .select()
      .single();

    if (error) {
      console.error("❌ Error al generar nueva ubicación:", error);
      return null;
    }

    console.log("✅ Nueva ubicación generada:", data);
    return data;
  } catch (error) {
    console.error("❌ Error en `generarUbicacion`:", error);
    return null;
  }
};
