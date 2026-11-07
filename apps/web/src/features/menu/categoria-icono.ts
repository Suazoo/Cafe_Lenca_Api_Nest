import { CakeSlice, Coffee, GlassWater, Sandwich, UtensilsCrossed } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { normalizar } from '../../lib/format';

export const iconoCategoria = (nombre: string | null): LucideIcon => {
  const n = normalizar(nombre ?? '');
  if (/caf|espresso|capuch|latte|infus/.test(n)) return Coffee;
  if (/postre|pastel|dulce|reposter|galleta/.test(n)) return CakeSlice;
  if (/bebida|jugo|frapp|fria|helad|batido|licuado/.test(n)) return GlassWater;
  if (/desayuno|comida|plato|snack|sandwich|baleada|almuerzo/.test(n)) return Sandwich;
  return UtensilsCrossed;
};