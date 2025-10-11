import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import fs from "fs"

async function generateTestPDF() {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create()

  // Add a page
  const page = pdfDoc.addPage([612, 792]) // Standard letter size

  // Get the font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const { width, height } = page.getSize()

  // Title
  page.drawText("Test Document", {
    x: 50,
    y: height - 50,
    size: 20,
    font: boldFont,
    color: rgb(0, 0, 0),
  })

  // Content text
  const content = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla est purus, ultrices in porttitor
in, accumsan non quam. Nam consectetur porttitor rhoncus. Curabitur eu est et leo feugiat
auctor vel quis lorem. Ut et ligula dolor, sit amet consequat lorem. Aliquam porta eros sed
velit imperdiet egestas. Maecenas tempus eros ut diam ullamcorper id dictum libero
tempor. Donec quis augue quis magna condimentum lobortis. Quisque imperdiet ipsum vel
magna viverra rutrum. Cras viverra molestie urna, vitae vestibulum turpis varius id.

Vestibulum mollis, arcu iaculis bibendum varius, velit sapien blandit metus, ac posuere 
lorem nulla ac dolor. Maecenas urna elit, tincidunt in dapibus nec, vehicula eu dui. Duis 
lacinia fringilla massa. Cum sociis natoque penatibus et magnis dis parturient montes, 
nascetur ridiculus mus. Ut consequat ultricies est, non rhoncus mauris congue porta. 
Vivamus viverra suscipit felis eget condimentum.

Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. 
Integer bibendum sagittis ligula, non faucibus nulla volutpat vitae. Cum sociis natoque 
penatibus et magnis dis parturient montes, nascetur ridiculus mus. In aliquet quam et 
velit bibendum accumsan. Cum sociis natoque penatibus et magnis dis parturient montes, 
nascetur ridiculus mus. Vestibulum vitae ipsum nec arcu semper adipiscing at ac lacus.

Praesent id pellentesque orci. Morbi congue viverra nisl nec rhoncus. Integer mattis, 
ipsum a tincidunt commodo, lacus arcu elementum elit, at mollis eros ante ac risus. In 
volutpat, ante at pretium ultricies, velit magna suscipit enim, aliquet blandit massa orci 
nec lorem. Nulla facilisi. Duis eu vehicula arcu. Nulla facilisi.

Maecenas pellentesque volutpat felis, quis tristique ligula luctus vel. Sed nec mi eros. 
Integer augue enim, sollicitudin ullamcorper mattis eget, aliquam in est. Morbi 
sollicitudin libero nec augue dignissim ut consectetur dui volutpat. Nulla facilisi. Mauris 
egestas vestibulum neque cursus tincidunt.

Donec sit amet pulvinar orci.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla est purus, ultrices in porttitor
in, accumsan non quam. Nam consectetur porttitor rhoncus. Curabitur eu est et leo feugiat
auctor vel quis lorem. Ut et ligula dolor, sit amet consequat lorem. Aliquam porta eros sed
velit imperdiet egestas. Maecenas tempus eros ut diam ullamcorper id dictum libero
tempor. Donec quis augue quis magna condimentum lobortis.

Quisque imperdiet ipsum vel magna viverra rutrum. Cras viverra molestie urna, vitae 
vestibulum turpis varius id. Vestibulum mollis, arcu iaculis bibendum varius, velit sapien 
blandit metus, ac posuere lorem nulla ac dolor. Maecenas urna elit, tincidunt in dapibus 
nec, vehicula eu dui. Duis lacinia fringilla massa.`

  // Split content into lines and draw them
  const lines = content.split("\n")
  let yPosition = height - 100
  const lineHeight = 14
  const margin = 50
  const maxWidth = width - margin * 2

  for (const line of lines) {
    if (line.trim() === "") {
      yPosition -= lineHeight
      continue
    }

    // Word wrap
    const words = line.split(" ")
    let currentLine = ""

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word
      const textWidth = font.widthOfTextAtSize(testLine, 11)

      if (textWidth > maxWidth && currentLine !== "") {
        // Draw current line
        page.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: 11,
          font: font,
          color: rgb(0, 0, 0),
        })
        yPosition -= lineHeight
        currentLine = word
      } else {
        currentLine = testLine
      }
    }

    // Draw remaining text
    if (currentLine) {
      page.drawText(currentLine, {
        x: margin,
        y: yPosition,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      })
      yPosition -= lineHeight
    }

    // Add extra space after paragraphs
    yPosition -= 5
  }

  // Add signature areas
  yPosition -= 40

  // Owner signature area
  page.drawText("Document Owner Signature:", {
    x: margin,
    y: yPosition,
    size: 10,
    font: boldFont,
    color: rgb(0, 0, 0),
  })

  // Draw signature line
  page.drawLine({
    start: { x: margin, y: yPosition - 30 },
    end: { x: margin + 200, y: yPosition - 30 },
    thickness: 1,
    color: rgb(0, 0, 0),
  })

  page.drawText("Date: _______________", {
    x: margin + 220,
    y: yPosition - 25,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  })

  // Recipient signature area
  yPosition -= 80
  page.drawText("Recipient Signature:", {
    x: margin,
    y: yPosition,
    size: 10,
    font: boldFont,
    color: rgb(0, 0, 0),
  })

  // Draw signature line
  page.drawLine({
    start: { x: margin, y: yPosition - 30 },
    end: { x: margin + 200, y: yPosition - 30 },
    thickness: 1,
    color: rgb(0, 0, 0),
  })

  page.drawText("Date: _______________", {
    x: margin + 220,
    y: yPosition - 25,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  })

  // Serialize the PDF
  const pdfBytes = await pdfDoc.save()

  // Save to file
  fs.writeFileSync("test-document.pdf", pdfBytes)

  console.log("✅ Test PDF generated successfully!")
  console.log("📄 File saved as: test-document.pdf")
  console.log("📏 File size:", Math.round(pdfBytes.length / 1024), "KB")
}

// Generate the PDF
generateTestPDF().catch(console.error)
