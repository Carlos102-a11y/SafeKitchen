import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  children?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  children,
}: PageHeaderProps) {
  return (
    <header className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconBox}>
          <Icon size={30} />
        </div>

        <div>
          <h1 className={styles.title}>
            {title}
          </h1>

          {subtitle && (
            <p className={styles.subtitle}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        {children}
      </div>
    </header>
  );
}