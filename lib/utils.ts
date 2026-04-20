import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportToCsv(filename: string, rows: Array<Record<string, string | number | null>>) {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const escape = (value: string | number | null) => {
    const safe = value === null || value === undefined ? "" : String(value)
    const escaped = safe.replace(/"/g, '""')
    return `"${escaped}"`
  }
  const csv = [headers.join(","), ...rows.map((row) => headers.map((h) => escape(row[h])).join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

export function exportToPdf(title: string, rows: Array<Record<string, string | number | null>>) {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; }
        h1 { font-size: 18px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
        th { background: #f6f6f6; text-align: left; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <table>
        <thead>
          <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) =>
                `<tr>${headers
                  .map((h) => `<td>${row[h] ?? ""}</td>`)
                  .join("")}</tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </body>
  </html>`
  const win = window.open("", "_blank")
  if (!win) return
  win.document.open()
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
}
