import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class SequenceService {
  /**
   * Obtiene el siguiente número de venta (saleNumber) para una organización.
   * Utiliza SELECT ... FOR UPDATE para bloqueo pesimista dentro de la transacción.
   * Si no existe la secuencia, la crea con valor 0 y retorna 1.
   */
  async nextSaleNumber(
    tx: Prisma.TransactionClient,
    organizationId: string,
  ): Promise<number> {
    // Bloquear fila con FOR UPDATE
    const results = await tx.$queryRaw<{ saleNumber: number }[]>`
      SELECT "saleNumber" FROM "OrganizationSequence"
      WHERE "organizationId" = ${organizationId}
      FOR UPDATE
    `;

    if (results.length === 0) {
      // Crear secuencia con valor inicial 0
      await tx.organizationSequence.create({
        data: {
          organizationId,
          saleNumber: 0,
          orderNumber: 0,
        },
      });

      // Incrementar y retornar 1
      const updated = await tx.organizationSequence.update({
        where: { organizationId },
        data: { saleNumber: { increment: 1 } },
      });

      return updated.saleNumber;
    }

    const updated = await tx.organizationSequence.update({
      where: { organizationId },
      data: { saleNumber: { increment: 1 } },
    });

    return updated.saleNumber;
  }

  /**
   * Obtiene el siguiente número de orden de compra (orderNumber) para una organización.
   * Utiliza SELECT ... FOR UPDATE para bloqueo pesimista dentro de la transacción.
   * Si no existe la secuencia, la crea con valor 0 y retorna 1.
   */
  async nextOrderNumber(
    tx: Prisma.TransactionClient,
    organizationId: string,
  ): Promise<number> {
    // Bloquear fila con FOR UPDATE
    const results = await tx.$queryRaw<{ orderNumber: number }[]>`
      SELECT "orderNumber" FROM "OrganizationSequence"
      WHERE "organizationId" = ${organizationId}
      FOR UPDATE
    `;

    if (results.length === 0) {
      // Crear secuencia con valor inicial 0
      await tx.organizationSequence.create({
        data: {
          organizationId,
          saleNumber: 0,
          orderNumber: 0,
        },
      });

      // Incrementar y retornar 1
      const updated = await tx.organizationSequence.update({
        where: { organizationId },
        data: { orderNumber: { increment: 1 } },
      });

      return updated.orderNumber;
    }

    const updated = await tx.organizationSequence.update({
      where: { organizationId },
      data: { orderNumber: { increment: 1 } },
    });

    return updated.orderNumber;
  }
}
