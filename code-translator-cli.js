#!/usr/bin/env node

const glob = require('glob');
const http = require('http');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const ProgressBar = require('progress');
const promisify = require('prmzfy');

const matchFiles = promisify(glob);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const createFolder = promisify(mkdirp);

const hostname = 'www.carlosag.net';

const inputExtensions = {
    VB: ['vb', 'bas', 'cls'],
    'C#': ['cs'],
    JAVA: ['java']
};

const outputExtension = {
    VB: 'vb',
    'C#': 'cs',
    JAVA: 'java',
    TS: 'ts'
};

const usage = () => {
    console.log(
        '\nUsage: code-translator-cli <input_folder> <output_folder> <input_language> <output_language>\n\n',
        '      - input_language:   VB, C#, JAVA\n',
        '      - output_language:  VB, C#, JAVA, TS\n'
    );
};

const convertFiles = (input, output, from, to) => {
    return Promise.all([matchFiles(`${input}/**/*.*`), fetchEncode()])
        .then(([files, encode]) => {
            const bar = new ProgressBar(
                'converting [:bar] :percent',
                {
                    total: files.length,
                    width: 20
                }
            );

            return Promise.all(files.map(inputName => {
                const outputName = convertExtension(inputName.replace(input, output), from, to);

                return createFolder(path.dirname(outputName))
                    .then(() => readFile(inputName))
                    .then(data => {
                        return shouldBeConverted(inputName, from)
                            ? convert(encode(nullFix(data.toString())), from, to)
                            : data;
                    })
                    .then(data => writeFile(outputName, data))
                    .then(() => bar.tick());
            }));
        })
        .catch(err => console.log(err));
};

const nullFix = (data) => {
    return data.replace(/null == ([^) ]*)/g, '$1 == null');
};

const convertExtension = (filename, from, to) => {
    return filename.replace(new RegExp(`\\.(${inputExtensions[from].join('|')})$`), `.${outputExtension[to]}`);
};

const shouldBeConverted = (filename, from) => {
    return inputExtensions[from].includes(path.extname(filename).slice(1));
};

const fetchEncode = () => {
    return new Promise((resolve, reject) => {
        http.get(
            `http://${hostname}/tools/codetranslator/`,
            res => responseHandler(res, resolve)
        ).on('error', reject);
    }).then(data => {
        const text = data.toString().match(/function Encode[\s\S]*/)[0];

        let index = 0;
        let bracketStackSize = null;

        while (bracketStackSize !== 0) {
            const char = text[index++];

            if (char === '{') {
                bracketStackSize += 1;
            } else if (char === '}') {
                bracketStackSize -= 1;
            }
        }

        /* eslint-disable no-new-func */

        return new Function(`return ${text.slice(0, index).replace('Encode', '')}`)();

        /* eslint-enable no-new-func */
    });
};

const convert = (data, from, to) => {
    const postData = `Code=${data}&Language=${from}&DestinationLanguage=${to}`;

    const options = {
        hostname,
        path: '/tools/codetranslator/translate.ashx',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options);

        req.on('error', reject);
        req.on('response', res => responseHandler(res, resolve));

        req.write(postData);
        req.end();
    });
};

const responseHandler = (response, resolve) => {
    let data = '';

    response.setEncoding('utf8');

    response.on('data', chunk => { data += chunk; });
    response.on('end', () => resolve(data));
};

const args = process.argv;

if (args.length < 6) {
    usage();
} else {
    convertFiles(
        args[2].replace(/\/$/, ''),
        args[3].replace(/\/$/, ''),
        args[4].toUpperCase(),
        args[5].toUpperCase()
    );
}
