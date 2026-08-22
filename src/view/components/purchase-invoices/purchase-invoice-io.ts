import type { TFunction } from "i18next"

import { csvNumber, type CsvValue } from "@/utils/csv"
import type {
  PurchaseInvoice,
  PurchaseInvoiceItem,
} from "@/services/purchase-invoices-service"
import {
  formatDate,
  formatMoney,
  formatNumber,
  getInvoiceTotal,
  getItemTotal,
  getPurchaseInvoiceStatusLabel,
  getSupplierName,
} from "@/view/components/purchase-invoices/purchase-invoice-format"
import type {
  InvoicePrintLineItem,
  InvoicePrintMetaItem,
  InvoicePrintTotal,
} from "@/view/components/invoices/invoice-print-document"

function getItemUnitPrice(item: PurchaseInvoiceItem) {
  return (
    item.unitCost ??
    item.unitPrice ??
    item.product?.purchasePrice ??
    item.product?.costPrice ??
    item.product?.buyingPrice ??
    item.product?.price
  )
}

function getItemName(item: PurchaseInvoiceItem, t: TFunction) {
  return item.product?.name || item.product?.title || t("common:notAvailable")
}

export function getPurchaseInvoicePrintModel(
  invoice: PurchaseInvoice,
  t: TFunction
) {
  const items: InvoicePrintLineItem[] = (invoice.items ?? []).map(
    (item, index) => ({
      id: String(item.id ?? `${item.productId}-${index}`),
      productId: `#${formatNumber(item.productId)}`,
      name: getItemName(item, t),
      quantity: formatNumber(item.quantity),
      unitPrice: formatMoney(getItemUnitPrice(item)),
      total: formatMoney(getItemTotal(item)),
      note: item.expiryDate ? formatDate(item.expiryDate) : undefined,
    })
  )

  const partyLines = [
    invoice.supplier?.companyName,
    invoice.supplier?.user?.email,
    invoice.supplier?.user?.phoneNumber,
  ].filter((value): value is string => Boolean(value?.trim()))

  const meta: InvoicePrintMetaItem[] = [
    {
      label: t("common:supplierId"),
      value:
        formatNumber(invoice.supplierId ?? invoice.supplier?.id) ||
        t("common:notAvailable"),
    },
    {
      label: t("common:accountantId"),
      value: formatNumber(invoice.accountantId) || t("common:notAvailable"),
    },
    {
      label: t("common:warehouseWorkerId"),
      value:
        formatNumber(invoice.warehouseWorkerId) || t("common:notAvailable"),
    },
    {
      label: t("common:invoiceDate"),
      value: formatDate(invoice.invoiceDate ?? invoice.createdAt),
    },
    {
      label: t("common:createdAt"),
      value: formatDate(invoice.createdAt),
    },
  ]

  const totals: InvoicePrintTotal[] = [
    { label: t("common:subtotal"), value: formatMoney(invoice.subtotal) },
    { label: t("common:paidAmount"), value: formatMoney(invoice.amountPaid) },
    {
      label: t("common:remainingAmount"),
      value: formatMoney(invoice.remainingAmount),
    },
    {
      label: t("common:grandTotal"),
      value: formatMoney(getInvoiceTotal(invoice)),
      emphasize: true,
    },
  ]

  return {
    documentTitle: t("pages:purchaseInvoices.detailsTitle"),
    invoiceNumber: `#${formatNumber(invoice.id)}`,
    statusLabel: getPurchaseInvoiceStatusLabel(String(invoice.status), t),
    issuedAt: formatDate(invoice.invoiceDate ?? invoice.createdAt),
    partyLabel: t("common:supplier"),
    partyName: getSupplierName(invoice, t),
    partyLines,
    meta,
    items,
    itemNoteHeader: t("common:expiryDate"),
    totals,
    emptyItemsLabel: t("pages:purchaseInvoices.noInvoiceProducts"),
  }
}

