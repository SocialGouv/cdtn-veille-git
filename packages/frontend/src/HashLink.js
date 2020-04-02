import React from "react";
import { Badge } from "reactstrap";

export const HashLink = ({ className, owner, repo, hash }) => (
  <a
    className={className}
    rel="noopener noreferrer"
    target="_blank"
    href={`https://github.com/${owner}/${repo}/commit/${hash}`}
  >
    <Badge color="light" style={{ color: "#888", fontSize: "0.5em" }}>
      {hash.slice(0, 8)}
    </Badge>
  </a>
);
