import multer from "multer";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js";

const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

const handler = async (req, res) => {
  if (req.method === "POST") {
    const worker = createWorker();

    upload.single("file")(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        res
          .status(500)
          .json({ message: "An error occurred during file upload" });
      } else if (err) {
        // An unknown error occurred when uploading.
        res
          .status(500)
          .json({ message: "An unknown error occurred during file upload" });
      }

      // File processing

      try {
        const file = req.file;
        const extension = file.originalname.split(".").pop().toLowerCase();
        let result = "";
        if (extension === "pdf") {
          result = await pdfParse(file.buffer);
        } else if (extension === "docx") {
          result = await mammoth.extractRawText({ buffer: file.buffer });
        } else if (["png", "jpg", "jpeg", "bmp"].includes(extension)) {
          result = (await worker).recognize(file.buffer);
        } else {
          res.status(400).json({ message: "Unsupported file type" });
        }
        (await worker).terminate();

        res.setHeader("Content-Type", "application/json");
        res
          .status(200)
          .json({ data: result ? result.text || result.value : "" });
      } catch (error) {
        console.error(error);
        (await worker).terminate();
        res
          .status(500)
          .json({ message: "An error occurred during file processing" });
      }
    });
  } else {
    res.status(405).send("Method Not Allowed");
  }
};

export default handler;
