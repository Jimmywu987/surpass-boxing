//components/EditorJsRenderer.tsx

import { OutputData } from "@editorjs/editorjs";
import { useMemo } from "react";

//use require since editorjs-html doesn't have types
const editorJsHtml = require("editorjs-html");
const EditorJsToHtml = editorJsHtml();

type Props = {
  content: OutputData;
};
type ParsedContent = string | JSX.Element;

export const ContentRenderer = ({ content }: Props) => {
  const { blocks } = content;

  const restContents = useMemo(
    () => blocks.filter((block) => block.type !== "link", []),
    []
  );

  const html = EditorJsToHtml.parse({
    ...content,
    blocks: restContents,
  }) as ParsedContent[];

  return (
    //✔️ It's important to add key={data.time} here to re-render based on the latest data.
    <div
      className="prose max-w-full prose-h2:text-white prose-p:text-white prose-h2:mb-2 prose-h2:mt-4 prose-p:my-1"
      key={content.time}
    >
      {html.map((item, index) => {
        if (typeof item === "string") {
          return (
            <div dangerouslySetInnerHTML={{ __html: item }} key={index}></div>
          );
        }
        return item;
      })}
    </div>
  );
};
