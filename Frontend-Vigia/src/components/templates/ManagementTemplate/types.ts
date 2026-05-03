import type { ReactNode } from "react";

export interface ManagementTemplateProps {
  sidebarTitle: string;
  sidebarSubtitle: string;
  sidebarMark?: string;
  sidebarNav?: ReactNode;
  sidebarFooter?: ReactNode;
  breadcrumb: ReactNode;
  topbarUser: ReactNode;
  mainPanel: ReactNode;
  rightPanel: ReactNode;
  overlay?: ReactNode;
  mainPanelClassName?: string;
  rightPanelClassName?: string;
}
