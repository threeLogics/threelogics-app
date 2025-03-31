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
  try {
    console.log("📥 Generando plantilla CSV de productos...");

    const fields = [
      { label: "Nombre", value: "nombre" },
      { label: "Descripción", value: "descripcion" },
      { label: "Precio", value: "precio" },
      { label: "Cantidad", value: "cantidad" },
      { label: "Categoría", value: "categoriaNombre" },
    ];

    const json2csvParser = new Parser({ fields, delimiter: ";" });
    const csv = json2csvParser.parse([]);

    const csvConBom = '\uFEFF' + csv;

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="plantilla_productos.csv"'
    );
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.status(200).send(csvConBom);

    console.log("✅ Plantilla CSV generada correctamente");
  } catch (error) {
    console.error("❌ Error generando la plantilla CSV:", error);
    res.status(500).json({ error: "Error al generar la plantilla CSV" });
  }
});

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
          fs.unlinkSync(req.file.path); 

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

            const { data: productoExistente } = await supabase
              .from("productos")
              .select("id")
              .eq("nombre", nombre)
              .single();

            let productoId;

            if (productoExistente) {
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

            const { data: ubicacionExistente } = await supabase
              .from("ubicaciones")
              .select("id")
              .eq("producto_id", productoId)
              .maybeSingle();

            if (!ubicacionExistente) {
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

    const { data: productoExistente } = await supabase
      .from("productos")
      .select("id, descripcion")
      .eq("nombre", nombre)
      .single();

    let productoId;

    if (productoExistente) {
      if (productoExistente.descripcion === descripcion) {
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

    const ubicacion = await generarUbicacion(productoId, req.usuario.id);
    console.log("✅ Ubicación asignada:", ubicacion);

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

    res.status(201).json({ producto: productoCompleto, ubicacion });
  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/", verificarToken, async (req, res) => {
  try {
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

    if (req.usuario.rol === "admin") {
      const idsUnicos = [...new Set(productos.map((p) => p.user_id))];

      const { data: allUsers, error: errorUsers } =
        await supabase.auth.admin.listUsers();

      if (errorUsers) throw errorUsers;

      const mapaUsuarios = {};
      allUsers.users.forEach((u) => {
        mapaUsuarios[u.id] = u.user_metadata?.nombre || "Sin nombre";
      });

      const productosConNombre = productos.map((p) => ({
        ...p,
        creador_nombre: mapaUsuarios[p.user_id] || "Desconocido",
      }));

      return res.json(productosConNombre);
    }

    res.json(productos);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    res.status(500).json({ error: error.message });
  }
});

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

    if (req.usuario.rol !== "admin" && producto.user_id !== req.usuario.id) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para modificar este producto" });
    }

    const { nombre, descripcion, precio, cantidad, categoria_id } = req.body;

    const { error } = await supabase
      .from("productos")
      .update({ nombre, descripcion, precio, cantidad, categoria_id }) 
      .eq("id", req.params.id);

    if (error) throw error;

    res.json({ mensaje: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error);
    res.status(500).json({ error: error.message });
  }
});

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
