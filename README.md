code-translator-cli
=========
[![npm version](https://badge.fury.io/js/code-translator-cli.svg)](https://badge.fury.io/js/code-translator-cli)
[![dependencies Status](https://david-dm.org/iyegoroff/code-translator-cli/status.svg)](https://david-dm.org/iyegoroff/code-translator-cli)
[![devDependency Status](https://david-dm.org/iyegoroff/code-translator-cli/dev-status.svg)](https://david-dm.org/iyegoroff/code-translator-cli?type=dev)
[![npm](https://img.shields.io/npm/l/express.svg)](https://www.npmjs.com/package/code-translator-cli)

Command line tool for [CodeTranslator](http://www.carlosag.net/tools/codetranslator/) service. Converts whole folders of specified sources.

## Installation

```bash
$ npm i code-translator-cli -g
```

## Usage

```bash
$ code-translator-cli <input_dir> <output_dir> <input_lang> <output_lang>
```

`input_language` can be `VB`, `C#`, or `JAVA` </br>
`output_language` can be `VB`, `C#`, `JAVA` or `TS`