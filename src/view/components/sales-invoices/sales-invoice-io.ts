import type { TFunction } from "i18next"

import { csvNumber, type CsvValue } from "@/utils/csv"
import { formatId } from "@/utils/number-formatters"
import type {
  SalesInvoice,
  SalesInvoiceItem,
} from "@/services/sales-invoices-service"
import {
  formatDate,
  formatMoney,
  formatNumber,
  getCustomerName,
  getInvoiceTotal,
  getItemTotal,
  getSalesInvoiceStatusLabel,
} from "@/view/components/sales-invoices/sales-invoice-format"
import type {
  InvoicePrintLineItem,
  InvoicePrintMetaItem,
  InvoicePrintTotal,
} from "@/view/components/invoices/invoice-print-document"

function getItemUnitPrice(item: SalesInvoiceItem) {
  return item.unitPrice ?? item.product?.sellingPrice ?? item.product?.price
}

function getItemName(item: SalesInvoiceItem, t: TFunction) {
  return item.product?.name || item.product?.title || t("common:notAvailable")
}

function getCashierLabel(invoice: SalesInvoice, t: TFunction) {
  return (
    invoice.cashier?.user?.fullName ||
    invoice.cashier?.user?.email ||
    (invoice.cashierId != null
      ? formatId(invoice.cashierId)
      : t("common:notAvailable"))
  )
}

function getDiscountLabel(invoice: SalesInvoice, t: TFunction) {
  return (
    invoice.discount?.name ||
    invoice.discount?.title ||
    invoice.appliedDiscount?.name ||
    (invoice.discountId != null
      ? formatId(invoice.discountId)
      : t("common:none"))
  )
}

export function getSalesInvoicePartyName(invoice: SalesInvoice, t: TFunction) {
  const fullName = invoice.customer?.user?.fullName?.trim()

  if (fullName) {
    return fullName
  }

  const customerId = invoice.customerId ?? invoice.customer?.id

  if (!customerId) {
    return t("common:cashCustomerLabel")
  }

  return getCustomerName(invoice, t)
}

export function getSalesInvoicePrintModel(invoice: SalesInvoice, t: TFunction) {
  const items: InvoicePrintLineItem[] = (invoice.items ?? []).map(
    (item, index) => ({
      id: String(item.id ?? `${item.productId}-${index}`),
      productId: `#${formatNumber(item.productId)}`,
      name: getItemName(item, t),
      quantity: formatNumber(item.quantity),
      unitPrice: formatMoney(getItemUnitPrice(item)),
      total: formatMoney(getItemTotal(item)),
    })
  )

  const partyLines = [
    invoice.customer?.user?.email,
    invoice.customer?.user?.phoneNumber,
  ].filter((value): value is string => Boolean(value?.trim()))

  const meta: InvoicePrintMetaItem[] = [
    {
      label: t("common:customerId"),
      value:
        formatNumber(invoice.customerId ?? invoice.customer?.id) ||
        t("common:notAvailable"),
    },
    {
      label: t("common:cashierId"),
      value: String(getCashierLabel(invoice, t)),
    },
    {
      label: t("common:discountLabel"),
      value: String(getDiscountLabel(invoice, t)),
    },
    {
      label: t("common:createdAt"),
      value: formatDate(invoice.createdAt),
    },
  ]

  const totals: InvoicePrintTotal[] = [
    { label: t("common:subtotal"), value: formatMoney(invoice.subtotal) },
    {
      label: t("common:discountValue"),
      value: formatMoney(invoice.discountAmount),
    },
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
    documentTitle: t("pages:salesInvoices.detailsTitle"),
    invoiceNumber: `#${formatNumber(invoice.id)}`,
    statusLabel: getSalesInvoiceStatusLabel(String(invoice.status), t),
    issuedAt: formatDate(invoice.createdAt),
    partyLabel: t("common:billTo"),
    partyName: getSalesInvoicePartyName(invoice, t),
    partyLines,
    meta,
    items,
    totals,
    emptyItemsLabel: t("pages:salesInvoices.noInvoiceProducts"),
  }
}

