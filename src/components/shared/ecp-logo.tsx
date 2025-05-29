import * as React from "react";
import { cn } from "@/lib/utils"; // Import cn for conditional classes

interface EcpLogoProps extends React.SVGProps<SVGSVGElement> {
  // No specific props added, but allows passing standard SVG attributes like className, etc.
}

export const EcpLogo: React.FC<EcpLogoProps> = ({ className, ...props }) => (
  <img
    src="/logo.png"
    alt="ECP Mortgage Logo"
    className={cn("h-10 w-auto", className)}
  />
);
