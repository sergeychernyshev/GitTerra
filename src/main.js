import getStdin from "get-stdin";
import fs from "fs";
import yargs from "yargs";
import mkdirp from "mkdirp";
import { spawn } from "child_process";

import { generateMapHTML } from "./map.js";

const min_tiles = 10;
const colormap_file = "./color_lang.json";
let [gitname, owner, repo, shouldOpenInBrowser] = getInputArgs();

async function main() {
  try {
    const repoData = await readSCC();
    //    console.log(repoData);
    const number_of_blocks = Math.round(
      (100 *
        Math.log10(
          repoData.total.files / repoData.weight.files +
            repoData.total.lines / repoData.weight.lines +
            repoData.total.comment / repoData.weight.comment +
            repoData.total.code / repoData.weight.code +
            repoData.total.bytes / repoData.weight.bytes +
            1
        )) /
        3 +
        min_tiles
    );

    const dirname = "./repos/" + gitname + "/" + owner + "/" + repo;
    const filename = dirname + "/index.html";
    mkdirp.sync(dirname);
    const mapHTML = generateMapHTML(number_of_blocks);
    fs.writeFileSync(filename, mapHTML); // alwais overwrite the filename

    if (shouldOpenInBrowser) {
      const subprocess = spawn("open", [filename], {
        detached: true,
        stdio: "ignore",
      });
      subprocess.unref();
    }
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

main();

//          FUNCTIONS

async function readSCC() {
  const repoData = {};

  let json = JSON.parse(await getStdin());
  //  console.log(json);
  repoData.byLang = [];

  let [
    bytes,
    files,
    lines,
    codebytes,
    code,
    comment,
    blanks,
    complexity,
    wComplexity,
  ] = [0, 0, 0, 0, 0, 0, 0, 0, 0];

  json.forEach((elem) => {
    repoData.byLang.push({
      name: elem.Name,
      bytes: elem.Bytes,
      codebytes: elem.CodeBytes,
      lines: elem.Lines,
      code: elem.Code,
      comment: elem.Comment,
      blanks: elem.Blank,
      complexity: elem.Complexity,
      count: elem.Count,
      wComplexity: elem.WeightedComplexity,
      color: "default",
      rank: 0,
    }); //push
    bytes += elem.Bytes;
    files += elem.Count;
    lines += elem.Lines;
    codebytes = +elem.CodeBytes;
    code += elem.Code;
    comment += elem.Comment;
    blanks += elem.Blank;
    complexity += elem.Complexity;
    wComplexity += elem.WeightedComplexity;
  });

  repoData.total = {
    bytes: bytes,
    files: files,
    lines: lines,
    codebytes: codebytes,
    code: code,
    comment: comment,
    blanks: blanks,
    complexity: complexity,
    wComplexity: wComplexity,
  };

  repoData.weight = {
    files: 400,
    lines: 100000,
    comment: 15000,
    code: 80000,
    bytes: 4000000,
  };

  if (repoData.total.files < 1) {
    console.log("this git is empty or incorrect!");
    process.exit(1);
  }
  const colormap = fs.readFileSync(colormap_file, "utf-8");
  let colors = JSON.parse(colormap);
  repoData.byLang.forEach((lang) => {
    if (colors[lang.name]) {
      lang.color = colors[lang.name].color;
    }
    lang.rank = Math.round((100 * lang.code) / repoData.total.code);
  });
  return repoData;
}

function getInputArgs() {
  const argv = yargs(process.argv.slice(2)).argv;
  const gitname = argv.u;
  let matches = gitname.match(/^https:\/\/(.+?)\/(.+?)\/(.+?)$/);
  const shouldOpenInBrowser = argv.o;
  return [matches[1], matches[2], matches[3], shouldOpenInBrowser];
}