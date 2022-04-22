module.exports = {
    extends: ['airbnb-typescript'],
    parserOptions: {
        project: 'tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
    },
    rules: {
        '@typescript-eslint/no-throw-literal': 'off', // allow for string literal to be thrown
        // 'no-redeclare': 'off',
        // '@typescript-eslint/no-redeclare': 'off',
        '@typescript-eslint/no-useless-constructor': 'off', // allow for empty constructor
        '@typescript-eslint/indent': 'off', // allow for indentation
        '@typescript-eslint/lines-between-class-members': 'off',
        'linebreak-style': ['off', 'windows'],
        'arrow-body-style': 'off', // disable forced shorthand for arrow body
        'no-underscore-dangle': [
            'error',
            {
                enforceInMethodNames: false,
                allowAfterThis: true,
                allow: ['__eventListeners'],
            },
        ], // allow _ for method name prefix & fabric.js __eventListeners api
        'react/jsx-filename-extension': 'off',
        'import/prefer-default-export': 'off', // turn off prefer-default-export
        'import/no-extraneous-dependencies': 'off',
        'import/extensions': 'off',
        'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
        'max-len': ['warn', { code: 200 }],
    },
};