export function buildSalesInvoiceCsv(
  invoice: SalesInvoice,
  t: TFunction
): CsvValue[][] {
  const header: CsvValue[][] = [
    [t("pages:salesInvoices.detailsTitle"), `#${invoice.id}`],
    [t("common:status"), getSalesInvoiceStatusLabel(String(invoice.status), t)],
    [t("common:customer"), getSalesInvoicePartyName(invoice, t)],
    [t("common:customerId"), invoice.customerId ?? invoice.customer?.id ?? ""],
    [t("common:cashierId"), invoice.cashierId ?? ""],
    [t("common:discountLabel"), getDiscountLabel(invoice, t)],
    [t("common:createdAt"), formatDate(invoice.createdAt)],
    [t("common:updatedAt"), formatDate(invoice.updatedAt)],
    [],
    [
      t("common:productId"),
      t("common:productName"),
      t("common:quantity"),
      t("common:unitPrice"),
      t("common:total"),
    ],
  ]

  const itemRows: CsvValue[][] = (invoice.items ?? []).map((item) => [
    item.productId,
    getItemName(item, t),
    csvNumber(item.quantity),
    csvNumber(getItemUnitPrice(item)),
    csvNumber(getItemTotal(item)),
  ])

  const totals: CsvValue[][] = [
    [],
    [t("common:subtotal"), csvNumber(invoice.subtotal)],
    [t("common:discountValue"), csvNumber(invoice.discountAmount)],
    [t("common:paidAmount"), csvNumber(invoice.amountPaid)],
    [t("common:remainingAmount"), csvNumber(invoice.remainingAmount)],
    [t("common:grandTotal"), csvNumber(getInvoiceTotal(invoice))],
  ]

  return [...header, ...itemRows, ...totals]
}

export function getSalesInvoicesListColumns(t: TFunction) {
  return [
    t("common:invoiceNumber"),
    t("common:customer"),
    t("common:status"),
    t("common:subtotal"),
    t("common:discountValue"),
    t("common:paidAmount"),
    t("common:remainingAmount"),
    t("common:total"),
    t("common:date"),
  ]
}

export function buildSalesInvoicesListRows(
  invoices: SalesInvoice[],
  t: TFunction
): string[][] {
  return invoices.map((invoice) => [
    `#${formatNumber(invoice.id)}`,
    getSalesInvoicePartyName(invoice, t),
    getSalesInvoiceStatusLabel(String(invoice.status), t),
    formatMoney(invoice.subtotal),
    formatMoney(invoice.discountAmount),
    formatMoney(invoice.amountPaid),
    formatMoney(invoice.remainingAmount),
    formatMoney(getInvoiceTotal(invoice)),
    formatDate(invoice.createdAt),
  ])
}

export function buildSalesInvoicesListCsv(
  invoices: SalesInvoice[],
  t: TFunction
): CsvValue[][] {
  return [
    [
      t("common:invoiceNumber"),
      t("common:customer"),
      t("common:customerId"),
      t("common:status"),
      t("common:subtotal"),
      t("common:discountValue"),
      t("common:paidAmount"),
      t("common:remainingAmount"),
      t("common:total"),
      t("common:date"),
    ],
    ...invoices.map((invoice) => [
      invoice.id,
      getSalesInvoicePartyName(invoice, t),
      invoice.customerId ?? invoice.customer?.id ?? "",
      getSalesInvoiceStatusLabel(String(invoice.status), t),
      csvNumber(invoice.subtotal),
      csvNumber(invoice.discountAmount),
      csvNumber(invoice.amountPaid),
      csvNumber(invoice.remainingAmount),
      csvNumber(getInvoiceTotal(invoice)),
      formatDate(invoice.createdAt),
    ]),
  ]
}
