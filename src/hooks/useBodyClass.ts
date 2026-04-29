import { useEffect } from "react";

/**
 * A hook to declaratively manage a class on document.body.
 *
 * @param className - The class to add/remove
 * @param condition - Optional condition to determine if the class should be present
 */
export function useBodyClass(className: string, condition: boolean = true) {
  useEffect(() => {
    if (condition) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }

    return () => {
      document.body.classList.remove(className);
    };
  }, [className, condition]);
}
