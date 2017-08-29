

export function convertJSON(input: any): any {

  const recipes = input.recipes.map(r => {
    return {
      ingredients: r.ingredients.map(getName),
      results: r.results.map(getName),
    };
  });

  recipes.forEach(r => {
    r.hash = makeHash(r.ingredients);
  });

  const names = Object.values(input.names).map(n => n.replace(' ', ''));

  return {
    recipes,
    names
  };

  function getName(i) {
    return toTitleCase(input.names[i]);
  }
}

export function makeHash(input) {
  return [...input].sort().join(' + ');
}

export function makeId(input) {
  return input.toLowerCase().replace(/\s/g, '');
}

export function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}