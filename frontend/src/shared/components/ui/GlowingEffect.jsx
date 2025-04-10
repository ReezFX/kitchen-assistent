"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { animate } from "framer-motion";

// Food-themed color palette using CSS variables to match the color system
const colors = {
  pumpkin: "var(--color-pumpkin)",       // Vibrant orange
  redwood: "var(--color-redwood)",       // Deep burgundy
  bluegray: "var(--color-blue-gray)",    // Cool blue 
  maize: "var(--color-maize)",           // Bright yellow/gold
  vermilion: "var(--color-vermilion)",   // Bright red-orange
};

/**
 * GlowingEffect Component - Creates a glowing border effect that reacts to mouse movement
 * 
 * @param {Object} props
 * @param {number} [props.blur=0] - Blur amount for the glow effect
 * @param {number} [props.inactiveZone=0.7] - Size of the inactive zone relative to element size
 * @param {number} [props.proximity=0] - Extra area around element where effect is active
 * @param {number} [props.spread=20] - Spread of the glow effect
 * @param {string} [props.variant="default"] - Color variant ("default" or "white")
 * @param {boolean} [props.glow=false] - Whether the glow effect is enabled
 * @param {string} [props.className] - Additional CSS classes
 * @param {number} [props.movementDuration=2] - Duration of the animation in seconds
 * @param {number} [props.borderWidth=1] - Width of the glowing border
 * @param {boolean} [props.disabled=true] - Whether the effect is disabled
 */
const GlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.7,
    proximity = 0,
    spread = 20,
    variant = "default",
    glow = false,
    className = "",
    movementDuration = 2,
    borderWidth = 1,
    disabled = true,
  }) => {
    const containerRef = useRef(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef(0);

    const handleMove = useCallback(
      (e) => {
        if (!containerRef.current) return;

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          const element = containerRef.current;
          if (!element) return;

          const { left, top, width, height } = element.getBoundingClientRect();
          const mouseX = e?.x ?? lastPosition.current.x;
          const mouseY = e?.y ?? lastPosition.current.y;

          if (e) {
            lastPosition.current = { x: mouseX, y: mouseY };
          }

          const center = [left + width * 0.5, top + height * 0.5];
          const distanceFromCenter = Math.hypot(
            mouseX - center[0],
            mouseY - center[1]
          );
          const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

          if (distanceFromCenter < inactiveRadius) {
            element.style.setProperty("--active", "0");
            return;
          }

          const isActive =
            mouseX > left - proximity &&
            mouseX < left + width + proximity &&
            mouseY > top - proximity &&
            mouseY < top + height + proximity;

          element.style.setProperty("--active", isActive ? "1" : "0");

          if (!isActive) return;

          const currentAngle =
            parseFloat(element.style.getPropertyValue("--start")) || 0;
          let targetAngle =
            (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
              Math.PI +
            90;

          const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
          const newAngle = currentAngle + angleDiff;

          animate(currentAngle, newAngle, {
            duration: movementDuration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (value) => {
              element.style.setProperty("--start", String(value));
            },
          });
        });
      },
      [inactiveZone, proximity, movementDuration]
    );

    useEffect(() => {
      if (disabled) return;

      const handleScroll = () => handleMove();
      const handlePointerMove = (e) => handleMove(e);

      window.addEventListener("scroll", handleScroll, { passive: true });
      document.body.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        window.removeEventListener("scroll", handleScroll);
        document.body.removeEventListener("pointermove", handlePointerMove);
      };
    }, [handleMove, disabled]);

    // Create classNames without using cn utility
    const firstDivClass = `
      pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity
      ${glow ? "opacity-100" : ""}
      ${variant === "white" ? "border-white" : ""}
      ${disabled ? "!block" : ""}
    `.trim();

    const secondDivClass = `
      pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity
      ${glow ? "opacity-100" : ""}
      ${blur > 0 ? "blur-[var(--blur)]" : ""}
      ${className}
      ${disabled ? "!hidden" : ""}
    `.trim();

    const innerDivClass = `
      glow
      rounded-[inherit]
      after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]
      after:[border:var(--glowingeffect-border-width)_solid_transparent]
      after:[background:var(--gradient)] after:[background-attachment:fixed]
      after:opacity-[var(--active)] after:transition-opacity after:duration-300
      after:[mask-clip:padding-box,border-box]
      after:[mask-composite:intersect]
      after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]
    `.trim();

    return (
      <>
        <div className={firstDivClass} />
        <div
          ref={containerRef}
          style={{
            "--blur": `${blur}px`,
            "--spread": spread,
            "--start": "0",
            "--active": "0",
            "--glowingeffect-border-width": `${borderWidth}px`,
            "--repeating-conic-gradient-times": "5",
            "--gradient":
              variant === "white"
                ? `repeating-conic-gradient(
                from 236.84deg at 50% 50%,
                var(--black),
                var(--black) calc(25% / var(--repeating-conic-gradient-times))
              )`
                : `radial-gradient(circle, ${colors.vermilion} 10%, ${colors.vermilion}00 20%),
                  radial-gradient(circle at 40% 40%, ${colors.maize} 5%, ${colors.maize}00 15%),
                  radial-gradient(circle at 60% 60%, ${colors.bluegray} 10%, ${colors.bluegray}00 20%), 
                  radial-gradient(circle at 40% 60%, ${colors.pumpkin} 10%, ${colors.pumpkin}00 20%),
                  repeating-conic-gradient(
                    from 236.84deg at 50% 50%,
                    ${colors.vermilion} 0%,
                    ${colors.maize} calc(25% / var(--repeating-conic-gradient-times)),
                    ${colors.bluegray} calc(50% / var(--repeating-conic-gradient-times)), 
                    ${colors.pumpkin} calc(75% / var(--repeating-conic-gradient-times)),
                    ${colors.vermilion} calc(100% / var(--repeating-conic-gradient-times))
                  )`,
          }}
          className={secondDivClass}
        >
          <div className={innerDivClass} />
        </div>
      </>
    );
  }
);

GlowingEffect.displayName = "GlowingEffect";

export { GlowingEffect }; 