// adapted from https://github.com/davidmason/react-stylable-diff/blob/master/lib/react-diff.js

import React, { useState, useMemo } from "react";
import jsdiff from "diff";

const fnMap = {
  chars: jsdiff.diffChars,
  words: jsdiff.diffWords,
  sentences: jsdiff.diffSentences,
  json: jsdiff.diffJson
};

export const Diff = ({ style, className, type, inputA, inputB }) => {
  const [mode, setMode] = useState(type)
  const diff = fnMap[mode](inputA, inputB);

  const groupName = useMemo(() => Math.random())

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
      <div style={{marginBottom:20}}>
        Diff mode :
        <input type="radio" name={groupName} onClick={() => setMode("words")}  style={{marginLeft:10}} checked={mode==="words"}/> Mots
        <input type="radio" name={groupName} onClick={() => setMode("sentences")} style={{marginLeft:10}}  checked={mode==="sentences"}/> Phrases
      </div>
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
