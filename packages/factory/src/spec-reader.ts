import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const PYTHON_PDF_SCRIPT = `
import sys
pdf_path = sys.argv[1]
text_parts = []
try:
    import pypdf
    reader = pypdf.PdfReader(pdf_path)
    for idx, page in enumerate(reader.pages):
        content = page.extract_text() or ""
        text_parts.append(f"--- PAGE {idx + 1} ---\\n{content}")
    print("\\n".join(text_parts))
    sys.exit(0)
except ImportError:
    pass

try:
    import fitz
    doc = fitz.open(pdf_path)
    for idx, page in enumerate(doc):
        text_parts.append(f"--- PAGE {idx + 1} ---\\n{page.get_text()}")
    print("\\n".join(text_parts))
    sys.exit(0)
except ImportError:
    pass

sys.stderr.write("Missing Python PDF library. Install one via: pip install pypdf\\n")
sys.exit(2)
`;

export async function readSpecFile(specPath: string): Promise<string> {
  const resolved = path.resolve(specPath);
  const ext = path.extname(resolved).toLowerCase();

  if (ext === ".md" || ext === ".txt" || ext === ".json") {
    const content = await readFile(resolved, "utf8");
    if (content.trim().length === 0) {
      throw new Error(`Spec file is empty: ${resolved}`);
    }
    return content;
  }

  if (ext === ".pdf") {
    try {
      const { stdout } = await execFileAsync("python", ["-c", PYTHON_PDF_SCRIPT, resolved], {
        maxBuffer: 25 * 1024 * 1024,
        timeout: 60_000,
      });
      if (stdout.trim().length === 0) {
        throw new Error(`PDF contains no extractable text: ${resolved}`);
      }
      return stdout;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to extract PDF spec (${resolved}): ${message}`);
    }
  }

  throw new Error(`Unsupported spec extension "${ext}". Use .pdf, .md, or .txt.`);
}
