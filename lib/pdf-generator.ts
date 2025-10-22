import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface TimetableClass {
  time?: string
  horario?: string
  course?: string
  discipline?: string
  disciplina?: string
  code?: string
  codigo?: string
  teacher?: string
  professor?: string
  room?: string
  sala?: string
  semester?: number
  periodo?: number
}

interface TimetableData {
  [key: string]: TimetableClass[]
}

interface InputData {
  semesters: string[]
  class_days: string[]
  time_slots: string[]
  courses: Array<{
    code: string
    workload: number
    semester: number
    professor: string
    prerequisites?: string[]
    failure_rate?: number
    type?: string
  }>
  professor_preferences?: Array<{
    professor: string
    preferred_days: string[]
  }>
}

const normalizeClass = (classInfo: TimetableClass) => {
  return {
    time: classInfo.time || classInfo.horario || "",
    discipline:
      classInfo.course || classInfo.discipline || classInfo.disciplina || classInfo.code || classInfo.codigo || "",
    teacher: classInfo.teacher || classInfo.professor || "",
    room: classInfo.room || classInfo.sala || "",
    semester: classInfo.semester || classInfo.periodo,
  }
}

const dayMapping = {
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
}

const getDayDisplayName = (day: string) => {
  const lowerDay = day.toLowerCase()
  return dayMapping[lowerDay as keyof typeof dayMapping] || day
}

const getTeacherColor = (teacher: string, allTeachers: string[]) => {
  const colors = [
    [255, 182, 193],
    [173, 216, 230],
    [144, 238, 144],
    [255, 218, 185],
    [221, 160, 221],
    [255, 255, 224],
    [255, 192, 203],
    [176, 196, 222],
    [152, 251, 152],
    [255, 228, 196],
    [230, 230, 250],
    [255, 239, 213],
    [250, 240, 230],
    [240, 248, 255],
    [245, 255, 250],
    [255, 245, 238],
    [248, 248, 255],
    [245, 245, 220],
    [255, 250, 240],
    [240, 255, 240],
  ]

  const teacherIndex = allTeachers.indexOf(teacher)
  return colors[teacherIndex % colors.length]
}

