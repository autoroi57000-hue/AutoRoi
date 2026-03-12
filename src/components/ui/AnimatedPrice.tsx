"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { formatPrice } from "@/lib/utils";

interface AnimatedPriceProps {
  price: number;
  className?: string;
  style?: React.CSSProperties;
}

export function AnimatedPrice({ price, className, style }: AnimatedPriceProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();

  const [displayPrice, setDisplayPrice] = useState(price);
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current || prefersReducedMotion) {
      setDisplayPrice(price);
      return;
    }

    hasAnimated.current = true;
    const duration = 1800;
    let startTime: number;
    let animationFrame: number;

    const easeOutExpo = (t: number): number =>
      t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = easeOutExpo(progress);
      setDisplayPrice(Math.floor(eased * price));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayPrice(price);
        setIsGlowing(true);
        setTimeout(() => setIsGlowing(false), 400);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, price, prefersReducedMotion]);

  return (
    <span
      ref={ref}
      className={className}
      style={{
        ...style,
        ...(isGlowing
          ? {
              textShadow:
                "0 0 24px rgba(201,168,76,0.6), 0 0 48px rgba(201,168,76,0.2)",
              transition: "text-shadow 400ms ease",
            }
          : {
              textShadow: "none",
              transition: "text-shadow 600ms ease",
            }),
      }}
    >
      {formatPrice(displayPrice)}
    </span>
  );
}
