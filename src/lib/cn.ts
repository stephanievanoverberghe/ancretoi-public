import { twMerge } from 'tailwind-merge';

export type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

const textSizePattern =
  /^text-(?:xs|sm|base|lg|xl|[2-9]xl|caption|body-sm|body|body-lg|heading-sm|heading-md|heading-lg|heading-xl)$/;
const fontWeightPattern = /^font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black|\[(?:number:)?[^\]]+\])$/;
const borderWidthPattern = /^border(?:-[xytrblse])?(?:-(?:0|2|4|8))?$/;
const divideWidthPattern = /^divide-[xy](?:-(?:0|2|4|8|reverse|\[[^\]]+\]))?$/;

function isArbitraryLength(value: string): boolean {
  return /^(?:(?:length|size):|[-+]?(?:\d*\.)?\d+(?:px|r?em|%|ch|ex|lh|vw|vh|vmin|vmax|dvw|dvh)|(?:calc|min|max|clamp)\(|var\(--(?:font-size|text-|space|spacing|radius|border-width))/.test(
    value,
  );
}

function splitClassName(className: string): string[] {
  return className.trim().split(/\s+/).filter(Boolean);
}

function splitModifier(className: string): { modifier: string; utility: string } {
  let bracketDepth = 0;
  let modifierEnd = -1;

  for (let index = 0; index < className.length; index += 1) {
    const character = className[index];

    if (character === '[' || character === '(') bracketDepth += 1;
    if (character === ']' || character === ')') bracketDepth = Math.max(0, bracketDepth - 1);
    if (character === ':' && bracketDepth === 0) modifierEnd = index;
  }

  if (modifierEnd === -1) return { modifier: '', utility: className };

  return {
    modifier: className.slice(0, modifierEnd + 1),
    utility: className.slice(modifierEnd + 1),
  };
}

/**
 * Retourne le groupe de conflit des utilitaires utilises par les primitives.
 * Ce n'est volontairement pas une reimplementation exhaustive de Tailwind :
 * les classes inconnues sont conservees, tandis que les familles usuelles
 * (couleurs, rayons, espacements, tailles, layout) suivent "la derniere gagne".
 */
function getClassGroup(className: string): string | null {
  const utility = className.replace(/^!/, '').replace(/^-/, '');

  if (/^(?:static|fixed|absolute|relative|sticky)$/.test(utility)) return 'position';
  if (/^(?:block|inline-block|inline|flex|inline-flex|grid|inline-grid|contents|flow-root|hidden)$/.test(utility)) return 'display';
  if (/^overflow-(?:auto|hidden|clip|visible|scroll)$/.test(utility)) return 'overflow';
  if (/^overflow-x-/.test(utility)) return 'overflow-x';
  if (/^overflow-y-/.test(utility)) return 'overflow-y';

  if (/^inset-x-/.test(utility)) return 'inset-x';
  if (/^inset-y-/.test(utility)) return 'inset-y';
  if (/^inset-/.test(utility)) return 'inset';
  if (/^top-/.test(utility)) return 'top';
  if (/^right-/.test(utility)) return 'right';
  if (/^bottom-/.test(utility)) return 'bottom';
  if (/^left-/.test(utility)) return 'left';
  if (/^z-/.test(utility)) return 'z-index';

  if (/^flex-(?:row|row-reverse|col|col-reverse)$/.test(utility)) return 'flex-direction';
  if (/^flex-(?:wrap|wrap-reverse|nowrap)$/.test(utility)) return 'flex-wrap';
  if (/^flex-(?:1|auto|initial|none|\[.+\])$/.test(utility)) return 'flex';
  if (/^grow(?:-.+)?$/.test(utility)) return 'grow';
  if (/^shrink(?:-.+)?$/.test(utility)) return 'shrink';
  if (/^grid-cols-/.test(utility)) return 'grid-cols';
  if (/^grid-rows-/.test(utility)) return 'grid-rows';
  if (/^col-span-/.test(utility)) return 'col-span';
  if (/^row-span-/.test(utility)) return 'row-span';
  if (/^gap-x-/.test(utility)) return 'gap-x';
  if (/^gap-y-/.test(utility)) return 'gap-y';
  if (/^gap-/.test(utility)) return 'gap';
  if (/^items-/.test(utility)) return 'align-items';
  if (/^justify-items-/.test(utility)) return 'justify-items';
  if (/^justify-/.test(utility)) return 'justify-content';
  if (/^content-/.test(utility)) return 'align-content';
  if (/^self-/.test(utility)) return 'align-self';
  if (/^place-items-/.test(utility)) return 'place-items';
  if (/^place-content-/.test(utility)) return 'place-content';

  const spacingMatch = utility.match(/^(p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me)-/);
  if (spacingMatch) return `spacing-${spacingMatch[1]}`;
  if (/^space-x-/.test(utility)) return 'space-x';
  if (/^space-y-/.test(utility)) return 'space-y';

  const sizeMatch = utility.match(/^(size|w|min-w|max-w|h|min-h|max-h)-/);
  if (sizeMatch) return `size-${sizeMatch[1]}`;

  const roundedSide = utility.match(/^rounded-(t|r|b|l|s|e|tl|tr|br|bl|ss|se|ee|es)(?:-.+)?$/);
  if (roundedSide) return `radius-${roundedSide[1]}`;
  if (/^rounded(?:-.+)?$/.test(utility)) return 'radius-all';

  if (borderWidthPattern.test(utility)) {
    const side = utility.match(/^border(?:-([xytrblse]))?/)?.[1] ?? 'all';
    return `border-width-${side}`;
  }
  const arbitraryBorder = utility.match(/^border(?:-([xytrblse]))?-\[(.+)\]$/);
  if (arbitraryBorder) {
    const side = arbitraryBorder[1] ?? 'all';
    return isArbitraryLength(arbitraryBorder[2]) ? `border-width-${side}` : `border-color-${side}`;
  }
  if (/^border-(?:solid|dashed|dotted|double|hidden|none)$/.test(utility)) return 'border-style';
  if (/^border-(?:x|y|t|r|b|l|s|e)-/.test(utility)) {
    const side = utility.match(/^border-([xytrblse])-/)?.[1] ?? 'all';
    return `border-color-${side}`;
  }
  if (/^border-/.test(utility)) return 'border-color-all';
  if (divideWidthPattern.test(utility)) return utility.startsWith('divide-x') ? 'divide-x-width' : 'divide-y-width';
  if (/^divide-/.test(utility)) return 'divide-color';

  if (/^bg-(?:cover|contain|auto)$/.test(utility)) return 'background-size';
  if (/^bg-(?:fixed|local|scroll)$/.test(utility)) return 'background-attachment';
  if (/^bg-(?:bottom|center|left|left-bottom|left-top|right|right-bottom|right-top|top)$/.test(utility)) return 'background-position';
  if (/^bg-(?:repeat|no-repeat|repeat-x|repeat-y|repeat-round|repeat-space)$/.test(utility)) return 'background-repeat';
  if (/^bg-/.test(utility)) return 'background';

  if (textSizePattern.test(utility)) return 'font-size';
  const arbitraryText = utility.match(/^text-\[(.+)\]$/);
  if (arbitraryText && isArbitraryLength(arbitraryText[1])) return 'font-size';
  if (/^text-(?:left|center|right|justify|start|end)$/.test(utility)) return 'text-align';
  if (/^text-(?:ellipsis|clip)$/.test(utility)) return 'text-overflow';
  if (/^text-/.test(utility)) return 'text-color';
  if (/^font-(?:sans|serif|mono|body|display|\[family:.+\])$/.test(utility)) return 'font-family';
  if (fontWeightPattern.test(utility)) return 'font-weight';
  if (/^leading-/.test(utility)) return 'line-height';
  if (/^tracking-/.test(utility)) return 'letter-spacing';
  if (/^whitespace-/.test(utility)) return 'whitespace';

  if (/^shadow(?:-.+)?$/.test(utility)) return 'shadow';
  if (/^ring-offset-(?:0|1|2|4|8|\[.+\])$/.test(utility)) return 'ring-offset-width';
  if (/^ring-offset-/.test(utility)) return 'ring-offset-color';
  if (/^ring(?:-(?:0|1|2|4|8|inset))?$/.test(utility)) return utility === 'ring-inset' ? 'ring-inset' : 'ring-width';
  const arbitraryRing = utility.match(/^ring-\[(.+)\]$/);
  if (arbitraryRing) return isArbitraryLength(arbitraryRing[1]) ? 'ring-width' : 'ring-color';
  if (/^ring-/.test(utility)) return 'ring-color';
  if (/^outline-(?:none|hidden|solid|dashed|dotted|double)$/.test(utility)) return 'outline-style';
  if (/^outline-offset-/.test(utility)) return 'outline-offset';
  if (/^outline-/.test(utility)) return 'outline-color';
  if (/^opacity-/.test(utility)) return 'opacity';
  if (/^cursor-/.test(utility)) return 'cursor';
  if (/^pointer-events-/.test(utility)) return 'pointer-events';
  if (/^select-/.test(utility)) return 'user-select';
  if (/^transition(?:-.+)?$/.test(utility)) return 'transition-property';
  if (/^duration-/.test(utility)) return 'transition-duration';
  if (/^delay-/.test(utility)) return 'transition-delay';
  if (/^ease-/.test(utility)) return 'transition-timing';
  if (/^animate-/.test(utility)) return 'animation';
  if (/^translate-x-/.test(utility)) return 'translate-x';
  if (/^translate-y-/.test(utility)) return 'translate-y';
  if (/^scale-/.test(utility)) return 'scale';
  if (/^rotate-/.test(utility)) return 'rotate';

  return null;
}

/**
 * Compose des classes conditionnelles et resout les conflits Tailwind usuels
 * sans ajouter de dependance au bundle.
 */
export function cn(...inputs: ClassValue[]): string {
  const rawClasses: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string' || typeof input === 'number') {
      rawClasses.push(...splitClassName(String(input)));
      continue;
    }

    if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) rawClasses.push(...splitClassName(nested));
      continue;
    }

    for (const [className, enabled] of Object.entries(input)) {
      if (enabled) rawClasses.push(...splitClassName(className));
    }
  }

  const classes: Array<string | null> = [];
  const groupIndexes = new Map<string, number>();

  for (const className of rawClasses) {
    const { modifier, utility } = splitModifier(className);
    const group = getClassGroup(utility);

    if (!group) {
      classes.push(className);
      continue;
    }

    const groupKey = `${modifier}${group}`;
    const previousIndex = groupIndexes.get(groupKey);
    if (previousIndex !== undefined) classes[previousIndex] = null;

    groupIndexes.set(groupKey, classes.length);
    classes.push(className);
  }

  return twMerge(
    classes.filter((className): className is string => className !== null).join(' '),
  );
}
