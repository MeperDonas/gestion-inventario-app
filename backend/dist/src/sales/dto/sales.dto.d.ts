export declare class SaleItemDto {
    productId: string;
    quantity: number;
    unitPrice: number;
    discountAmount?: number;
}
export declare class PaymentDto {
    method: 'CASH' | 'CARD' | 'TRANSFER';
    amount: number;
}
export declare class CreateSaleDto {
    customerId?: string;
    items: SaleItemDto[];
    discountAmount?: number;
    payments?: PaymentDto[];
}
export declare class UpdateSaleDto {
    status?: 'COMPLETED' | 'CANCELLED' | 'RETURNED_PARTIAL';
}
