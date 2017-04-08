
const OFF = 0;
const WARNING = 1;
const ERROR = 2;

module.exports = {
    'parserOptions': {
        'strict': OFF,
        'ecmaVersion': 6,
        'sourceType': 'module'
    },
    'globals': {
        'document': true,
        'window': true,
        'spy': true,
        'mocha': true,
        'stub': true,
        'beforeEach': true,
        'useFakeTimers': true,
        'useFakeXMLHttpRequest': true,
        'useFakeServer': true
    },
    'ecmaFeatures': {
        'jsx': true,
        'modules': true,
        'spread': true
    },
    'env': {
        'es6': true,
        'browser': true,
        'mocha': true,
        'commonjs': true,
        'node': true
    },
    // prevent eslint from taking user's eslint config files that are higher
    // in the directory structure into consideration.
    root: true,

    rules: {
        'accessor-pairs': OFF,
        'brace-style': [ERROR, '1tbs'],
        'comma-dangle': [ERROR, 'never'],
        'camelcase': OFF,
        'consistent-return': OFF,
        'dot-location': [ERROR, 'property'],
        'dot-notation': ERROR,
        'eol-last': OFF,
        'eqeqeq': WARNING,
        'indent': OFF,
        'jsx-quotes': [ERROR, 'prefer-double'],
        'no-cond-assign': [ERROR, 'except-parens'],
        'no-console': OFF,
        'no-constant-condition': ERROR,
        'no-debugger': WARNING,
        'no-bitwise': OFF,
        'no-floating-decimal': ERROR,
        'no-multi-spaces': WARNING,
        'no-mixed-spaces-and-tabs': [ERROR, 'smart-tabs'],
        'no-restricted-syntax': [ERROR, 'WithStatement'],
        'no-shadow': ERROR,
        'no-multiple-empty-lines': OFF,
        'no-nested-ternary': WARNING,
        'no-new-object': ERROR,
        'no-spaced-func': ERROR,
        'no-ternary': OFF,
        'no-trailing-spaces': WARNING,
        'no-underscore-dangle': OFF,
        'no-extra-parens': [ERROR, 'functions'],
        'no-unused-vars': [WARNING, {
            args: 'none'
        }],
        'no-dupe-keys': ERROR,
        'no-duplicate-case': ERROR,
        'no-empty-character-class': ERROR,
        'no-ex-assign': ERROR,
        'no-extra-semi': WARNING,
        'no-func-assign': ERROR,
        'no-inner-declarations': [WARNING, 'both'],
        'no-invalid-regexp': ERROR,
        'no-iterator': OFF,
        'no-labels': ERROR,
        'no-lone-blocks': ERROR,
        'no-loop-func': ERROR,
        'no-multi-str': WARNING,
        'no-native-reassign': ERROR,
        'no-new-func': ERROR,
        'no-new-wrappers': ERROR,
        'no-octal': ERROR,
        'no-octal-escape': ERROR,
        'no-param-reassign': OFF,
        'no-process-env': ERROR,
        'no-proto': ERROR,
        'no-redeclare': ERROR,
        'no-script-url': OFF,
        'no-implied-eval': ERROR,
        'no-irregular-whitespace': ERROR,
        'no-negated-in-lhs': ERROR,
        'no-obj-calls': ERROR,
        'no-regex-spaces': ERROR,
        'no-sparse-arrays': OFF,
        'no-unreachable': ERROR,
        'no-div-regex': ERROR,
        'no-eq-null': ERROR,
        'no-eval': ERROR,
        'no-return-assign': ERROR,
        'radix': ERROR,
        'vars-on-top': OFF,
        'wrap-iife': [ERROR, 'any'],
        'yoda': OFF,
        'no-catch-shadow': ERROR,
        'no-delete-var': ERROR,
        'no-label-var': ERROR,
        'no-shadow-restricted-names': OFF,
        'quote-props': [ERROR, 'as-needed', {
            'keywords': true,
            'unnecessary': false
        }],
        'quotes': [WARNING, 'single', 'avoid-escape'],
        'semi-spacing': [ERROR, {
            'after': true
        }],
        'semi': [ERROR, 'always'],
        'space-before-blocks': OFF,
        'space-before-function-paren': OFF,
        'strict': [ERROR, 'global'],
        'keyword-spacing': OFF,
        'space-infix-ops': OFF,
        'space-unary-ops': [ERROR, {
            'words': true
        }],
        'spaced-comment': [WARNING, 'always', {
            'exceptions': ['*!'],
            "block": {
                "markers": ["!"],
                "exceptions": ["*"],
                "balanced": true
            }
        }],
        'wrap-regex': ERROR,
        'constructor-super': ERROR,
        'no-class-assign': ERROR,
        'no-const-assign': ERROR,
        'no-this-before-super': ERROR,
        'no-var': OFF,
        'prefer-spread': ERROR
    }
};
