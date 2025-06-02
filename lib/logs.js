//@Dev.Criss 🇦🇱
const stdouts = [];
let isModified = false;
let oldWrite = null;

function enableLogCapture(maxLength = 200) {
  if (isModified) return module.exports;

  oldWrite = process.stdout.write.bind(process.stdout);

  process.stdout.write = (chunk, encoding, callback) => {
    stdouts.push(Buffer.from(chunk, encoding));
    oldWrite(chunk, encoding, callback);
    if (stdouts.length > maxLength) stdouts.shift();
  };

  isModified = true;
  return module.exports;
}

function disable() {
  if (isModified && oldWrite) {
    process.stdout.write = oldWrite;
    isModified = false;
  }
}

function logs() {
  return Buffer.concat(stdouts);
}

export default enableLogCapture;
export { disable, logs, isModified };