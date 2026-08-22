import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import { formatDateTime } from "@/utils/number-formatters"

export type InvoicePrintMetaItem = {
  label: string
  value: string
}

export type InvoicePrintLineItem = {
  id: string
  productId: string
  name: string
  quantity: string
  unitPrice: string
  total: string
  note?: string
}

export type InvoicePrintTotal = {
  label: string
  value: string
  emphasize?: boolean
}

type InvoicePrintDocumentProps = {
  documentTitle: string
  invoiceNumber: string
  statusLabel: string
  issuedAt: string
  partyLabel: string
  partyName: string
  partyLines?: string[]
  meta: InvoicePrintMetaItem[]
  items: InvoicePrintLineItem[]
  itemNoteHeader?: string
  totals: InvoicePrintTotal[]
  emptyItemsLabel: string
}

export function InvoicePrintDocument({
  documentTitle,
  invoiceNumber,
  statusLabel,
  issuedAt,
  partyLabel,
  partyName,
  partyLines = [],
  meta,
  items,
  itemNoteHeader,
  totals,
  emptyItemsLabel,
}: InvoicePrintDocumentProps) {
  const { t } = useTranslation("common")
  const showNotes = Boolean(itemNoteHeader) && items.some((item) => item.note)

  return (
    <section className="invoice-print-sheet hidden print:!block">
      <header className="invoice-print-header">
        <div>
          <p className="invoice-print-brand">{t("appName")}</p>
          <h1 className="invoice-print-title">{documentTitle}</h1>
        </div>

        <div className="invoice-print-header-meta">
          <p>
            <strong>{t("invoiceNumber")}:</strong> {invoiceNumber}
          </p>
          <p>
            <strong>{t("status")}:</strong> {statusLabel}
          </p>
          <p>
            <strong>{t("date")}:</strong> {issuedAt}
          </p>
        </div>
      </header>

      <div className="invoice-print-grid">
        <div>
          <p className="invoice-print-label">{partyLabel}</p>
          <p className="invoice-print-party">{partyName}</p>
          {partyLines.map((line) => (
            <p key={line} className="invoice-print-muted">
              {line}
            </p>
          ))}
        </div>

        <div className="invoice-print-meta-list">
          {meta.map((item) => (
            <div key={item.label} className="invoice-print-meta-row">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="invoice-print-empty">{emptyItemsLabel}</p>
      ) : (
        <table className="invoice-print-table">
          <thead>
            <tr>
              <th>{t("productId")}</th>
              <th>{t("productName")}</th>
              <th>{t("quantity")}</th>
              <th>{t("unitPrice")}</th>
              <th>{t("total")}</th>
              {showNotes ? <th>{itemNoteHeader}</th> : null}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.productId}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.unitPrice}</td>
                <td>{item.total}</td>
                {showNotes ? <td>{item.note || t("notAvailable")}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="invoice-print-totals">
        {totals.map((item) => (
          <div
            key={item.label}
            className={cn(
              "invoice-print-total-row",
              item.emphasize && "invoice-print-total-row-strong"
            )}
          >
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <footer className="invoice-print-footer">
        {t("printedAt")}: {formatDateTime(new Date())}
      </footer>
    </section>
  )
}

type InvoiceListPrintDocumentProps = {
  title: string
  subtitle?: string
  columns: string[]
  rows: string[][]
  emptyLabel: string
}

export function InvoiceListPrintDocument({
  title,
  subtitle,
  columns,
  rows,
  emptyLabel,
}: InvoiceListPrintDocumentProps) {
  const { t } = useTranslation("common")

  return (
    <section className="invoice-print-sheet hidden print:!block">
      <header className="invoice-print-header">
        <div>
          <p className="invoice-print-brand">{t("appName")}</p>
          <h1 className="invoice-print-title">{title}</h1>
          {subtitle ? <p className="invoice-print-muted">{subtitle}</p> : null}
        </div>
      </header>

      {rows.length === 0 ? (
        <p className="invoice-print-empty">{emptyLabel}</p>
      ) : (
        <table className="invoice-print-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${row[0] ?? "row"}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${columns[cellIndex] ?? cellIndex}-${cell}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <footer className="invoice-print-footer">
        {t("printedAt")}: {formatDateTime(new Date())}
      </footer>
    </section>
  )
}
