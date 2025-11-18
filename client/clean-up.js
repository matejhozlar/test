import fs from "fs";

const imagesDir = "public/assets/images";

try {
  if (!fs.existsSync(imagesDir)) {
    console.error(`Folder ${imagesDir} does not exist`);
  } else {
    fs.rm(imagesDir, { recursive: true }, (error) => {
      if (error) {
        console.log("Error removing directory:", error);
      } else {
        console.log(`Folder ${imagesDir} successfuly deleted.`);
      }
    });
  }
} catch (error) {
  console.error("Error:", error);
}
