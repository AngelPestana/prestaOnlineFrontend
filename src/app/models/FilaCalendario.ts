export class FilaCalendario {
    tipo: 'pago' | 'festivo' | undefined;
    n?: number;              // solo en filas de pago
    fecha: Date | undefined;
    descripcion?: string;    // solo en filas de festivo
}