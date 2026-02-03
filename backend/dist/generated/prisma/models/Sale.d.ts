import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type SaleModel = runtime.Types.Result.DefaultSelection<Prisma.$SalePayload>;
export type AggregateSale = {
    _count: SaleCountAggregateOutputType | null;
    _avg: SaleAvgAggregateOutputType | null;
    _sum: SaleSumAggregateOutputType | null;
    _min: SaleMinAggregateOutputType | null;
    _max: SaleMaxAggregateOutputType | null;
};
export type SaleAvgAggregateOutputType = {
    saleNumber: number | null;
    subtotal: runtime.Decimal | null;
    taxAmount: runtime.Decimal | null;
    discountAmount: runtime.Decimal | null;
    total: runtime.Decimal | null;
    amountPaid: runtime.Decimal | null;
    change: runtime.Decimal | null;
};
export type SaleSumAggregateOutputType = {
    saleNumber: number | null;
    subtotal: runtime.Decimal | null;
    taxAmount: runtime.Decimal | null;
    discountAmount: runtime.Decimal | null;
    total: runtime.Decimal | null;
    amountPaid: runtime.Decimal | null;
    change: runtime.Decimal | null;
};
export type SaleMinAggregateOutputType = {
    id: string | null;
    saleNumber: number | null;
    customerId: string | null;
    subtotal: runtime.Decimal | null;
    taxAmount: runtime.Decimal | null;
    discountAmount: runtime.Decimal | null;
    total: runtime.Decimal | null;
    paymentMethod: $Enums.PaymentMethod | null;
    amountPaid: runtime.Decimal | null;
    change: runtime.Decimal | null;
    status: $Enums.SaleStatus | null;
    userId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type SaleMaxAggregateOutputType = {
    id: string | null;
    saleNumber: number | null;
    customerId: string | null;
    subtotal: runtime.Decimal | null;
    taxAmount: runtime.Decimal | null;
    discountAmount: runtime.Decimal | null;
    total: runtime.Decimal | null;
    paymentMethod: $Enums.PaymentMethod | null;
    amountPaid: runtime.Decimal | null;
    change: runtime.Decimal | null;
    status: $Enums.SaleStatus | null;
    userId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type SaleCountAggregateOutputType = {
    id: number;
    saleNumber: number;
    customerId: number;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    paymentMethod: number;
    amountPaid: number;
    change: number;
    status: number;
    userId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type SaleAvgAggregateInputType = {
    saleNumber?: true;
    subtotal?: true;
    taxAmount?: true;
    discountAmount?: true;
    total?: true;
    amountPaid?: true;
    change?: true;
};
export type SaleSumAggregateInputType = {
    saleNumber?: true;
    subtotal?: true;
    taxAmount?: true;
    discountAmount?: true;
    total?: true;
    amountPaid?: true;
    change?: true;
};
export type SaleMinAggregateInputType = {
    id?: true;
    saleNumber?: true;
    customerId?: true;
    subtotal?: true;
    taxAmount?: true;
    discountAmount?: true;
    total?: true;
    paymentMethod?: true;
    amountPaid?: true;
    change?: true;
    status?: true;
    userId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type SaleMaxAggregateInputType = {
    id?: true;
    saleNumber?: true;
    customerId?: true;
    subtotal?: true;
    taxAmount?: true;
    discountAmount?: true;
    total?: true;
    paymentMethod?: true;
    amountPaid?: true;
    change?: true;
    status?: true;
    userId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type SaleCountAggregateInputType = {
    id?: true;
    saleNumber?: true;
    customerId?: true;
    subtotal?: true;
    taxAmount?: true;
    discountAmount?: true;
    total?: true;
    paymentMethod?: true;
    amountPaid?: true;
    change?: true;
    status?: true;
    userId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type SaleAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SaleWhereInput;
    orderBy?: Prisma.SaleOrderByWithRelationInput | Prisma.SaleOrderByWithRelationInput[];
    cursor?: Prisma.SaleWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | SaleCountAggregateInputType;
    _avg?: SaleAvgAggregateInputType;
    _sum?: SaleSumAggregateInputType;
    _min?: SaleMinAggregateInputType;
    _max?: SaleMaxAggregateInputType;
};
export type GetSaleAggregateType<T extends SaleAggregateArgs> = {
    [P in keyof T & keyof AggregateSale]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateSale[P]> : Prisma.GetScalarType<T[P], AggregateSale[P]>;
};
export type SaleGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SaleWhereInput;
    orderBy?: Prisma.SaleOrderByWithAggregationInput | Prisma.SaleOrderByWithAggregationInput[];
    by: Prisma.SaleScalarFieldEnum[] | Prisma.SaleScalarFieldEnum;
    having?: Prisma.SaleScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SaleCountAggregateInputType | true;
    _avg?: SaleAvgAggregateInputType;
    _sum?: SaleSumAggregateInputType;
    _min?: SaleMinAggregateInputType;
    _max?: SaleMaxAggregateInputType;
};
export type SaleGroupByOutputType = {
    id: string;
    saleNumber: number;
    customerId: string | null;
    subtotal: runtime.Decimal;
    taxAmount: runtime.Decimal;
    discountAmount: runtime.Decimal;
    total: runtime.Decimal;
    paymentMethod: $Enums.PaymentMethod;
    amountPaid: runtime.Decimal | null;
    change: runtime.Decimal | null;
    status: $Enums.SaleStatus;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    _count: SaleCountAggregateOutputType | null;
    _avg: SaleAvgAggregateOutputType | null;
    _sum: SaleSumAggregateOutputType | null;
    _min: SaleMinAggregateOutputType | null;
    _max: SaleMaxAggregateOutputType | null;
};
type GetSaleGroupByPayload<T extends SaleGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<SaleGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof SaleGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], SaleGroupByOutputType[P]> : Prisma.GetScalarType<T[P], SaleGroupByOutputType[P]>;
}>>;
export type SaleWhereInput = {
    AND?: Prisma.SaleWhereInput | Prisma.SaleWhereInput[];
    OR?: Prisma.SaleWhereInput[];
    NOT?: Prisma.SaleWhereInput | Prisma.SaleWhereInput[];
    id?: Prisma.StringFilter<"Sale"> | string;
    saleNumber?: Prisma.IntFilter<"Sale"> | number;
    customerId?: Prisma.StringNullableFilter<"Sale"> | string | null;
    subtotal?: Prisma.DecimalFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount?: Prisma.DecimalFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: Prisma.DecimalFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    total?: Prisma.DecimalFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod?: Prisma.EnumPaymentMethodFilter<"Sale"> | $Enums.PaymentMethod;
    amountPaid?: Prisma.DecimalNullableFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: Prisma.DecimalNullableFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumSaleStatusFilter<"Sale"> | $Enums.SaleStatus;
    userId?: Prisma.StringFilter<"Sale"> | string;
    createdAt?: Prisma.DateTimeFilter<"Sale"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Sale"> | Date | string;
    customer?: Prisma.XOR<Prisma.CustomerNullableScalarRelationFilter, Prisma.CustomerWhereInput> | null;
    items?: Prisma.SaleItemListRelationFilter;
};
export type SaleOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    saleNumber?: Prisma.SortOrder;
    customerId?: Prisma.SortOrderInput | Prisma.SortOrder;
    subtotal?: Prisma.SortOrder;
    taxAmount?: Prisma.SortOrder;
    discountAmount?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
    paymentMethod?: Prisma.SortOrder;
    amountPaid?: Prisma.SortOrderInput | Prisma.SortOrder;
    change?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    customer?: Prisma.CustomerOrderByWithRelationInput;
    items?: Prisma.SaleItemOrderByRelationAggregateInput;
};
export type SaleWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    saleNumber?: number;
    AND?: Prisma.SaleWhereInput | Prisma.SaleWhereInput[];
    OR?: Prisma.SaleWhereInput[];
    NOT?: Prisma.SaleWhereInput | Prisma.SaleWhereInput[];
    customerId?: Prisma.StringNullableFilter<"Sale"> | string | null;
    subtotal?: Prisma.DecimalFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount?: Prisma.DecimalFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: Prisma.DecimalFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    total?: Prisma.DecimalFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod?: Prisma.EnumPaymentMethodFilter<"Sale"> | $Enums.PaymentMethod;
    amountPaid?: Prisma.DecimalNullableFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: Prisma.DecimalNullableFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumSaleStatusFilter<"Sale"> | $Enums.SaleStatus;
    userId?: Prisma.StringFilter<"Sale"> | string;
    createdAt?: Prisma.DateTimeFilter<"Sale"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Sale"> | Date | string;
    customer?: Prisma.XOR<Prisma.CustomerNullableScalarRelationFilter, Prisma.CustomerWhereInput> | null;
    items?: Prisma.SaleItemListRelationFilter;
}, "id" | "saleNumber">;
export type SaleOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    saleNumber?: Prisma.SortOrder;
    customerId?: Prisma.SortOrderInput | Prisma.SortOrder;
    subtotal?: Prisma.SortOrder;
    taxAmount?: Prisma.SortOrder;
    discountAmount?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
    paymentMethod?: Prisma.SortOrder;
    amountPaid?: Prisma.SortOrderInput | Prisma.SortOrder;
    change?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.SaleCountOrderByAggregateInput;
    _avg?: Prisma.SaleAvgOrderByAggregateInput;
    _max?: Prisma.SaleMaxOrderByAggregateInput;
    _min?: Prisma.SaleMinOrderByAggregateInput;
    _sum?: Prisma.SaleSumOrderByAggregateInput;
};
export type SaleScalarWhereWithAggregatesInput = {
    AND?: Prisma.SaleScalarWhereWithAggregatesInput | Prisma.SaleScalarWhereWithAggregatesInput[];
    OR?: Prisma.SaleScalarWhereWithAggregatesInput[];
    NOT?: Prisma.SaleScalarWhereWithAggregatesInput | Prisma.SaleScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Sale"> | string;
    saleNumber?: Prisma.IntWithAggregatesFilter<"Sale"> | number;
    customerId?: Prisma.StringNullableWithAggregatesFilter<"Sale"> | string | null;
    subtotal?: Prisma.DecimalWithAggregatesFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount?: Prisma.DecimalWithAggregatesFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: Prisma.DecimalWithAggregatesFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    total?: Prisma.DecimalWithAggregatesFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod?: Prisma.EnumPaymentMethodWithAggregatesFilter<"Sale"> | $Enums.PaymentMethod;
    amountPaid?: Prisma.DecimalNullableWithAggregatesFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: Prisma.DecimalNullableWithAggregatesFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumSaleStatusWithAggregatesFilter<"Sale"> | $Enums.SaleStatus;
    userId?: Prisma.StringWithAggregatesFilter<"Sale"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Sale"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Sale"> | Date | string;
};
export type SaleCreateInput = {
    id?: string;
    saleNumber: number;
    subtotal: runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod: $Enums.PaymentMethod;
    amountPaid?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.SaleStatus;
    userId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    customer?: Prisma.CustomerCreateNestedOneWithoutSalesInput;
    items?: Prisma.SaleItemCreateNestedManyWithoutSaleInput;
};
export type SaleUncheckedCreateInput = {
    id?: string;
    saleNumber: number;
    customerId?: string | null;
    subtotal: runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod: $Enums.PaymentMethod;
    amountPaid?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.SaleStatus;
    userId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    items?: Prisma.SaleItemUncheckedCreateNestedManyWithoutSaleInput;
};
export type SaleUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    saleNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    subtotal?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    amountPaid?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumSaleStatusFieldUpdateOperationsInput | $Enums.SaleStatus;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    customer?: Prisma.CustomerUpdateOneWithoutSalesNestedInput;
    items?: Prisma.SaleItemUpdateManyWithoutSaleNestedInput;
};
export type SaleUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    saleNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    customerId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    subtotal?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    amountPaid?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumSaleStatusFieldUpdateOperationsInput | $Enums.SaleStatus;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    items?: Prisma.SaleItemUncheckedUpdateManyWithoutSaleNestedInput;
};
export type SaleCreateManyInput = {
    id?: string;
    saleNumber: number;
    customerId?: string | null;
    subtotal: runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod: $Enums.PaymentMethod;
    amountPaid?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.SaleStatus;
    userId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type SaleUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    saleNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    subtotal?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    amountPaid?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumSaleStatusFieldUpdateOperationsInput | $Enums.SaleStatus;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SaleUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    saleNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    customerId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    subtotal?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    amountPaid?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumSaleStatusFieldUpdateOperationsInput | $Enums.SaleStatus;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SaleListRelationFilter = {
    every?: Prisma.SaleWhereInput;
    some?: Prisma.SaleWhereInput;
    none?: Prisma.SaleWhereInput;
};
export type SaleOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type SaleCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    saleNumber?: Prisma.SortOrder;
    customerId?: Prisma.SortOrder;
    subtotal?: Prisma.SortOrder;
    taxAmount?: Prisma.SortOrder;
    discountAmount?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
    paymentMethod?: Prisma.SortOrder;
    amountPaid?: Prisma.SortOrder;
    change?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SaleAvgOrderByAggregateInput = {
    saleNumber?: Prisma.SortOrder;
    subtotal?: Prisma.SortOrder;
    taxAmount?: Prisma.SortOrder;
    discountAmount?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
    amountPaid?: Prisma.SortOrder;
    change?: Prisma.SortOrder;
};
export type SaleMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    saleNumber?: Prisma.SortOrder;
    customerId?: Prisma.SortOrder;
    subtotal?: Prisma.SortOrder;
    taxAmount?: Prisma.SortOrder;
    discountAmount?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
    paymentMethod?: Prisma.SortOrder;
    amountPaid?: Prisma.SortOrder;
    change?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SaleMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    saleNumber?: Prisma.SortOrder;
    customerId?: Prisma.SortOrder;
    subtotal?: Prisma.SortOrder;
    taxAmount?: Prisma.SortOrder;
    discountAmount?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
    paymentMethod?: Prisma.SortOrder;
    amountPaid?: Prisma.SortOrder;
    change?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SaleSumOrderByAggregateInput = {
    saleNumber?: Prisma.SortOrder;
    subtotal?: Prisma.SortOrder;
    taxAmount?: Prisma.SortOrder;
    discountAmount?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
    amountPaid?: Prisma.SortOrder;
    change?: Prisma.SortOrder;
};
export type SaleScalarRelationFilter = {
    is?: Prisma.SaleWhereInput;
    isNot?: Prisma.SaleWhereInput;
};
export type SaleCreateNestedManyWithoutCustomerInput = {
    create?: Prisma.XOR<Prisma.SaleCreateWithoutCustomerInput, Prisma.SaleUncheckedCreateWithoutCustomerInput> | Prisma.SaleCreateWithoutCustomerInput[] | Prisma.SaleUncheckedCreateWithoutCustomerInput[];
    connectOrCreate?: Prisma.SaleCreateOrConnectWithoutCustomerInput | Prisma.SaleCreateOrConnectWithoutCustomerInput[];
    createMany?: Prisma.SaleCreateManyCustomerInputEnvelope;
    connect?: Prisma.SaleWhereUniqueInput | Prisma.SaleWhereUniqueInput[];
};
export type SaleUncheckedCreateNestedManyWithoutCustomerInput = {
    create?: Prisma.XOR<Prisma.SaleCreateWithoutCustomerInput, Prisma.SaleUncheckedCreateWithoutCustomerInput> | Prisma.SaleCreateWithoutCustomerInput[] | Prisma.SaleUncheckedCreateWithoutCustomerInput[];
    connectOrCreate?: Prisma.SaleCreateOrConnectWithoutCustomerInput | Prisma.SaleCreateOrConnectWithoutCustomerInput[];
    createMany?: Prisma.SaleCreateManyCustomerInputEnvelope;
    connect?: Prisma.SaleWhereUniqueInput | Prisma.SaleWhereUniqueInput[];
};
export type SaleUpdateManyWithoutCustomerNestedInput = {
    create?: Prisma.XOR<Prisma.SaleCreateWithoutCustomerInput, Prisma.SaleUncheckedCreateWithoutCustomerInput> | Prisma.SaleCreateWithoutCustomerInput[] | Prisma.SaleUncheckedCreateWithoutCustomerInput[];
    connectOrCreate?: Prisma.SaleCreateOrConnectWithoutCustomerInput | Prisma.SaleCreateOrConnectWithoutCustomerInput[];
    upsert?: Prisma.SaleUpsertWithWhereUniqueWithoutCustomerInput | Prisma.SaleUpsertWithWhereUniqueWithoutCustomerInput[];
    createMany?: Prisma.SaleCreateManyCustomerInputEnvelope;
    set?: Prisma.SaleWhereUniqueInput | Prisma.SaleWhereUniqueInput[];
    disconnect?: Prisma.SaleWhereUniqueInput | Prisma.SaleWhereUniqueInput[];
    delete?: Prisma.SaleWhereUniqueInput | Prisma.SaleWhereUniqueInput[];
    connect?: Prisma.SaleWhereUniqueInput | Prisma.SaleWhereUniqueInput[];
    update?: Prisma.SaleUpdateWithWhereUniqueWithoutCustomerInput | Prisma.SaleUpdateWithWhereUniqueWithoutCustomerInput[];
    updateMany?: Prisma.SaleUpdateManyWithWhereWithoutCustomerInput | Prisma.SaleUpdateManyWithWhereWithoutCustomerInput[];
    deleteMany?: Prisma.SaleScalarWhereInput | Prisma.SaleScalarWhereInput[];
};
export type SaleUncheckedUpdateManyWithoutCustomerNestedInput = {
    create?: Prisma.XOR<Prisma.SaleCreateWithoutCustomerInput, Prisma.SaleUncheckedCreateWithoutCustomerInput> | Prisma.SaleCreateWithoutCustomerInput[] | Prisma.SaleUncheckedCreateWithoutCustomerInput[];
    connectOrCreate?: Prisma.SaleCreateOrConnectWithoutCustomerInput | Prisma.SaleCreateOrConnectWithoutCustomerInput[];
    upsert?: Prisma.SaleUpsertWithWhereUniqueWithoutCustomerInput | Prisma.SaleUpsertWithWhereUniqueWithoutCustomerInput[];
    createMany?: Prisma.SaleCreateManyCustomerInputEnvelope;
    set?: Prisma.SaleWhereUniqueInput | Prisma.SaleWhereUniqueInput[];
    disconnect?: Prisma.SaleWhereUniqueInput | Prisma.SaleWhereUniqueInput[];
    delete?: Prisma.SaleWhereUniqueInput | Prisma.SaleWhereUniqueInput[];
    connect?: Prisma.SaleWhereUniqueInput | Prisma.SaleWhereUniqueInput[];
    update?: Prisma.SaleUpdateWithWhereUniqueWithoutCustomerInput | Prisma.SaleUpdateWithWhereUniqueWithoutCustomerInput[];
    updateMany?: Prisma.SaleUpdateManyWithWhereWithoutCustomerInput | Prisma.SaleUpdateManyWithWhereWithoutCustomerInput[];
    deleteMany?: Prisma.SaleScalarWhereInput | Prisma.SaleScalarWhereInput[];
};
export type EnumPaymentMethodFieldUpdateOperationsInput = {
    set?: $Enums.PaymentMethod;
};
export type NullableDecimalFieldUpdateOperationsInput = {
    set?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    increment?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    decrement?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    multiply?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    divide?: runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type EnumSaleStatusFieldUpdateOperationsInput = {
    set?: $Enums.SaleStatus;
};
export type SaleCreateNestedOneWithoutItemsInput = {
    create?: Prisma.XOR<Prisma.SaleCreateWithoutItemsInput, Prisma.SaleUncheckedCreateWithoutItemsInput>;
    connectOrCreate?: Prisma.SaleCreateOrConnectWithoutItemsInput;
    connect?: Prisma.SaleWhereUniqueInput;
};
export type SaleUpdateOneRequiredWithoutItemsNestedInput = {
    create?: Prisma.XOR<Prisma.SaleCreateWithoutItemsInput, Prisma.SaleUncheckedCreateWithoutItemsInput>;
    connectOrCreate?: Prisma.SaleCreateOrConnectWithoutItemsInput;
    upsert?: Prisma.SaleUpsertWithoutItemsInput;
    connect?: Prisma.SaleWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SaleUpdateToOneWithWhereWithoutItemsInput, Prisma.SaleUpdateWithoutItemsInput>, Prisma.SaleUncheckedUpdateWithoutItemsInput>;
};
export type SaleCreateWithoutCustomerInput = {
    id?: string;
    saleNumber: number;
    subtotal: runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod: $Enums.PaymentMethod;
    amountPaid?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.SaleStatus;
    userId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    items?: Prisma.SaleItemCreateNestedManyWithoutSaleInput;
};
export type SaleUncheckedCreateWithoutCustomerInput = {
    id?: string;
    saleNumber: number;
    subtotal: runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod: $Enums.PaymentMethod;
    amountPaid?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.SaleStatus;
    userId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    items?: Prisma.SaleItemUncheckedCreateNestedManyWithoutSaleInput;
};
export type SaleCreateOrConnectWithoutCustomerInput = {
    where: Prisma.SaleWhereUniqueInput;
    create: Prisma.XOR<Prisma.SaleCreateWithoutCustomerInput, Prisma.SaleUncheckedCreateWithoutCustomerInput>;
};
export type SaleCreateManyCustomerInputEnvelope = {
    data: Prisma.SaleCreateManyCustomerInput | Prisma.SaleCreateManyCustomerInput[];
    skipDuplicates?: boolean;
};
export type SaleUpsertWithWhereUniqueWithoutCustomerInput = {
    where: Prisma.SaleWhereUniqueInput;
    update: Prisma.XOR<Prisma.SaleUpdateWithoutCustomerInput, Prisma.SaleUncheckedUpdateWithoutCustomerInput>;
    create: Prisma.XOR<Prisma.SaleCreateWithoutCustomerInput, Prisma.SaleUncheckedCreateWithoutCustomerInput>;
};
export type SaleUpdateWithWhereUniqueWithoutCustomerInput = {
    where: Prisma.SaleWhereUniqueInput;
    data: Prisma.XOR<Prisma.SaleUpdateWithoutCustomerInput, Prisma.SaleUncheckedUpdateWithoutCustomerInput>;
};
export type SaleUpdateManyWithWhereWithoutCustomerInput = {
    where: Prisma.SaleScalarWhereInput;
    data: Prisma.XOR<Prisma.SaleUpdateManyMutationInput, Prisma.SaleUncheckedUpdateManyWithoutCustomerInput>;
};
export type SaleScalarWhereInput = {
    AND?: Prisma.SaleScalarWhereInput | Prisma.SaleScalarWhereInput[];
    OR?: Prisma.SaleScalarWhereInput[];
    NOT?: Prisma.SaleScalarWhereInput | Prisma.SaleScalarWhereInput[];
    id?: Prisma.StringFilter<"Sale"> | string;
    saleNumber?: Prisma.IntFilter<"Sale"> | number;
    customerId?: Prisma.StringNullableFilter<"Sale"> | string | null;
    subtotal?: Prisma.DecimalFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount?: Prisma.DecimalFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: Prisma.DecimalFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    total?: Prisma.DecimalFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod?: Prisma.EnumPaymentMethodFilter<"Sale"> | $Enums.PaymentMethod;
    amountPaid?: Prisma.DecimalNullableFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: Prisma.DecimalNullableFilter<"Sale"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumSaleStatusFilter<"Sale"> | $Enums.SaleStatus;
    userId?: Prisma.StringFilter<"Sale"> | string;
    createdAt?: Prisma.DateTimeFilter<"Sale"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Sale"> | Date | string;
};
export type SaleCreateWithoutItemsInput = {
    id?: string;
    saleNumber: number;
    subtotal: runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod: $Enums.PaymentMethod;
    amountPaid?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.SaleStatus;
    userId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    customer?: Prisma.CustomerCreateNestedOneWithoutSalesInput;
};
export type SaleUncheckedCreateWithoutItemsInput = {
    id?: string;
    saleNumber: number;
    customerId?: string | null;
    subtotal: runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod: $Enums.PaymentMethod;
    amountPaid?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.SaleStatus;
    userId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type SaleCreateOrConnectWithoutItemsInput = {
    where: Prisma.SaleWhereUniqueInput;
    create: Prisma.XOR<Prisma.SaleCreateWithoutItemsInput, Prisma.SaleUncheckedCreateWithoutItemsInput>;
};
export type SaleUpsertWithoutItemsInput = {
    update: Prisma.XOR<Prisma.SaleUpdateWithoutItemsInput, Prisma.SaleUncheckedUpdateWithoutItemsInput>;
    create: Prisma.XOR<Prisma.SaleCreateWithoutItemsInput, Prisma.SaleUncheckedCreateWithoutItemsInput>;
    where?: Prisma.SaleWhereInput;
};
export type SaleUpdateToOneWithWhereWithoutItemsInput = {
    where?: Prisma.SaleWhereInput;
    data: Prisma.XOR<Prisma.SaleUpdateWithoutItemsInput, Prisma.SaleUncheckedUpdateWithoutItemsInput>;
};
export type SaleUpdateWithoutItemsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    saleNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    subtotal?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    amountPaid?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumSaleStatusFieldUpdateOperationsInput | $Enums.SaleStatus;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    customer?: Prisma.CustomerUpdateOneWithoutSalesNestedInput;
};
export type SaleUncheckedUpdateWithoutItemsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    saleNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    customerId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    subtotal?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    amountPaid?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumSaleStatusFieldUpdateOperationsInput | $Enums.SaleStatus;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SaleCreateManyCustomerInput = {
    id?: string;
    saleNumber: number;
    subtotal: runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    total: runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod: $Enums.PaymentMethod;
    amountPaid?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.SaleStatus;
    userId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type SaleUpdateWithoutCustomerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    saleNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    subtotal?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    amountPaid?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumSaleStatusFieldUpdateOperationsInput | $Enums.SaleStatus;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    items?: Prisma.SaleItemUpdateManyWithoutSaleNestedInput;
};
export type SaleUncheckedUpdateWithoutCustomerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    saleNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    subtotal?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    amountPaid?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumSaleStatusFieldUpdateOperationsInput | $Enums.SaleStatus;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    items?: Prisma.SaleItemUncheckedUpdateManyWithoutSaleNestedInput;
};
export type SaleUncheckedUpdateManyWithoutCustomerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    saleNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    subtotal?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    taxAmount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discountAmount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    total?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentMethod?: Prisma.EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod;
    amountPaid?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    change?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumSaleStatusFieldUpdateOperationsInput | $Enums.SaleStatus;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SaleCountOutputType = {
    items: number;
};
export type SaleCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    items?: boolean | SaleCountOutputTypeCountItemsArgs;
};
export type SaleCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SaleCountOutputTypeSelect<ExtArgs> | null;
};
export type SaleCountOutputTypeCountItemsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SaleItemWhereInput;
};
export type SaleSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    saleNumber?: boolean;
    customerId?: boolean;
    subtotal?: boolean;
    taxAmount?: boolean;
    discountAmount?: boolean;
    total?: boolean;
    paymentMethod?: boolean;
    amountPaid?: boolean;
    change?: boolean;
    status?: boolean;
    userId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    customer?: boolean | Prisma.Sale$customerArgs<ExtArgs>;
    items?: boolean | Prisma.Sale$itemsArgs<ExtArgs>;
    _count?: boolean | Prisma.SaleCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["sale"]>;
