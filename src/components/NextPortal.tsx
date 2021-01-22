import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  selector: string;
};

const NextPortal: React.FC<Props> = ({ children, selector }) => {
  const ref = useRef();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // @ts-ignore
    ref.current = document.querySelector(selector);
    setMounted(true);
  }, [selector]);
  // @ts-ignore
  return mounted ? createPortal(children, ref.current) : null;
};

export default NextPortal;
