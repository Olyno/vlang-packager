# vlang-packager

A simple script to download and build [V language](https://github.com/vlang/v).

This project includes a Github Action to setup V language.

## Usage

**Using in a node project:**

```shell
npm i -D vlang-packager # or yarn add -D vlang-packager
v help
```

**Using in a Github Action:**

```yml
name: My Workflow

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - uses: Olyno/vlang-packager@0.1.0
    - run: v help
```

## License

Code released under GPL-3.0 license.

Copyright ©, [Olyno](https://github.com/Olyno).