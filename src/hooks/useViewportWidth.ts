import { useEffect, useState } from "react";

export function useViewportWidth() {
  const [largura, setLargura] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1440
  );

  useEffect(() => {
    function atualizar() {
      setLargura(window.innerWidth);
    }

    window.addEventListener("resize", atualizar);

    return () => {
      window.removeEventListener("resize", atualizar);
    };
  }, []);

  return largura;
}