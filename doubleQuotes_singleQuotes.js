export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  return root.find(j.Literal)
  .filter(p=>p.node.raw===`"${p.node.value}"`)
  .replaceWith(p=>{
    return j.literal(`${p.node.value}`);
  })
  .toSource({quote:'single'});
};
