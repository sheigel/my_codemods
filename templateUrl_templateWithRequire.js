const path = require('path');

export default function transformer(file, api) {
    const j = api.jscodeshift;
    const {
        expression,
        statement,
        statements
    } = j.template;
    const root = j(file.source);
    const resolveRelativePath = (fromFile, toFile) => {
        const from = path.dirname(fromFile)
        const to = './' + toFile
        const relativePath = `./${path.relative(from, to)}`
        console.log('from', from)
        console.log('to', to)
        console.log('relative path', relativePath);
        return relativePath;
    }

    return root
        .find(j.Property, {
            key: {
                name: 'templateUrl'
            }
        })
        .replaceWith(p => {
            return j.property('init', j.identifier('template'),
                j.callExpression(j.identifier('require'), [j.literal(resolveRelativePath(file.path, p.node.value.value))]))
        })
        .toSource()
};
