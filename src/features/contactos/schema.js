import { z } from "zod";
import { normalizarTelefonoColombia } from "@/utils/telefono.js";

export const contactoSchema = z.object({
  nombre: z.string().trim().min(2, "Nombre requerido."),
  email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Correo inválido."),
  telefono: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || normalizarTelefonoColombia(v), "Celular colombiano inválido (10 dígitos desde 3)."),
  tipo: z.enum(["comprador", "vendedor", "arrendatario", "inversor", "otro"]).default("otro"),
  origen: z.enum(["manual", "portal", "chat", "importacion"]).default("manual"),
  presupuesto_min: z.coerce.number().int().min(0).optional(),
  presupuesto_max: z.coerce.number().int().min(0).optional(),
  zona_interes: z.string().trim().optional(),
  autorizacion: z.boolean().default(false),
});
