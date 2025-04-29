import * as React from "react";
import { cn } from "@/lib/utils"; // Import cn for conditional classes

interface EcpLogoProps extends React.SVGProps<SVGSVGElement> {
  // No specific props added, but allows passing standard SVG attributes like className, etc.
}

/**
 * Reusable ECP Mortgage Logo Component.
 * Renders the logo as an SVG element.
 * Inherits text color via `currentColor` for the "ECP" part, allowing theme adaptation via className.
 * The "Mortgage" part uses the standard foreground color.
 */
export const EcpLogo: React.FC<EcpLogoProps> = ({ className, ...props }) => (
    <svg
        width="160" // Base width
        height="40" // Base height
        viewBox="0 0 160 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img" // Indicate it's an image
        aria-label="ECP Mortgage Logo" // Provide accessible name
        className={cn("text-primary", className)} // Apply base primary color and allow overrides
        {...props} // Spread any additional SVG props (like style, id)
    >
        {/* ECP Letters - Bold, Primary Color */}
        <text
            x="10"
            y="29" // Adjusted for visual vertical center
            fontFamily="Articulat CF, sans-serif" // Use the specified secondary font
            fontSize="24" // Larger size for brand name
            fontWeight="bold" // Bold weight as specified
            fill="currentColor" // Inherits color from parent SVG (primary by default)
            letterSpacing="-0.5" // Optional: slight tightening
        >
            ECP
        </text>
        {/* Mortgage Text - Regular Weight, Foreground Color */}
        <text
            x="72" // Positioned relative to "ECP"
            y="29" // Vertically aligned with "ECP"
            fontFamily="var(--font-quicksand), sans-serif" // Use the specified primary font (via CSS variable)
            fontSize="20" // Slightly smaller than "ECP"
            fontWeight="500" // Medium weight for Quicksand often looks good
            fill="hsl(var(--foreground))" // Use the theme's standard foreground text color
        >
            Mortgage
        </text>
    </svg>
);