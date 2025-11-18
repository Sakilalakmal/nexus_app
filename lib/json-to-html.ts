import { baseExtensions } from "@/components/rich-text-editor/extension";
import { generateHTML, JSONContent } from "@tiptap/react";

export function convertJsonToHtml(jsonString: JSONContent):string {
  try {
    const content =
      typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;

      return generateHTML(content,baseExtensions);
  } catch (error) {
    console.log("error in tip tap convert " , error);
    return "";
    
  }
}
