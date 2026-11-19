import { ChevronLeft, ChevronRight } from "lucide-react";
import "./variant-switcher.css";

export interface VariantOption<T extends string> {
   id: T;
   name: string;
}

interface VariantSwitcherProps<T extends string> {
   options: readonly VariantOption<T>[];
   value: T;
   /** `step` is the direction of travel: 1 forward, -1 back. */
   onChange: (next: T, step: 1 | -1) => void;
   /** The group's accessible name. */
   label: string;
   previousLabel: string;
   nextLabel: string;
   /** The accessible name of one option's dot. */
   optionLabel: (name: string) => string;
}

/**
 * Previous arrow, one dot per option, next arrow, and the current option's
 * name: a small picker for a section that offers more than one version of
 * itself. The arrows wrap around. The caller owns the choice.
 */
const VariantSwitcher = <T extends string>({
   options,
   value,
   onChange,
   label,
   previousLabel,
   nextLabel,
   optionLabel,
}: VariantSwitcherProps<T>) => {
   const index = Math.max(
      0,
      options.findIndex((option) => option.id === value),
   );
   const go = (step: 1 | -1) =>
      onChange(
         options[(index + step + options.length) % options.length].id,
         step,
      );
   // Every name gets the room of the longest, so the row never shifts.
   const longest = Math.max(...options.map((option) => option.name.length));

   return (
      <div
         className="variant-switcher"
         role="group"
         aria-label={label}
         data-variant-switcher=""
      >
         <span
            className="variant-switcher-name"
            data-variant-name=""
            aria-live="polite"
            style={{ minWidth: `calc(${longest}ch + ${longest * 0.12}em)` }}
         >
            {options[index]?.name}
         </span>
         <div className="variant-switcher-controls">
            <button
               type="button"
               className="variant-switcher-arrow"
               data-variant-prev=""
               aria-label={previousLabel}
               onClick={() => go(-1)}
            >
               <ChevronLeft size={16} aria-hidden="true" />
            </button>
            {options.map((option, at) => (
               <button
                  key={option.id}
                  type="button"
                  className="variant-switcher-dot"
                  data-variant-option={option.id}
                  aria-pressed={at === index}
                  aria-label={optionLabel(option.name)}
                  onClick={() => {
                     if (at !== index) onChange(option.id, at > index ? 1 : -1);
                  }}
               >
                  <span aria-hidden="true" />
               </button>
            ))}
            <button
               type="button"
               className="variant-switcher-arrow"
               data-variant-next=""
               aria-label={nextLabel}
               onClick={() => go(1)}
            >
               <ChevronRight size={16} aria-hidden="true" />
            </button>
         </div>
      </div>
   );
};

export default VariantSwitcher;
