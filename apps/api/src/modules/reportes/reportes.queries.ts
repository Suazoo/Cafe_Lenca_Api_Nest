/**
 * PARADIGMA: Declarativo
 * Cumple: consultas SQL que describen QUÉ resultado se quiere (no cómo
 *         calcularlo): SELECT, JOIN, WHERE, GROUP BY, HAVING/ORDER BY.
 * Usado en: GET /reportes/*
 *
 * Los ::int y ::float8 evitan que Postgres devuelva numeric como texto.
 */

// Productos más vendidos: GROUP BY + ORDER BY + LIMIT
export const SQL_MAS_VENDIDOS = `
  SELECT p.idproducto                          AS "id",
         p.nombre                              AS "nombre",
         c.nombre                              AS "categoria",
         SUM(d.cantidad)::int                  AS "unidadesVendidas",
         SUM(d.cantidad * d.precio_unitario)::float8 AS "ingresos"
  FROM detallepedido d
  JOIN producto p       ON p.idproducto = d.producto_idproducto
  LEFT JOIN categoria c ON c.idcategoria = p.categoria_idcategoria
  GROUP BY p.idproducto, p.nombre, c.nombre
  ORDER BY "unidadesVendidas" DESC, "ingresos" DESC
  LIMIT $1
`;

// Ventas por categoría: GROUP BY + ORDER BY
export const SQL_VENTAS_POR_CATEGORIA = `
  SELECT c.idcategoria                         AS "categoriaId",
         c.nombre                              AS "categoria",
         SUM(d.cantidad)::int                  AS "unidades",
         SUM(d.cantidad * d.precio_unitario)::float8 AS "ingresos"
  FROM detallepedido d
  JOIN producto p  ON p.idproducto = d.producto_idproducto
  JOIN categoria c ON c.idcategoria = p.categoria_idcategoria
  GROUP BY c.idcategoria, c.nombre
  ORDER BY "ingresos" DESC
`;

// Resumen del menú por categoría: WHERE + GROUP BY + funciones de agregado
export const SQL_RESUMEN_CATEGORIAS = `
  SELECT c.idcategoria                         AS "categoriaId",
         c.nombre                              AS "categoria",
         COUNT(p.idproducto)::int              AS "totalProductos",
         ROUND(AVG(p.precio), 2)::float8       AS "precioPromedio",
         MAX(p.precio)::float8                 AS "precioMaximo"
  FROM categoria c
  JOIN producto p ON p.categoria_idcategoria = c.idcategoria
  WHERE p.estado = $1
  GROUP BY c.idcategoria, c.nombre
  ORDER BY "precioPromedio" DESC
`;