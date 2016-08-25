export default function transformer(file, api, options) {

  const j = api.jscodeshift;
  const {expression, statement, statements} = j.template;
  const root = j(file.source);

  const outputNewErrorClass = (nameOfError)=> {
    root
    .find(j.Program)
    .replaceWith(p=>{
    let existingBodyExpressions = p.node.body
    let newErrorTypeDefinition = (name)=> (
      j.classDeclaration(
        j.identifier(name),
        j.classBody([
          j.methodDefinition(
            'constructor',
            j.identifier('constructor'),
            j.functionExpression(
              null,
              [j.identifier('message')],
              j.blockStatement([
                j.expressionStatement(
                  j.callExpression(j.super(),[j.identifier('message')])
                ),
                j.expressionStatement(
                j.assignmentExpression(
                "=",
                j.memberExpression(j.super(),j.identifier('name')),
                j.literal(name)
                )
                )
              ])))
        ]),
      	j.identifier('Error')
    ))
    
    return j.program([newErrorTypeDefinition(nameOfError),...existingBodyExpressions,]);
  });
}
  root
  .find(j.ThrowStatement,{argument:j.ObjectExpression.check})
  .forEach(p=>{
    j(p.node)
    .find(j.Property,{key:{name:'name'}})
    .forEach(p=> outputNewErrorClass(p.node.value.value))
  })
   //let newErrorClass=root
    //.find(j.ThrowStatement,{argument:j.ObjectExpression.check})
    //.get(0).node;
    //console.log(newErrorClass);

  return root.toSource(options.printOptions || {quote: 'single'});
};
