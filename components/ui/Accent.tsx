import { Fragment } from "react";

/** Renders "plain *accent* plain" with the accent parts in italic serif (ceynk-style headings). */
export function Accent({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*") ? (
          <em key={i} className="accent">
            {p.slice(1, -1)}
          </em>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

export const stripAccent = (t: string) => t.replace(/\*/g, "");
