// src/components/UnderlineGrow.tsx
import React from 'react';

type Props = {
  children: React.ReactNode;
};

const UnderlineGrow: React.FC<Props> = ({ children }) => {
  return (
    <span
      className="
        relative inline-block
        after:content-[''] after:absolute after:left-0 after:-bottom-1
        after:h-[3px] after:w-0 after:bg-purple-500
        after:transition-all after:duration-300 after:ease-in-out
        hover:after:w-full
      "
    >
      {children}
    </span>
  );
};

export default UnderlineGrow;
