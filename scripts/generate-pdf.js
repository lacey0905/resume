import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generatePDF() {
  console.log("🚀 PDF 생성을 시작합니다...");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Print 미디어 타입 에뮬레이션 (CSS @media print 적용)
    await page.emulateMediaType("print");

    // Vite 개발 서버 URL (CSS가 제대로 로드되도록)
    const url = "http://localhost:5173";

    console.log(`📄 페이지 로딩 중: ${url}`);
    await page.goto(url, {
      waitUntil: "networkidle0",
    });

    // 페이지 스타일이 완전히 로드될 때까지 대기
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // PDF 생성 (output 폴더에 저장, 커스텀 사이즈 (가로 A3, 세로 A4), 여백 포함)
    const projectRoot = join(__dirname, "..");
    const outputPath = join(projectRoot, "output", "resume.pdf");
    await page.pdf({
      path: outputPath,
      width: "297mm", // A3 가로
      height: "300mm", // A4 세로
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "0mm",
        left: "15mm",
      },
    });

    console.log(`✅ PDF가 성공적으로 생성되었습니다: ${outputPath}`);

    // PNG 스크린샷 생성 (항상)
    const screenshotPath = join(projectRoot, "output", "resume.png");
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      type: "png",
    });

    console.log(`✅ PNG 스크린샷이 생성되었습니다: ${screenshotPath}`);
  } catch (error) {
    console.error("❌ PDF 생성 중 오류 발생:", error);
    throw error;
  } finally {
    await browser.close();
    console.log("🏁 브라우저를 종료했습니다.");
  }
}

generatePDF().catch(console.error);
