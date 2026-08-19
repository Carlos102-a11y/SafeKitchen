import { Search, X } from "lucide-react";

import styles from "./SearchBar.module.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Pesquisar...",
}: SearchBarProps) {
  return (
    <div className={styles.container}>
      <Search
        size={18}
        className={styles.searchIcon}
      />

      <input
        className={styles.input}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />

      {value && (
        <button
          className={styles.clearButton}
          onClick={() => onChange("")}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}