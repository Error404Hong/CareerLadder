import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export interface ReportTable {
    title?: string
    head: string[]
    body: (string | number)[][]
}

export interface ReportStat {
    label: string
    value: string | number
}

export interface ReportConfig {
    title: string
    subtitle: string
    stats: ReportStat[]
    tables: ReportTable[]
}

function getLastTableY(doc: jsPDF): number {
    return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 0
}

export function generatePDFReport(config: ReportConfig) {
    const doc = new jsPDF()
    const generatedDate = new Date().toLocaleDateString("en-MY", {
        day: "numeric", month: "long", year: "numeric",
    })

    // Header banner
    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, 210, 38, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("CareerLadder", 14, 14)

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(config.title, 14, 25)

    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(`Generated: ${generatedDate}`, 14, 34)

    let y = 48

    // Summary stats
    if (config.stats.length > 0) {
        doc.setTextColor(100, 116, 139)
        doc.setFontSize(8)
        doc.setFont("helvetica", "bold")
        doc.text("SUMMARY", 14, y)
        y += 5

        const maxPerRow = 4
        const colWidth = (210 - 28) / Math.min(config.stats.length, maxPerRow)

        config.stats.forEach((stat, i) => {
            const col = i % maxPerRow
            const row = Math.floor(i / maxPerRow)
            const x = 14 + col * colWidth
            const boxY = y + row * 22

            doc.setFillColor(248, 250, 252)
            doc.setDrawColor(226, 232, 240)
            doc.roundedRect(x, boxY, colWidth - 3, 18, 1.5, 1.5, "FD")

            doc.setTextColor(15, 23, 42)
            doc.setFontSize(13)
            doc.setFont("helvetica", "bold")
            doc.text(String(stat.value), x + 3, boxY + 8)

            doc.setTextColor(148, 163, 184)
            doc.setFontSize(6.5)
            doc.setFont("helvetica", "normal")
            doc.text(stat.label.toUpperCase(), x + 3, boxY + 14)
        })

        y += Math.ceil(config.stats.length / maxPerRow) * 22 + 8
    }

    // Tables
    for (const table of config.tables) {
        if (table.title) {
            doc.setTextColor(100, 116, 139)
            doc.setFontSize(8)
            doc.setFont("helvetica", "bold")
            doc.text(table.title.toUpperCase(), 14, y)
            y += 4
        }

        autoTable(doc, {
            startY: y,
            head: [table.head],
            body: table.body,
            theme: "striped",
            headStyles: {
                fillColor: [15, 23, 42],
                textColor: 255,
                fontSize: 7.5,
                fontStyle: "bold",
                cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
            },
            bodyStyles: {
                fontSize: 7.5,
                textColor: [51, 65, 85],
                cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252],
            },
            margin: { left: 14, right: 14 },
        })

        y = getLastTableY(doc) + 12
    }

    // Footer on every page
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(7.5)
        doc.setTextColor(148, 163, 184)
        doc.text(`CareerLadder Admin Report  ·  Page ${i} of ${pageCount}`, 14, 290)
        doc.text(generatedDate, 196, 290, { align: "right" })
    }

    const filename = `${config.title.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`
    doc.save(filename)
}
