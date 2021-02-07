const gulp = require('gulp');
const config = require('../config');
const log = require('fancy-log');
const glob = require('glob');
// const fs = require('fs');
const sourcemaps = require('gulp-sourcemaps');
const {babel} = require('@rollup/plugin-babel');
const {nodeResolve} = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const rollup = require('rollup');

gulp.task("javascript", function (callback) {
  const destination = config.paths.scripts.dest;
  // On init le compiler.
  let compiler = new JavascriptCompiler(destination, callback);
  // On lance le process sur tous les fichiers d'entrée.
  return new Promise(resolve => {
    glob(config.paths.scripts.src + '/*/*.js', (err, files) => compiler.processAllJsFiles(err, files).then(() => {
      resolve();
    }));
  });
});

gulp.task("javascriptWatch", function (callback) {
  // Definition du répertoire de destination.
  let destination = config.paths.scripts.dest;
  // // Récupération du fichier en cours de modification.
  // let watchedFile = gulp.currentWatchedFilePath;
  // log("watchedFile : " + watchedFile);
  //
  // // On récupère le répertoire du bundle du fichier courant.
  // let bundleRepName = watchedFile.split(config.paths.scripts.src)[1].split('/')[1];
  //
  // // On récupère le fichier d'entrée du bundle.
  // let entry = config.scripts.src + '/' + bundleRepName + '/'+bundleRepName+'.js';
  //
  // // On crée le compiler.
  // let compiler = new JavascriptCompiler(destination, callback);
  // if (fs.existsSync(entry)) {
  //   // On lance le rebuild d'un seul fichier d'entrée.
  //   compiler.processAllJsFiles(null, [entry]);
  // }
  // else {
  //   // On rebuild tout si le fihcier d'entrée n'a pas été identifié.
  //   glob(config.paths.scripts.glob, (err, files) => compiler.processAllJsFiles(err, files));
  // }
  // @todo recup le fichier modifié en gulp4
  // en attendant rebuild tout :
  let compiler = new JavascriptCompiler(destination, callback);
  return new Promise(resolve => {
    glob(config.paths.scripts.src + '/*/*.js', (err, files) => compiler.processAllJsFiles(err, files).then(() => {
      resolve();
    }));
  })
});
/**
 *
 **/
class JavascriptCompiler {
  constructor(destination, callback) {
    this.destination = destination;
    this.filesCount = 0;
    this.processedFilesCount = 0;
    this.callback = callback;
  }
  processAllJsFiles(err, files) {
    if (err) done(err);
    // Nombre d'éléments à traiter.
    this.filesCount = files.length;
    log('JS Entry files count ' + this.filesCount);
    // On process chaque fichier.
    return new Promise(resolve => {
      files.map((fileName) => this.processOneEntryFile(fileName).then(() => {
        resolve();
      }));
    });
  }
  processOneEntryFile(entry) {
    log('JS: Compilation du fichier ' + entry);
    // On définie le nom du fichier js final.
    let finalName = this.getFinalName(entry);
    let error = false;
    // ON lance la compilation
    return rollup.rollup({
      input: entry,
      plugins: [
        nodeResolve({
          browser: true
        }),
        babel({
          exclude: 'node_modules/**',
          presets: [
            [
              "@babel/preset-env",
              {
                targets: {
                  browsers: "> 0.5%, ie >= 11"
                },
                modules: false,
                spec: true,
                useBuiltIns: "usage",
                forceAllTransforms: true,
                corejs: "3.8.2"
              }
            ]
          ],
          babelHelpers: 'bundled',
        }),
        commonjs(),
      ]
    }).then(bundle => {
      log(finalName);
      return bundle.write({
        file: config.paths.scripts.dest+'/'+finalName,
        format: 'iife',
        sourcemap: true
      });
    });
  }
  /**
   *  Action lorsque qu'un fichier d'entrée a fini d'être traité.
   **/
  onOneFileProcessEnd(entry, finalName) {
    log('JS: Fin de compilation du fichier ' + entry);
    this.increaseProcessedFiles();
  }
  /**
   * On incrémente le process et lance la callback si tous les fichiers ont été traités.
   **/
  increaseProcessedFiles() {
    // on incrémente le compteur d'éléments traités
    this.processedFilesCount++;
    log('JS: ' + this.processedFilesCount + '/' + this.filesCount);
    // Si tous les éléments sont processés, on balance la suite.
    if (this.processedFilesCount === this.filesCount) {
      log('JS: Fin de compilation de tous les fichiers');
      this.callback();
    }
  }
  /**
   * Retourne le nom final du fichier lié au fichier d'entrée
   **/
  getFinalName(entry) {
    let split = entry.split('/');
    return split[split.length - 2] + '.js';
  }
}
