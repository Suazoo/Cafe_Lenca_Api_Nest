/**
 * PARADIGMA: Lógico
 * Cumple: base de conocimiento (hechos + reglas), inferencia por unificación
 *         y backtracking. No se escribe CÓMO decidir: se declaran las reglas
 *         y Prolog infiere las respuestas.
 * Usado en: POST /pedidos (descuento), GET /recomendaciones, GET /recomendaciones/descuento
 *
 * Los hechos del cliente (pedidos, gasto, preferencias, productos) se generan
 * desde la BD en cada consulta; las reglas de abajo son fijas.
 * String.raw conserva las barras invertidas (\+ y \==) tal cual.
 */
export const BASE_CONOCIMIENTO = String.raw`
% ---------- Hechos que se cargan desde la BD ----------
:- dynamic(cliente/1).
:- dynamic(pedidos_mes/2).
:- dynamic(pedidos_total/2).
:- dynamic(gasto_total/2).
:- dynamic(compro/2).
:- dynamic(preferencia/3).
:- dynamic(producto/4).
:- dynamic(popular/1).

% ---------- Hechos fijos: umbrales del negocio ----------
umbral_frecuente(5).
umbral_vip(2000).

tipo_producto(bebida_favorita).
tipo_producto(comida_favorita).
tipo_producto(producto_favorito).

porcentaje(vip, 15).
porcentaje(frecuente, 10).
porcentaje(nuevo, 5).
porcentaje(regular, 0).

% ---------- Reglas de clasificación ----------
% Frecuente: muchos pedidos en los últimos 30 días
cliente_frecuente(C) :- pedidos_mes(C, N), umbral_frecuente(U), N >= U.

% VIP: gasto acumulado alto
cliente_vip(C) :- gasto_total(C, G), umbral_vip(U), G >= U.

% Nuevo: todavía no ha hecho pedidos
cliente_nuevo(C) :- pedidos_total(C, 0).

% Nivel: se elige la primera regla que se cumple (el corte ! evita las demás)
nivel(C, vip) :- cliente_vip(C), !.
nivel(C, frecuente) :- cliente_frecuente(C), !.
nivel(C, nuevo) :- cliente_nuevo(C), !.
nivel(_, regular).

% ---------- Reglas de recomendación ----------
% 1. El producto coincide con una preferencia declarada
recomendar(C, P, preferencia) :-
    preferencia(C, Tipo, Nombre), tipo_producto(Tipo),
    producto(P, Nombre, _, _).

% 2. Es de su categoría favorita y aún no lo ha pedido
recomendar(C, P, categoria_favorita) :-
    preferencia(C, categoria_favorita, Cat),
    producto(P, _, Cat, _),
    \+ compro(C, P).

% 3. Es de una categoría que ya pidió, pero es un producto nuevo para él
recomendar(C, P, misma_categoria) :-
    compro(C, Q), producto(Q, _, Cat, _),
    producto(P, _, Cat, _), P \== Q,
    \+ compro(C, P).

% 4. Está entre los más vendidos y aún no lo ha pedido
recomendar(C, P, popular) :-
    cliente(C), popular(P),
    \+ compro(C, P).
`;