export const generateTimetablePDF = async (timetable: TimetableData, inputData: InputData) => {
  try {
    const doc = new jsPDF("landscape", "mm", "a4")

    const allTeachersSet = new Set<string>()
    Object.values(timetable).forEach((dayClasses) => {
      if (Array.isArray(dayClasses)) {
        dayClasses.forEach((classInfo) => {
          const normalized = normalizeClass(classInfo)
          if (normalized.teacher) {
            allTeachersSet.add(normalized.teacher)
          }
        })
      }
    })
    const allTeachers = Array.from(allTeachersSet)

    const headerColor = [30, 64, 175]

    const semestersSet = new Set<number>()
    const availableDays = Object.keys(timetable).filter(
      (key) => Array.isArray(timetable[key]) && timetable[key].length > 0,
    )

    availableDays.forEach((day) => {
      if (Array.isArray(timetable[day])) {
        timetable[day].forEach((classInfo: TimetableClass) => {
          const normalized = normalizeClass(classInfo)
          if (normalized.semester !== undefined) {
            semestersSet.add(normalized.semester)
          }
        })
      }
    })

    const semesters = Array.from(semestersSet).sort((a, b) => a - b)

    const timeSlotsSet = new Set<string>()
    availableDays.forEach((day) => {
      if (Array.isArray(timetable[day])) {
        timetable[day].forEach((classInfo: TimetableClass) => {
          const normalized = normalizeClass(classInfo)
          if (normalized.time) {
            timeSlotsSet.add(normalized.time)
          }
        })
      }
    })

    const timeSlots = Array.from(timeSlotsSet).sort((a, b) => {
      const getHour = (timeSlot: string) => {
        const match = timeSlot.match(/(\d{1,2})/)
        return match ? Number.parseInt(match[1]) : 0
      }
      return getHour(a) - getHour(b)
    })

    console.log("PDF Generation Debug:", {
      availableDays,
      semesters: Array.from(semesters),
      timeSlots: timeSlots.slice(0, 5),
      totalClasses: Object.values(timetable).reduce((sum, day) => sum + (Array.isArray(day) ? day.length : 0), 0),
    })

    semesters.forEach((semester, semesterIndex) => {
      if (semesterIndex > 0) {
        doc.addPage("landscape")
      }

      let yPosition = 15

      doc.setFontSize(18)
      doc.setTextColor(...headerColor)
      doc.text(`Horário Acadêmico - Semestre ${semester}`, doc.internal.pageSize.getWidth() / 2, yPosition, {
        align: "center",
      })

      yPosition += 10

      doc.setFontSize(10)
      doc.setTextColor(107, 114, 128)
      const currentDate = new Date().toLocaleDateString("pt-BR")
      doc.text(`Gerado em: ${currentDate}`, doc.internal.pageSize.getWidth() / 2, yPosition, { align: "center" })

      yPosition += 15

      const tableData: any[][] = []

      const headerRow = ["Horário", ...availableDays.map((day) => getDayDisplayName(day))]

      for (const timeSlot of timeSlots) {
        const row = [timeSlot]
        const rowColors = [null]

        for (const day of availableDays) {
          const dayClasses = timetable[day] || []
          const classInfo = dayClasses.find((c) => {
            const normalized = normalizeClass(c)
            return normalized.time === timeSlot && normalized.semester === semester
          })

          if (classInfo) {
            const normalized = normalizeClass(classInfo)
            let cellContent = normalized.discipline
            if (normalized.teacher) {
              cellContent += `\n${normalized.teacher}`
            }
            if (normalized.room) {
              cellContent += `\n${normalized.room}`
            }
            row.push(cellContent)

            const teacherColor = getTeacherColor(normalized.teacher, allTeachers)
            rowColors.push(teacherColor)
          } else {
            row.push("---")
            rowColors.push([245, 245, 245])
          }
        }

        if (row.slice(1).some((cell) => cell !== "---")) {
          tableData.push({ content: row, colors: rowColors })
        }
      }

      if (tableData.length > 0) {
        const availableHeight = doc.internal.pageSize.getHeight() - yPosition - 40
        const estimatedRowHeight = 12
        const maxRows = Math.floor(availableHeight / estimatedRowHeight)

        let fontSize = 8
        let cellPadding = 2

        if (tableData.length > maxRows) {
          fontSize = Math.max(6, 8 - Math.floor((tableData.length - maxRows) / 3))
          cellPadding = Math.max(1, cellPadding - 1)
        }

        autoTable(doc, {
          head: [headerRow],
          body: tableData.map((row) => row.content),
          startY: yPosition,
          theme: "grid",
          styles: {
            fontSize: fontSize,
            cellPadding: cellPadding,
            overflow: "linebreak",
            halign: "center",
            valign: "middle",
            lineWidth: 0.1,
          },
          headStyles: {
            fillColor: headerColor,
            textColor: [255, 255, 255],
            fontSize: fontSize + 1,
            fontStyle: "bold",
          },
          columnStyles: {
            0: {
              fillColor: [243, 244, 246],
              fontStyle: "bold",
              halign: "center",
              cellWidth: 25,
            },
          },
          margin: { left: 15, right: 15, top: 10, bottom: 10 },
          tableWidth: "auto",
          didParseCell: (data) => {
            if (data.section === "body" && data.column.index > 0) {
              const rowIndex = data.row.index
              const colIndex = data.column.index
              if (tableData[rowIndex] && tableData[rowIndex].colors[colIndex]) {
                data.cell.styles.fillColor = tableData[rowIndex].colors[colIndex]
              }
            }
          },
        })

        const finalY = (doc as any).lastAutoTable.finalY || yPosition + 100
        const legendY = Math.min(finalY + 15, doc.internal.pageSize.getHeight() - 25)

        doc.setFontSize(8)
        doc.setTextColor(0, 0, 0)
        doc.text("Legenda de Professores:", 15, legendY)

        let legendX = 15
        let legendCurrentY = legendY + 5
        const legendItemWidth = 60
        const itemsPerRow = Math.floor((doc.internal.pageSize.getWidth() - 30) / legendItemWidth)

        const semesterTeachers = Array.from(
          new Set(
            Object.values(timetable)
              .flat()
              .filter((classInfo) => normalizeClass(classInfo).semester === semester)
              .map((classInfo) => normalizeClass(classInfo).teacher)
              .filter(Boolean),
          ),
        )

        semesterTeachers.forEach((teacher, index) => {
          if (index > 0 && index % itemsPerRow === 0) {
            legendCurrentY += 6
            legendX = 15
          }

          const teacherColor = getTeacherColor(teacher, allTeachers)

          doc.setFillColor(...teacherColor)
          doc.rect(legendX, legendCurrentY - 3, 3, 3, "F")

          doc.setTextColor(0, 0, 0)
          doc.text(teacher, legendX + 5, legendCurrentY)

          legendX += legendItemWidth
        })
      } else {
        doc.setFontSize(12)
        doc.setTextColor(107, 114, 128)
        doc.text(
          `Nenhuma aula encontrada para o Semestre ${semester}`,
          doc.internal.pageSize.getWidth() / 2,
          yPosition + 50,
          { align: "center" },
        )
      }
    })

    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(107, 114, 128)
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: "center" },
      )
    }

    const fileName = `horario-academico-${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`
    doc.save(fileName)

    console.log("PDF generated successfully:", fileName)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw new Error(`Failed to generate PDF: ${error.message}`)
  }
}
