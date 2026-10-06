// Presentation only: every result still represents an exact catalogue SKU.
// Keep different wording, sizes, artwork or duplicate pack labels in separate rows.
export function groupSearchResults(products) {
  const families = new Map();
  for (const product of products) {
    const key = product.product_family_id ?? product.id;
    if (!families.has(key)) families.set(key, []);
    families.get(key).push(product);
  }
  const fields = ['display_name_en', 'display_name_vi', 'dimensions_display', 'image_url'];
  return [...families.values()].flatMap(members => {
    const shared = members.length > 1
      && members.every(product => product.edition)
      && new Set(members.map(product => product.edition)).size === members.length
      && fields.every(field => members.every(product => product[field] === members[0][field]));
    return shared ? [{ shared, products: members }]
      : members.map(product => ({ shared: false, products: [product] }));
  });
}