export type SaleSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    saleNumber?: boolean;
    customerId?: boolean;
    subtotal?: boolean;
    taxAmount?: boolean;
    discountAmount?: boolean;
    total?: boolean;
    paymentMethod?: boolean;
    amountPaid?: boolean;
    change?: boolean;
    status?: boolean;
    userId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    customer?: boolean | Prisma.Sale$customerArgs<ExtArgs>;
}, ExtArgs["result"]["sale"]>;
export type SaleSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    saleNumber?: boolean;
    customerId?: boolean;
    subtotal?: boolean;
    taxAmount?: boolean;
    discountAmount?: boolean;
    total?: boolean;
    paymentMethod?: boolean;
    amountPaid?: boolean;
    change?: boolean;
    status?: boolean;
    userId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    customer?: boolean | Prisma.Sale$customerArgs<ExtArgs>;
}, ExtArgs["result"]["sale"]>;
export type SaleSelectScalar = {
    id?: boolean;
    saleNumber?: boolean;
    customerId?: boolean;
    subtotal?: boolean;
    taxAmount?: boolean;
    discountAmount?: boolean;
    total?: boolean;
    paymentMethod?: boolean;
    amountPaid?: boolean;
    change?: boolean;
    status?: boolean;
    userId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type SaleOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "saleNumber" | "customerId" | "subtotal" | "taxAmount" | "discountAmount" | "total" | "paymentMethod" | "amountPaid" | "change" | "status" | "userId" | "createdAt" | "updatedAt", ExtArgs["result"]["sale"]>;
export type SaleInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    customer?: boolean | Prisma.Sale$customerArgs<ExtArgs>;
    items?: boolean | Prisma.Sale$itemsArgs<ExtArgs>;
    _count?: boolean | Prisma.SaleCountOutputTypeDefaultArgs<ExtArgs>;
};
export type SaleIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    customer?: boolean | Prisma.Sale$customerArgs<ExtArgs>;
};
export type SaleIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    customer?: boolean | Prisma.Sale$customerArgs<ExtArgs>;
};
export type $SalePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Sale";
    objects: {
        customer: Prisma.$CustomerPayload<ExtArgs> | null;
        items: Prisma.$SaleItemPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        saleNumber: number;
        customerId: string | null;
        subtotal: runtime.Decimal;
        taxAmount: runtime.Decimal;
        discountAmount: runtime.Decimal;
        total: runtime.Decimal;
        paymentMethod: $Enums.PaymentMethod;
        amountPaid: runtime.Decimal | null;
        change: runtime.Decimal | null;
        status: $Enums.SaleStatus;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["sale"]>;
    composites: {};
};
export type SaleGetPayload<S extends boolean | null | undefined | SaleDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$SalePayload, S>;
export type SaleCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<SaleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SaleCountAggregateInputType | true;
};
export interface SaleDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Sale'];
        meta: {
            name: 'Sale';
        };
    };
    findUnique<T extends SaleFindUniqueArgs>(args: Prisma.SelectSubset<T, SaleFindUniqueArgs<ExtArgs>>): Prisma.Prisma__SaleClient<runtime.Types.Result.GetResult<Prisma.$SalePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends SaleFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, SaleFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__SaleClient<runtime.Types.Result.GetResult<Prisma.$SalePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends SaleFindFirstArgs>(args?: Prisma.SelectSubset<T, SaleFindFirstArgs<ExtArgs>>): Prisma.Prisma__SaleClient<runtime.Types.Result.GetResult<Prisma.$SalePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends SaleFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, SaleFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__SaleClient<runtime.Types.Result.GetResult<Prisma.$SalePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends SaleFindManyArgs>(args?: Prisma.SelectSubset<T, SaleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SalePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends SaleCreateArgs>(args: Prisma.SelectSubset<T, SaleCreateArgs<ExtArgs>>): Prisma.Prisma__SaleClient<runtime.Types.Result.GetResult<Prisma.$SalePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends SaleCreateManyArgs>(args?: Prisma.SelectSubset<T, SaleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends SaleCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, SaleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SalePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends SaleDeleteArgs>(args: Prisma.SelectSubset<T, SaleDeleteArgs<ExtArgs>>): Prisma.Prisma__SaleClient<runtime.Types.Result.GetResult<Prisma.$SalePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends SaleUpdateArgs>(args: Prisma.SelectSubset<T, SaleUpdateArgs<ExtArgs>>): Prisma.Prisma__SaleClient<runtime.Types.Result.GetResult<Prisma.$SalePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends SaleDeleteManyArgs>(args?: Prisma.SelectSubset<T, SaleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends SaleUpdateManyArgs>(args: Prisma.SelectSubset<T, SaleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends SaleUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, SaleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SalePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends SaleUpsertArgs>(args: Prisma.SelectSubset<T, SaleUpsertArgs<ExtArgs>>): Prisma.Prisma__SaleClient<runtime.Types.Result.GetResult<Prisma.$SalePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends SaleCountArgs>(args?: Prisma.Subset<T, SaleCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], SaleCountAggregateOutputType> : number>;
    aggregate<T extends SaleAggregateArgs>(args: Prisma.Subset<T, SaleAggregateArgs>): Prisma.PrismaPromise<GetSaleAggregateType<T>>;
    groupBy<T extends SaleGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: SaleGroupByArgs['orderBy'];
    } : {
        orderBy?: SaleGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, SaleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSaleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: SaleFieldRefs;
}
export interface Prisma__SaleClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    customer<T extends Prisma.Sale$customerArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Sale$customerArgs<ExtArgs>>): Prisma.Prisma__CustomerClient<runtime.Types.Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    items<T extends Prisma.Sale$itemsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Sale$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SaleItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface SaleFieldRefs {
    readonly id: Prisma.FieldRef<"Sale", 'String'>;
    readonly saleNumber: Prisma.FieldRef<"Sale", 'Int'>;
    readonly customerId: Prisma.FieldRef<"Sale", 'String'>;
    readonly subtotal: Prisma.FieldRef<"Sale", 'Decimal'>;
    readonly taxAmount: Prisma.FieldRef<"Sale", 'Decimal'>;
    readonly discountAmount: Prisma.FieldRef<"Sale", 'Decimal'>;
    readonly total: Prisma.FieldRef<"Sale", 'Decimal'>;
    readonly paymentMethod: Prisma.FieldRef<"Sale", 'PaymentMethod'>;
    readonly amountPaid: Prisma.FieldRef<"Sale", 'Decimal'>;
    readonly change: Prisma.FieldRef<"Sale", 'Decimal'>;
    readonly status: Prisma.FieldRef<"Sale", 'SaleStatus'>;
    readonly userId: Prisma.FieldRef<"Sale", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Sale", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Sale", 'DateTime'>;
}
export type SaleFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SaleSelect<ExtArgs> | null;
    omit?: Prisma.SaleOmit<ExtArgs> | null;
    include?: Prisma.SaleInclude<ExtArgs> | null;
    where: Prisma.SaleWhereUniqueInput;
};
export type SaleFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SaleSelect<ExtArgs> | null;
    omit?: Prisma.SaleOmit<ExtArgs> | null;
    include?: Prisma.SaleInclude<ExtArgs> | null;
    where: Prisma.SaleWhereUniqueInput;
};
export type SaleFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SaleSelect<ExtArgs> | null;
    omit?: Prisma.SaleOmit<ExtArgs> | null;
    include?: Prisma.SaleInclude<ExtArgs> | null;
    where?: Prisma.SaleWhereInput;
    orderBy?: Prisma.SaleOrderByWithRelationInput | Prisma.SaleOrderByWithRelationInput[];
    cursor?: Prisma.SaleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SaleScalarFieldEnum | Prisma.SaleScalarFieldEnum[];
};
export type SaleFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SaleSelect<ExtArgs> | null;
    omit?: Prisma.SaleOmit<ExtArgs> | null;
    include?: Prisma.SaleInclude<ExtArgs> | null;
    where?: Prisma.SaleWhereInput;
    orderBy?: Prisma.SaleOrderByWithRelationInput | Prisma.SaleOrderByWithRelationInput[];
    cursor?: Prisma.SaleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SaleScalarFieldEnum | Prisma.SaleScalarFieldEnum[];
};
export type SaleFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SaleSelect<ExtArgs> | null;
    omit?: Prisma.SaleOmit<ExtArgs> | null;
    include?: Prisma.SaleInclude<ExtArgs> | null;
    where?: Prisma.SaleWhereInput;
    orderBy?: Prisma.SaleOrderByWithRelationInput | Prisma.SaleOrderByWithRelationInput[];
    cursor?: Prisma.SaleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SaleScalarFieldEnum | Prisma.SaleScalarFieldEnum[];
};
export type SaleCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SaleSelect<ExtArgs> | null;
    omit?: Prisma.SaleOmit<ExtArgs> | null;
    include?: Prisma.SaleInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SaleCreateInput, Prisma.SaleUncheckedCreateInput>;
};
export type SaleCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.SaleCreateManyInput | Prisma.SaleCreateManyInput[];
    skipDuplicates?: boolean;
};
export type SaleCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SaleSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SaleOmit<ExtArgs> | null;
    data: Prisma.SaleCreateManyInput | Prisma.SaleCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.SaleIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type SaleUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SaleSelect<ExtArgs> | null;
    omit?: Prisma.SaleOmit<ExtArgs> | null;
    include?: Prisma.SaleInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SaleUpdateInput, Prisma.SaleUncheckedUpdateInput>;
    where: Prisma.SaleWhereUniqueInput;
};
export type SaleUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.SaleUpdateManyMutationInput, Prisma.SaleUncheckedUpdateManyInput>;
    where?: Prisma.SaleWhereInput;
    limit?: number;
};
export type SaleUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SaleSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SaleOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SaleUpdateManyMutationInput, Prisma.SaleUncheckedUpdateManyInput>;
    where?: Prisma.SaleWhereInput;
    limit?: number;
    include?: Prisma.SaleIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type SaleUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SaleSelect<ExtArgs> | null;
    omit?: Prisma.SaleOmit<ExtArgs> | null;
    include?: Prisma.SaleInclude<ExtArgs> | null;
    where: Prisma.SaleWhereUniqueInput;
    create: Prisma.XOR<Prisma.SaleCreateInput, Prisma.SaleUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.SaleUpdateInput, Prisma.SaleUncheckedUpdateInput>;
};
export type SaleDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SaleSelect<ExtArgs> | null;
    omit?: Prisma.SaleOmit<ExtArgs> | null;
    include?: Prisma.SaleInclude<ExtArgs> | null;
    where: Prisma.SaleWhereUniqueInput;
};
export type SaleDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SaleWhereInput;
    limit?: number;
};
export type Sale$customerArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomerSelect<ExtArgs> | null;
    omit?: Prisma.CustomerOmit<ExtArgs> | null;
    include?: Prisma.CustomerInclude<ExtArgs> | null;
    where?: Prisma.CustomerWhereInput;
};
export type Sale$itemsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SaleItemSelect<ExtArgs> | null;
    omit?: Prisma.SaleItemOmit<ExtArgs> | null;
    include?: Prisma.SaleItemInclude<ExtArgs> | null;
    where?: Prisma.SaleItemWhereInput;
    orderBy?: Prisma.SaleItemOrderByWithRelationInput | Prisma.SaleItemOrderByWithRelationInput[];
    cursor?: Prisma.SaleItemWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SaleItemScalarFieldEnum | Prisma.SaleItemScalarFieldEnum[];
};
export type SaleDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SaleSelect<ExtArgs> | null;
    omit?: Prisma.SaleOmit<ExtArgs> | null;
    include?: Prisma.SaleInclude<ExtArgs> | null;
};
export {};
