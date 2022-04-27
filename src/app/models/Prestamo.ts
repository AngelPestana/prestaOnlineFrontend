export class Prestamo {

    id: string | undefined;
    id_supervisor: string | undefined;
    Supervisor: string | undefined;
    id_promotor: string| undefined;
    Promotor: string | undefined;
    id_cliente: string| undefined;
    Cliente: string| undefined;
    id_estado: string| undefined;
    Estado: string| undefined;
    fecha_inicio_prestamo: string| undefined;
    fecha_final_prestamo: string| undefined;
    plazo: number| undefined;
    cantidad_abonar_mes: number| undefined;
    monto_prestado: number| undefined;
    porcentaje_interes: number| undefined;
    deuda_interes: number| undefined;
    cliente_debe: number| undefined;
    created_at: string| undefined;
}