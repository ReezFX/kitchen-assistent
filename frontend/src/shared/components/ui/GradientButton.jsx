import React from "react";
import PropTypes from "prop-types";
import { cn } from "../../../lib/utils";

// Food-themed color palette using CSS variables
const colors = {
  primary: 'var(--color-pumpkin)',    // Vibrant orange
  secondary: 'var(--color-blue-gray)', // Cool blue
  accent: 'var(--color-maize)',       // Bright yellow/gold
  dark: 'var(--color-redwood)',       // Deep burgundy
};

/**
 * GradientButton component with advanced gradient animation
 */
const gradientButtonVariants = {
  base: "gradient-button",
  variant: "gradient-button-variant",
};

// Add food-themed CSS variables to document root
if (typeof document !== 'undefined') {
  document.documentElement.style.setProperty('--color-1', colors.primary);
  document.documentElement.style.setProperty('--color-2', colors.primary);
  document.documentElement.style.setProperty('--color-3', colors.accent);
  document.documentElement.style.setProperty('--color-4', colors.secondary);
  document.documentElement.style.setProperty('--color-5', colors.primary);
  document.documentElement.style.setProperty('--border-color-1', `${colors.primary}55`);
  document.documentElement.style.setProperty('--border-color-2', colors.primary);
}

const GradientButton = React.forwardRef(({ 
  className, 
  $variant = "default",
  children,
  ...props 
}, ref) => {
  const variantClass = $variant === "variant" ? gradientButtonVariants.variant : "";
  
  return (
    <button
      className={cn(gradientButtonVariants.base, variantClass, className)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

GradientButton.displayName = "GradientButton";

GradientButton.propTypes = {
  className: PropTypes.string,
  $variant: PropTypes.oneOf(["default", "variant"]),
  children: PropTypes.node.isRequired
};

export { GradientButton }; 