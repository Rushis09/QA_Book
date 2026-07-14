import type { ComponentType } from "react";
import type { SvgIconProps } from "@mui/material/SvgIcon";

export interface NavigationItem {
  label: string;
  path: string;
  icon: ComponentType<SvgIconProps>;
}