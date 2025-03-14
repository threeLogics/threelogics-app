import express from "express";
import supabase from "../supabaseClient.js";
import { verificarToken } from "../middleware/authMiddleware.js";
import multer from "multer";
import csvParser from "csv-parser";
import fs from "fs";
import { Parser } from "json2csv";

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
            } else {
              // ➕ Si no existe, lo insertamos como nuevo
              const { error: errorInsert } = await supabase
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
                ]);

              if (errorInsert) {
                errores.push({ producto: nombre, error: "Error al insertar" });
                continue;
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
      categoriaNombre, // ✅ Se usa cuando el usuario quiere crear una nueva categoría
    } = req.body;

    if (!nombre || !precio || cantidad === undefined) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios." });
    }

    // 🚀 Si no se envía `categoria_id`, se busca o crea con el nombre
    if (!categoria_id && categoriaNombre) {
      const { data: categoriaExistente } = await supabase
        .from("categorias")
        .select("id")
        .eq("nombre", categoriaNombre)
        .single();

      if (categoriaExistente) {
        categoria_id = categoriaExistente.id;
      } else {
        const { data: nuevaCategoria } = await supabase
          .from("categorias")
          .insert([{ nombre: categoriaNombre, user_id: req.usuario.id }]) // ✅ Corregido `usuarioId` → `usuario_id`
          .select()
          .single();

        categoria_id = nuevaCategoria.id;
      }
    }

    if (!categoria_id) {
      return res
        .status(400)
        .json({ error: "No se pudo determinar una categoría válida." });
    }

    // ✅ Crear el producto con la categoría asegurada
    const { data: producto, error } = await supabase
      .from("productos")
      .insert([
        {
          nombre,
          descripcion,
          precio,
          cantidad,
          categoria_id, // ✅ Corregido `categoriaId` → `categoria_id`
          user_id: req.usuario.id, // ✅ Corregido `usuarioId` → `usuario_id`
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(producto);
  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Obtener productos (admin ve todos, cliente solo los suyos)
router.get("/", verificarToken, async (req, res) => {
  try {
    let query = supabase
      .from("productos")
      .select(
        "id, nombre, descripcion, precio, cantidad, categoria_id, categorias(nombre)"
      );

    if (req.usuario.rol === "admin") {
      query = supabase
        .from("productos")
        .select(
          "id, nombre, descripcion, precio, cantidad, categoria_id, user_id, categorias(nombre)"
        );
    } else {
      query = query.eq("user_id", req.usuario.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
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
