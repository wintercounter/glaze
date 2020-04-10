// TODO: Preserve exact type of inputs
export function modularScale(
  ratio: number,
  steps = [-1, -0.5, 0, +1, +2, +3, +4, +5, +6],
): { readonly [key: number]: string } {
  const tokens: { [key: number]: string } = {};
  steps.forEach((step) => {
    // Rounding to 3 decimal places
    tokens[step] = `${Math.round(ratio ** step * 1e3) / 1e3}rem`;
  });
  return tokens;
}

// TODO: Preserve exact type of inputs
export function symmetricScale(tokens: {
  [key: string]: string | number;
}): { readonly [key: string]: string | number } {
  return Object.entries(tokens).reduce(
    (scale, [key, value]) => {
      // eslint-disable-next-line no-param-reassign
      if (key !== '0') scale[`-${key}`] = `-${value}`;
      return scale;
    },
    { ...tokens },
  );
}
