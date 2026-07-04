import { useState, useEffect } from "react";

export default function AnimatedCounter({ value, duration = 1000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = parseFloat(value);
    if (isNaN(target)) {
      setCount(value);
      return;
    }
    let start = 0;
    const startTime = performance.now();
    const isDecimal = value.toString().includes(".");

    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      const easedProgress = progress * (2 - progress); // easeOutQuad
      const current = start + easedProgress * (target - start);

      if (isDecimal) {
        setCount(parseFloat(current.toFixed(1)));
      } else {
        setCount(Math.floor(current));
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{count}</>;
}
