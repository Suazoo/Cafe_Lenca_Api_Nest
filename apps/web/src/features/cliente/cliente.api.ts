import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PerfilClienteDto } from '@cafe-lenca/shared';
import { api } from '../../lib/api';

export interface DatosRegistro {
  pNombre: string;
  sNombre?: string;
  pApellido: string;
  sApellido?: string;
  correo: string;
  telefono?: string;
}

export const usePerfil = (correo: string | null) =>
  useQuery({
    queryKey: ['perfil', correo],
    queryFn: () => api<PerfilClienteDto>(`/clientes/perfil?correo=${encodeURIComponent(correo ?? '')}`),
    enabled: !!correo,
    retry: false,
  });

export const useRegistrar = () =>
  useMutation({
    mutationFn: (datos: DatosRegistro) =>
      api<PerfilClienteDto>('/clientes', { method: 'POST', body: JSON.stringify(datos) }),
  });

export const useAgregarPreferencia = (correo: string | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datos: { idCliente: number; tipo: string; valor: string }) =>
      api<PerfilClienteDto>(`/clientes/${datos.idCliente}/preferencias`, {
        method: 'POST',
        body: JSON.stringify({ tipo: datos.tipo, valor: datos.valor }),
      }),
    // La API devuelve el perfil ya actualizado
    onSuccess: (perfil) => {
      qc.setQueryData(['perfil', correo], perfil);
      void qc.invalidateQueries({ queryKey: ['recomendaciones'] });
    },
  });
};