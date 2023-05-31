//./components/Editor
import React, { memo, useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";

const Header = require("@editorjs/header");
const Paragraph = require("@editorjs/paragraph");
const Link = require("@editorjs/link");

const EDITOR_TOOLS = {
  header: Header,
  paragraph: Paragraph,
  link: Link,
};

import { useFormContext } from "react-hook-form";

const EditorBlock = ({ name }: { name: string }) => {
  const ref = useRef<EditorJS>();
  const { getValues, setValue } = useFormContext();
  const holder = "editorjs-container";
  //initialize editorjs
  useEffect(() => {
    //initialize editor if we don't have a reference
    if (!ref.current) {
      const editor = new EditorJS({
        holder,
        tools: EDITOR_TOOLS,
        data: getValues(name),
        async onChange(api, event) {
          const data = await api.saver.save();
          setValue(name, data, { shouldValidate: true });
        },
      });
      ref.current = editor;
    }

    //add a return function handle cleanup
    return () => {
      if (ref.current && ref.current.destroy) {
        ref.current.destroy();
      }
    };
  }, []);

  return <div id={holder} className="prose max-w-full" />;
};

export default memo(EditorBlock);
