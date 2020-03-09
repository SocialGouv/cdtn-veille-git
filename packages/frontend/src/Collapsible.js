import React, { useState } from "react";

const Collapsible = ({ trigger, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <span onClick={() => setOpen(!open)}>{trigger}</span>
      {(open && children) || null}
    </div>
  );
};

export default Collapsible;