export function buildPurchaseInvoiceCsv(
  invoice: PurchaseInvoice,
  t: TFunction
): CsvValue[][] {
  const header: CsvValue[][] = [
    [t("pages:purchaseInvoices.detailsTitle"), `#${invoice.id}`],
    [
      t("common:status"),
      getPurchaseInvoiceStatusLabel(String(invoice.status), t),
    ],
    [t("common:supplier"), getSupplierName(invoice, t)],
    [t("common:supplierId"), invoice.supplierId ?? invoice.supplier?.id ?? ""],
    [t("common:accountantId"), invoice.accountantId ?? ""],
    [t("common:warehouseWorkerId"), invoice.warehouseWorkerId ?? ""],
    [
      t("common:invoiceDate"),
      formatDate(invoice.invoiceDate ?? invoice.createdAt),
    ],
    [t("common:createdAt"), formatDate(invoice.createdAt)],
    [t("common:updatedAt"), formatDate(invoice.updatedAt)],
    [],
    [
      t("common:productId"),
      t("common:productName"),
      t("common:quantity"),
      t("common:unitCost"),
      t("common:total"),
      t("common:expiryDate"),
    ],
  ]

  const itemRows: CsvValue[][] = (invoice.items ?? []).map((item) => [
    item.productId,
    getItemName(item, t),
    csvNumber(item.quantity),
    csvNumber(getItemUnitPrice(item)),
    csvNumber(getItemTotal(item)),
    item.expiryDate ? formatDate(item.expiryDate) : "",
  ])

  const totals: CsvValue[][] = [
    [],
    [t("common:subtotal"), csvNumber(invoice.subtotal)],
    [t("common:paidAmount"), csvNumber(invoice.amountPaid)],
    [t("common:remainingAmount"), csvNumber(invoice.remainingAmount)],
    [t("common:grandTotal"), csvNumber(getInvoiceTotal(invoice))],
  ]

  return [...header, ...itemRows, ...totals]
}

export function getPurchaseInvoicesListColumns(t: TFunction) {
  return [
    t("common:invoiceNumber"),
    t("common:supplier"),
    t("common:status"),
    t("common:subtotal"),
    t("common:paidAmount"),
    t("common:remainingAmount"),
    t("common:total"),
    t("common:invoiceDate"),
  ]
}

export function buildPurchaseInvoicesListRows(
  invoices: PurchaseInvoice[],
  t: TFunction
): string[][] {
  return invoices.map((invoice) => [
    `#${formatNumber(invoice.id)}`,
    getSupplierName(invoice, t),
    getPurchaseInvoiceStatusLabel(String(invoice.status), t),
    formatMoney(invoice.subtotal),
    formatMoney(invoice.amountPaid),
    formatMoney(invoice.remainingAmount),
    formatMoney(getInvoiceTotal(invoice)),
    formatDate(invoice.invoiceDate ?? invoice.createdAt),
  ])
}

export function buildPurchaseInvoicesListCsv(
  invoices: PurchaseInvoice[],
  t: TFunction
): CsvValue[][] {
  return [
    [
      t("common:invoiceNumber"),
      t("common:supplier"),
      t("common:supplierId"),
      t("common:status"),
      t("common:subtotal"),
      t("common:paidAmount"),
      t("common:remainingAmount"),
      t("common:total"),
      t("common:invoiceDate"),
      t("common:createdAt"),
    ],
    ...invoices.map((invoice) => [
      invoice.id,
      getSupplierName(invoice, t),
      invoice.supplierId ?? invoice.supplier?.id ?? "",
      getPurchaseInvoiceStatusLabel(String(invoice.status), t),
      csvNumber(invoice.subtotal),
      csvNumber(invoice.amountPaid),
      csvNumber(invoice.remainingAmount),
      csvNumber(getInvoiceTotal(invoice)),
      formatDate(invoice.invoiceDate ?? invoice.createdAt),
      formatDate(invoice.createdAt),
    ]),
  ]
}
