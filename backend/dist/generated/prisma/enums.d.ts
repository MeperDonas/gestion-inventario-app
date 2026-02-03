export declare const Role: {
    readonly ADMIN: "ADMIN";
    readonly CASHIER: "CASHIER";
    readonly INVENTORY_USER: "INVENTORY_USER";
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const MovementType: {
    readonly PURCHASE: "PURCHASE";
    readonly SALE: "SALE";
    readonly ADJUSTMENT_IN: "ADJUSTMENT_IN";
    readonly ADJUSTMENT_OUT: "ADJUSTMENT_OUT";
    readonly DAMAGE: "DAMAGE";
    readonly RETURN: "RETURN";
};
export type MovementType = (typeof MovementType)[keyof typeof MovementType];
export declare const CustomerSegment: {
    readonly VIP: "VIP";
    readonly FREQUENT: "FREQUENT";
    readonly OCCASIONAL: "OCCASIONAL";
    readonly INACTIVE: "INACTIVE";
};
export type CustomerSegment = (typeof CustomerSegment)[keyof typeof CustomerSegment];
export declare const PaymentMethod: {
    readonly CASH: "CASH";
    readonly CARD: "CARD";
    readonly TRANSFER: "TRANSFER";
};
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
export declare const SaleStatus: {
    readonly COMPLETED: "COMPLETED";
    readonly CANCELLED: "CANCELLED";
    readonly RETURNED_PARTIAL: "RETURNED_PARTIAL";
};
export type SaleStatus = (typeof SaleStatus)[keyof typeof SaleStatus];
