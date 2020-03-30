/* Prefer performance over elegance, as this code is critical for the runtime */

import hash from '@emotion/hash';
import { CSSProperties, useContext, useEffect, useRef } from 'react';
import { useStyles } from 'react-treat';
import { Style } from 'treat';

import { GlazeContext } from './GlazeContext';
import styleRefs from './useStyling.treat';

export type ThemedStyle = Style & {
  // TODO: Add more precise styles for aliases and shorthands
  [key: string]: CSSProperties[keyof CSSProperties];
};

export function useStyling(): (themedStyle: ThemedStyle) => string {
  const staticClassNames = useStyles(styleRefs);
  const { theme, instancesByClassName } = useContext(GlazeContext);
  const ownedInstancesByClassName = useRef(new Map<string, number>()).current;

  // Remove dynamic styles which are not used anymore when unmounting
  useEffect(
    () => (): void => {
      ownedInstancesByClassName.forEach((usageCount, className) => {
        const remainingInstances =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          instancesByClassName.get(className)! - usageCount;

        if (remainingInstances) {
          instancesByClassName.set(className, remainingInstances);
        } else {
          // Detach unused dynamic style from the DOM
          // TODO: Use `ChildNode.remove()` when dropping IE 11 support
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const element = document.getElementById(className)!;
          document.head.removeChild(element);

          instancesByClassName.delete(className);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return function sx(themedStyle: ThemedStyle): string {
    let className = '';

    // eslint-disable-next-line guard-for-in, no-restricted-syntax
    for (const alias in themedStyle) {
      const value = themedStyle[alias];
      const shorthand = theme.aliases[alias] || alias;

      // eslint-disable-next-line no-loop-func
      (theme.shorthands[shorthand] || [shorthand]).forEach((key) => {
        const style = `${key}:${value}`;

        // TODO: Support selectors and media queries
        if (typeof value !== 'object') {
          let appendedClassName = staticClassNames[style];

          // Attach a class dynamically if needed
          // TODO: Improve support for SSR
          if (!appendedClassName && typeof window !== 'undefined') {
            // TODO: Use same hashing algorithm during static CSS generation
            appendedClassName =
              process.env.NODE_ENV !== 'production'
                ? `DYNAMIC_${key}-${value}`
                : `d_${hash(style)}`;
            let usageCount = instancesByClassName.get(appendedClassName);
            if (!usageCount) {
              usageCount = 0;
              const element = document.createElement('style');
              element.id = appendedClassName;
              element.textContent = `.${appendedClassName}{${style}}`;
              document.head.appendChild(element);
            }
            instancesByClassName.set(appendedClassName, usageCount + 1);
            ownedInstancesByClassName.set(
              appendedClassName,
              (ownedInstancesByClassName.get(appendedClassName) || 0) + 1,
            );
          }

          className += ` ${appendedClassName}`;
        }
      });
    }

    // Remove prepended whitespace
    return className.slice(1);
  };
}
