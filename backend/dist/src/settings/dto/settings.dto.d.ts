export declare class UpdateSettingsDto {
    companyName?: string;
    currency?: string;
    taxRate?: number;
    invoicePrefix?: string;
    printHeader?: string;
    printFooter?: string;
    logoUrl?: string;
}
export declare class SettingsResponseDto {
    companyName: string;
    currency: string;
    taxRate: number;
    invoicePrefix: string;
    printHeader?: string;
    printFooter?: string;
    logoUrl?: string;
}
