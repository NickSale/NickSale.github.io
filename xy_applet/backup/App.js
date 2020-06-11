import React from 'react';
import logo from './logo.svg';
import './App.css';

import ripser from './rips.js';

//const Module = {
//    preRun: function() {
//    	FS.init(stdin, stdout, stderr);
//    },
//	noInitialRun: true,
//};

// stdin is a function which produces characters until it is finished.  Then it produces null
const stdin = function writeToStdIn(buf) {
    return function() {
        if (!buf.length) {
            return null;
        }
        const c = buf[0];
        buf = buf.slice(1);
        return c;
    };
};
var outBuffer = ""
// stdout is a function which accepts characters
const stdout = function (char) {
  outBuffer += char
};
var errBuffer = ""
// so is stderr
const stderr = function (char) {
    errBuffer += char
};

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*1); // 1 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {num: 0}
  }

  handleClick() {

  	const b = new Uint8Array(str2ab("0\n1,0\n2,2,0"));
    const Module = {
    	stdin: stdin(b),
    	arguments: ["--threshold", "1"],
    };
    ripser(Module);

/*fetch('./projective_plane.csv')
.then(async g => {
    const b = new Uint8Array(await g.arrayBuffer());
    const Module = {};
    Module.stdin = stdin(b);
    ripser(Module);
    console.log(outBuffer)
    console.log(errBuffer)
    //outBuffer = ""
}); */

  }

  render() {
    return (
      <div className="App">
      <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <p>
      Edit <code>src/App.js</code> and save to reload.
      </p>
      <button onClick={() => this.handleClick()}>{this.state.num}</button>
      </header>
      </div>
      );
  }
}

export default App;
