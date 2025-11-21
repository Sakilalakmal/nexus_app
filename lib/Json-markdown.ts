import { baseExtensions } from "@/components/rich-text-editor/extension";
import { renderToMarkdown } from "@tiptap/static-renderer/pm/markdown";

function normalizeWhiteSpace(markdown: string) {
  return markdown
    .replace(/ \s+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function jsonToMarkdown(json: string) {
  let content;
  //parse json
  try {
    content = JSON.parse(json);
  } catch (error) {
    console.log(error);
  }

  const markdown = renderToMarkdown({
    extensions: baseExtensions,
    content,
  });

  return normalizeWhiteSpace(markdown);
}
