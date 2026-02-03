export declare class CreateCustomerDto {
    name: string;
    documentType: string;
    documentNumber: string;
    email?: string;
    phone?: string;
    address?: string;
    segment?: 'VIP' | 'FREQUENT' | 'OCCASIONAL' | 'INACTIVE';
}
export declare class UpdateCustomerDto {
    name?: string;
    documentType?: string;
    documentNumber?: string;
    email?: string;
    phone?: string;
    address?: string;
    segment?: 'VIP' | 'FREQUENT' | 'OCCASIONAL' | 'INACTIVE';
    active?: boolean;
}
