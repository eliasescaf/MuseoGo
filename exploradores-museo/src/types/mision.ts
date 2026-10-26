export type EstadoMision = 'PENDIENTE' | 'CORRECTO' | 'PARCIAL' | 'INCORRECTO';

export type ResultadoMision = {
    estado: Exclude<EstadoMision, 'PENDIENTE'>;
    puntos: number;
    feedback?: string;
};
