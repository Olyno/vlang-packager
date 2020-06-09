const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const ncp = require('ncp').ncp;
const rimraf = require('rimraf');
const ora = require('ora');
const unzip = require('node-unzip-2');
const axios = require('axios');

async function execute(command) {
    return new Promise((resolve, reject) => {
        const cmd = spawn(command.split(' ').shift(), command.split(' ').slice(1), {
            stdio: ['ignore', 'inherit', 'inherit'],
            shell: true
        })
        cmd.on('error', (err) => reject(err));
        cmd.on('close', () => resolve());
    });
}

async function clean(dir) {
    return new Promise((resolve, rejects) => {
        rimraf(dir, (err) => {
            if (err) return rejects();
            resolve();
        })
    })
}

async function downloadVlang() {
    return new Promise((resolve, rejects) => {
        return execute('git clone https://github.com/vlang/v.git bin')
            .then(() => {
                downloadLoader.succeed('Vlang downloaded');
                resolve();
            })
            .catch(() => {
                if (!fs.existsSync('bin')) fs.mkdirSync('bin');
                if (!fs.existsSync('temp')) fs.mkdirSync('temp');
                const filePath = path.join('temp', 'vlang.zip');
                const fileZip = fs.createWriteStream(filePath);
                downloadLoader.text = 'Git command not found, trying to install using download...';
                axios({
                    url: 'https://github.com/vlang/v/archive/master.zip',
                    method: 'get',
                    responseType: 'stream'
                }).then(({ data }) => {
                    data.pipe(fileZip).on('close', () => {
                        downloadLoader.text = 'Vlang zip downloaded, extract...';
                        fs.createReadStream(filePath).pipe(unzip.Extract({ path: 'temp' }))
                            .on('finish', () => {
                                ncp('temp/v-master', 'bin', (err) => {
                                    if (err) return rejects(err);
                                    rimraf('temp', (err) => {
                                        if (err) return rejects(err);
                                    })
                                    downloadLoader.succeed('Vlang downloaded');
                                    resolve();
                                })
                            }).on('error', (err) => rejects(err));
                    })
                })
                .catch(err => {
                    downloadLoader.fail('Can\'t download Vlang, something happened.');
                    rejects(err);
                })
            })
    })
}

async function buildVlang() {
    builderLoader.start();
    return execute('cd bin && make')
}

const downloadLoader = ora('Downloading Vlang...').start();
const builderLoader = ora('Building Vlang...');

module.exports = Promise.all([clean('bin'), clean('temp')])
    .then(() => downloadVlang())
    .then(() => buildVlang())
    .then(() => {
        builderLoader.succeed('Vlang builded with success');
    })
    .catch((err) => {
        downloadLoader.fail('Can\'t build Vlang, something happened.');
        throw err;
    })