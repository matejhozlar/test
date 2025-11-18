import fs from "fs";
import mammoth from "mammoth";
import path from "path";
import { execSync } from "child_process";
import sharp from "sharp";
import * as cheerio from "cheerio";

const imagesDir = "client/public/assets/images";

async function cleanImagesDir() {
  try {
    if (!fs.existsSync(imagesDir)) {
      console.error(`[ERROR] Folder ${imagesDir} does not exist`);
      return;
    }

    await fs.promises.rm(imagesDir, { recursive: true, force: true });
    console.log(`Folder ${imagesDir} successfully deleted.`);
  } catch (error) {
    console.error("[ERROR] Error removing directory:", error);
  }
}

await cleanImagesDir();

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

mammoth
  .convertToHtml(
    { path: "./docs/manual.docx" },
    {
      convertImage: mammoth.images.imgElement(function (image) {
        return image.read("base64").then(async function (imageBuffer) {
          const filename = "image-" + Date.now(0);
          const filepath = path.join(imagesDir, filename + ".png");

          const buffer = Buffer.from(imageBuffer, "base64");

          const pngSignature = "89504E470D0A1A0A";
          const fileSignature = buffer
            .slice(0, 8)
            .toString("hex")
            .toUpperCase();

          if (fileSignature === pngSignature) {
            fs.writeFileSync(filepath, buffer);
            console.log(`[INFO] Saved PNG: ${filename}.png`);
          } else {
            const emfPath = path.join(imagesDir, filename + ".emf");
            fs.writeFileSync(emfPath, buffer);
            console.warn(
              `[WARN] Saved non-PNG as EMF: ${filename}.emf, attempting conversion...`
            );

            try {
              execSync(
                `soffice --headless --convert-to png:"draw_png_Export" "${emfPath}" --outdir "${imagesDir}"`
              );
              fs.unlinkSync(emfPath);

              const croppedPath = filepath.replace(".png", "--cropped.png");

              await sharp(filepath).trim().toFile(croppedPath);

              fs.unlinkSync(filepath);
              fs.renameSync(croppedPath, filepath);

              console.log(`[INFO] Converted and trimmed ${filename}.png`);
            } catch (error) {
              console.error(`[ERROR] Converting ${filename}:`, error);
            }
          }

          return {
            src: "assets/images/" + filename + ".png",
            class: "zoomable-image",
          };
        });
      }),
    }
  )
  .then(function (result) {
    const $ = cheerio.load(result.value);

    $("ul li strong").each((i, el) => {
      const text = $(el).text().toLowerCase();

      if (text.includes("red")) {
        $(el).addClass("alert-color red");
      } else if (text.includes("amber")) {
        $(el).addClass("alert-color amber");
      } else if (text.includes("blue")) {
        $(el).addClass("alert-color blue");
      } else if (text.includes("notification")) {
        $(el).addClass("alert-color gray");
      }
    });

    $("table").each((i, table) => {
      $(table).addClass("color-table");

      const $table = $(table);
      const headerText = $table.find("tr").first().text().toLowerCase();

      const isCASTable =
        headerText.includes("cas message wording") &&
        headerText.includes("criticality");

      $table.find("tr").each((j, row) => {
        const $row = $(row);
        const $cells = $row.find("td");

        $row.addClass(j % 2 === 0 ? "zebra-even" : "zebra-odd");

        const firstCellText = $cells
          .eq(0)
          .find("p")
          .text()
          .trim()
          .toLowerCase();

        if (
          [
            "red",
            "amber",
            "blue",
            "white",
            "green",
            "magenta",
            "cyan",
            "gray",
          ].includes(firstCellText)
        ) {
          $cells.eq(0).addClass(`color-cell ${firstCellText}`);
        }

        if (isCASTable) {
          const critText = $cells.eq(1).text().trim().toLowerCase();
          if (critText.includes("warning")) {
            $row.addClass("crit-warning");
          } else if (critText.includes("caution")) {
            $row.addClass("crit-caution");
          } else if (critText.includes("advisory")) {
            $row.addClass("crit-advisory");
          } else if (critText.includes("notification")) {
            $row.addClass("crit-notification");
          }
        }
      });
    });

    fs.writeFileSync("client/public/manual.html", $.html());
    console.log("[INFO] Saved HTML as client/public/manual.html");
    process.exit();
  })
  .catch(function (error) {
    console.error(`[ERROR] Converting docx to html:`, error);
  });
