/**
 * 
 * @param {never} _val 
 * exhaustive guard throws an error if a type or an if function
 * is not covered, for more examples and information,
 * check battle-menu.js
 */
export function exhaustiveGuard(_val) {
  throw new Error(
    `Error! Reach forbidden guard function with unexpected value: ${JSON.stringify(
      _val
    )}`
  );
}

