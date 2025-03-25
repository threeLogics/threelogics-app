import express from "express";
import supabase from "../supabaseClient.js";
import { verificarToken } from "../middleware/authMiddleware.js";
import multer from "multer";
import csvParser from "csv-parser";
import fs from "fs";
import { Parser } from "json2csv";
import { generarUbicacion } from "../utils/generarUbicacion.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.get("/descargar-plantilla", (req, res) => {
  const fields = [
    "nombre",
    "descripcion",
    "precio",
    "cantidad",
    "categoriaNombre",
  ];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse([]);

  res.header("Content-Type", "text/csv");
  res.attachment("plantilla_productos.csv");
  res.send(csv);
});

// ✅ Endpoint para subir productos desde CSV
router.post(
  "/cargar-csv",
  verificarToken,
  upload.single("archivo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: "No se ha subido ningún archivo." });
      }

      const productos = [];

      fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on("data", (row) => {
          productos.push(row);
        })
        .on("end", async () => {
          fs.unlinkSync(req.file.path); // Eliminamos el archivo después de procesarlo

          const errores = [];
          const productosProcesados = [];

          for (const prod of productos) {
            const { nombre, descripcion, precio, cantidad, categoriaNombre } =
              prod;

            if (!nombre || !precio || !cantidad) {
              errores.push({
                producto: nombre,
                error: "Faltan campos obligatorios",
              });
              continue;
            }

            // 🔍 Buscar o crear la categoría
            let { data: categoriaExistente } = await supabase
              .from("categorias")
              .select("id")
              .eq("nombre", categoriaNombre)
              .single();

            let categoria_id = categoriaExistente
              ? categoriaExistente.id
              : null;

            if (!categoria_id) {
              const { data: nuevaCategoria, error: errorCategoria } =
                await supabase
                  .from("categorias")
                  .insert([
                    { nombre: categoriaNombre, user_id: req.usuario.id },
                  ])
                  .select("id")
                  .single();

              if (errorCategoria) {
                errores.push({
                  producto: nombre,
                  error: "Error al crear la categoría",
                });
                continue;
              }

              categoria_id = nuevaCategoria.id;
            }

            // 🔄 Buscar si el producto ya existe
            const { data: productoExistente } = await supabase
              .from("productos")
              .select("id")
              .eq("nombre", nombre)
              .single();

            let productoId;

            if (productoExistente) {
              // 🔄 Si el producto ya existe, lo actualizamos
              const { error: errorUpdate } = await supabase
                .from("productos")
                .update({ descripcion, precio, cantidad, categoria_id })
                .eq("id", productoExistente.id);

              if (errorUpdate) {
                errores.push({
                  producto: nombre,
                  error: "Error al actualizar",
                });
                continue;
              }

              productoId = productoExistente.id;
            } else {
              // ➕ Si no existe, lo insertamos como nuevo
              const { data: nuevoProducto, error: errorInsert } = await supabase
                .from("productos")
                .insert([
                  {
                    nombre,
                    descripcion,
                    precio,
                    cantidad,
                    categoria_id,
                    user_id: req.usuario.id,
                  },
                ])
                .select("id")
                .single();

              if (errorInsert) {
                errores.push({ producto: nombre, error: "Error al insertar" });
                continue;
              }

              productoId = nuevoProducto.id;
            }

            // 🔹 Verificar si el producto ya tiene una ubicación
            const { data: ubicacionExistente } = await supabase
              .from("ubicaciones")
              .select("id")
              .eq("producto_id", productoId)
              .maybeSingle();

            if (!ubicacionExistente) {
              // 🔥 Generar ubicación basada en la configuración del usuario
              const nuevaUbicacion = await generarUbicacion(
                productoId,
                req.usuario.id
              );

              if (!nuevaUbicacion) {
                console.error(
                  `❌ Error al generar ubicación para el producto ID: ${productoId}`
                );
              }
            }

            productosProcesados.push(nombre);
          }

          res.json({
            mensaje: "Carga completada",
            productosProcesados,
            errores,
          });
        });
    } catch (error) {
      console.error("❌ Error al procesar CSV:", error);
      res.status(500).json({ error: error.message });
    }
  }
);
// ✅ Crear un nuevo producto
router.post("/", verificarToken, async (req, res) => {
  try {
    let {
      nombre,
      descripcion,
      precio,
      cantidad,
      categoria_id,
      categoriaNombre,
    } = req.body;

    if (!nombre || !precio || cantidad === undefined) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios." });
    }

    // 🔍 Buscar o crear la categoría
    if (!categoria_id && categoriaNombre) {
      const { data: categoriaExistente } = await supabase
        .from("categorias")
        .select("id")
        .eq("nombre", categoriaNombre)
        .single();

      if (categoriaExistente) {
        categoria_id = categoriaExistente.id;
      } else {
        const { data: nuevaCategoria, error: errorCategoria } = await supabase
          .from("categorias")
          .insert([{ nombre: categoriaNombre, user_id: req.usuario.id }])
          .select()
          .single();

        if (errorCategoria) throw errorCategoria;
        categoria_id = nuevaCategoria.id;
      }
    }

    if (!categoria_id) {
      return res
        .status(400)
        .json({ error: "No se pudo determinar una categoría válida." });
    }

    // 🔄 Verificar si el producto con el mismo `nombre` y `descripcion` ya existe
    const { data: productoExistente } = await supabase
      .from("productos")
      .select("id, descripcion")
      .eq("nombre", nombre)
      .single();

    let productoId;

    if (productoExistente) {
      if (productoExistente.descripcion === descripcion) {
        // ✅ Si la descripción es la misma, actualizar el producto
        const { error: errorUpdate } = await supabase
          .from("productos")
          .update({
            precio,
            cantidad,
            categoria_id,
          })
          .eq("id", productoExistente.id);

        if (errorUpdate) throw errorUpdate;

        productoId = productoExistente.id;
      } else {
        // ➕ Si la descripción es diferente, crear un nuevo producto
        const { data: nuevoProducto, error: errorInsert } = await supabase
          .from("productos")
          .insert([
            {
              nombre,
              descripcion,
              precio,
              cantidad,
              categoria_id,
              user_id: req.usuario.id,
            },
          ])
          .select()
          .single();

        if (errorInsert) throw errorInsert;

        productoId = nuevoProducto.id;
      }
    } else {
      // ➕ Si no existe, crear un nuevo producto
      const { data: nuevoProducto, error: errorInsert } = await supabase
        .from("productos")
        .insert([
          {
            nombre,
            descripcion,
            precio,
            cantidad,
            categoria_id,
            user_id: req.usuario.id,
          },
        ])
        .select()
        .single();

      if (errorInsert) throw errorInsert;

      productoId = nuevoProducto.id;
    }

    // 🔥 Generar ubicación basada en la configuración del usuario
    const ubicacion = await generarUbicacion(productoId, req.usuario.id);
    console.log("✅ Ubicación asignada:", ubicacion);

    // 🔍 Recuperamos el producto completo después de crearlo/actualizarlo
    const { data: productoCompleto, error: errorProducto } = await supabase
      .from("productos")
      .select("*")
      .eq("id", productoId)
      .single();

    if (errorProducto || !productoCompleto) {
      return res
        .status(500)
        .json({ error: "No se pudo recuperar el producto creado." });
    }

    // ✅ Devolvemos el producto completo con su ubicación
    res.status(201).json({ producto: productoCompleto, ubicacion });
  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Obtener productos (admin ve todos, cliente solo los suyos)
router.get("/", verificarToken, async (req, res) => {
  try {
    // 1. Obtener productos (según el rol)
    let query = supabase
      .from("productos")
      .select(
        "id, nombre, descripcion, precio, cantidad, categoria_id, user_id, categorias(nombre)"
      );

    if (req.usuario.rol !== "admin") {
      query = query.eq("user_id", req.usuario.id);
    }

    const { data: productos, error } = await query;
    if (error) throw error;

    // 2. Si eres admin, buscar los nombres de los creadores
    if (req.usuario.rol === "admin") {
      const idsUnicos = [...new Set(productos.map((p) => p.user_id))];

      const { data: allUsers, error: errorUsers } =
        await supabase.auth.admin.listUsers();

      if (errorUsers) throw errorUsers;

      // Mapeamos los IDs a nombres desde user_metadata
      const mapaUsuarios = {};
      allUsers.users.forEach((u) => {
        mapaUsuarios[u.id] = u.user_metadata?.nombre || "Sin nombre";
      });

      // Enriquecer los productos con nombre del creador
      const productosConNombre = productos.map((p) => ({
        ...p,
        creador_nombre: mapaUsuarios[p.user_id] || "Desconocido",
      }));

      return res.json(productosConNombre);
    }

    // 3. Si no eres admin, devuelves productos tal cual
    res.json(productos);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Obtener un producto por ID
router.get("/:id", verificarToken, async (req, res) => {
  try {
    const { data: producto } = await supabase
      .from("productos")
      .select("*, categorias(nombre)")
      .eq("id", req.params.id)
      .single();

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(producto);
  } catch (error) {
    console.error("❌ Error al obtener producto:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Actualizar un producto (Solo el dueño o el admin pueden modificarlo)
router.put("/:id", verificarToken, async (req, res) => {
  try {
    const { data: producto } = await supabase
      .from("productos")
      .select("id, user_id")
      .eq("id", req.params.id)
      .single();

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Solo el dueño del producto o el admin pueden actualizarlo
    if (req.usuario.rol !== "admin" && producto.user_id !== req.usuario.id) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para modificar este producto" });
    }

    const { nombre, descripcion, precio, cantidad, categoria_id } = req.body;

    const { error } = await supabase
      .from("productos")
      .update({ nombre, descripcion, precio, cantidad, categoria_id }) // ✅ Corregido `categoriId` → `categoria_id`
      .eq("id", req.params.id);

    if (error) throw error;

    res.json({ mensaje: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Eliminar un producto
router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const { data: producto } = await supabase
      .from("productos")
      .select("id, user_id")
      .eq("id", req.params.id)
      .single();

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Solo el dueño del producto o el admin pueden eliminarlo
    if (req.usuario.rol !== "admin" && producto.user_id !== req.usuario.id) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para eliminar este producto" });
    }

    const { error } = await supabase
      .from("productos")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
