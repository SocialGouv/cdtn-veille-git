// adapted from https://github.com/davidmason/react-stylable-diff/blob/master/lib/react-diff.js

import React from "react";
import jsdiff from "diff";

const fnMap = {
  chars: jsdiff.diffChars,
  words: jsdiff.diffWords,
  sentences: jsdiff.diffSentences,
  json: jsdiff.diffJson
};

export const Diff = ({ style, className, type, inputA, inputB }) => {
  const diff = fnMap[type](inputA, inputB);
  const result = diff.map((part, index) => {
    if (part.added) {
      return <ins key={index}>{part.value}</ins>;
    }
    if (part.removed) {
      return <del key={index}>{part.value}</del>;
    }
    return <span key={index}>{part.value}</span>;
  });
  return (
    <div style={style} className={className}>
      {result}
    </div>
  );
};

Diff.defaultProps = {
  inputA: "",
  inputB: "",
  type: "chars",
  className: "Difference"
};
