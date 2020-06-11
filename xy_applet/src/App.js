import React, { PureComponent } from 'react';
import Arrow from '@elsdoerfer/react-arrow';
import { RangeInput } from '@bit/grommet.grommet.range-input';
import { ScatterChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Scatter, ReferenceLine, Cell } from 'recharts';
import LineTo from 'react-lineto';

import qrSolve from  'qr-solve';
import ripser from './rips.js';

const usePH2 = false;

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

var ph0 = []
var ph1 = []
var ph2 = []
var currentDim = 0;
const parseRipser = function (ondone) {
	return function (line) {
		console.log(line)
		if (line.startsWith("persistence intervals in dim 0:")) {
			currentDim = 0;
			ph0 = []
		}
		else if (line.startsWith("persistence intervals in dim 1:")) {
			currentDim = 1;
			ph1 = []
		}
		else if (line.startsWith("persistence intervals in dim 2:")) {
			currentDim = 2;
			ph2 = []
		}
		else if (line.startsWith(" [")) {
			const splt = line.split(":")
			const splt2 = splt[0].split(",")
			var b = parseFloat(splt2[0].slice(2))
			var d = splt2[1].slice(0,-1)
			if (d === " ") {
			// "infinite"
				d = 3.4
			}
			else {
				d = parseFloat(d)
			}
			b = parseFloat(b)
			if (currentDim === 0) {
				ph0.push({b: b, d: d})
			}
			else if (currentDim === 1) {
				var pairs = splt[1].replace('[','').split('],').map(x => x.replace('{','').replace('}','').replace('[','').replace(']','').split(",").map(y => parseInt(y)))
				ph1.push({b: b, d: d, pairs: pairs})
			}
			else {
				ph2.push({b: b, d: d})
			}
		}
		else if (line.startsWith("done")) {
			ondone([...ph0], [...ph1], [...ph2]);
		}
	};
}

function parseErr(line) {
	console.log(line)
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*1); // 1 bytes for each char
	var bufView = new Uint8Array(buf);
	for (var i=0, strLen=str.length; i < strLen; i++) {
		bufView[i] = str.charCodeAt(i);
	}
	return buf;
}

function angDiff(x, y) {
	return Math.min(2*Math.PI - Math.abs(x - y), Math.abs(x - y))
}

const showTooltipData = (data) => {
	var pairs = null;
	if ( typeof data.payload[0] !== 'undefined') {
		pairs = data.payload[0]['payload']['pairs'];
	}
	if (pairs) {

	}
}

class PersistenceDiagram extends PureComponent {
	render() {
		var ph2 = <></>;
		if (usePH2) {
			ph2 = <><Scatter name="Dim 2" data={this.props.ph2} fill="#e85b38" /></>
		}
		return (
			<ScatterChart width={500} height={350}
				margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis type="number" dataKey="b" name="birth" ticks={[0,0.5,1,1.5,2,2.5,3]} unit="" />
				<YAxis type="number" dataKey="d" name="death" domain={[0, 3.5]} ticks={[0,0.5,1,1.5,2,2.5,3]} unit="" />
				<Tooltip cursor={{ strokeDasharray: '3 3' }} content={ showTooltipData } />
				<Legend />
				<Scatter name="Dim 0" data={this.props.ph0} fill="#82ca9d"/>
				<Scatter name="Dim 1" data={ph1} fill="#8884d8" onClick={this.props.handlePointClick}>
					{ph1.map((entry, index) => (
						<Cell cursor="pointer" fill={index === this.props.activeIndex ? '#300b70' : '#8884d8' } key={`cell-${index}`}/>
						))}
				</Scatter>
				{ph2}
				<ReferenceLine y={3.4} stroke="red" label={{ value: '∞', fontSize:'24', fill: 'red', position: 'left' }}/>
				</ScatterChart>
				);
	}
}

class Lattice extends React.Component {  
	renderSquare(i) {
		var color = 'rgb(230,230,230)';
		const idx = this.props.vertices.indexOf(i);
		if (idx !== -1) {
			color = 'hsl(' + Math.round(this.props.vertexColours[idx]).toString() + ',100%,85%)';
		}
		return (<div key={"square_"+i} className={"square square_"+i}>
			<Arrow className="arrow" 
				angle={this.props.squares[i] * 180/Math.PI}
				length={20}
				lineWidth={1}
				onClick={() => this.props.onClick(i)}
				style={{'backgroundColor': color}}
				/></div>
				);
	}

	nonWrappingLine(x) {
		const j0 = x[0] % this.props.latticeSize
		const i0 = (x[0] - j0) / this.props.latticeSize
		const j1 = x[1] % this.props.latticeSize
		const i1 = (x[1] - j0) / this.props.latticeSize
		if (! ((Math.abs(j1-j0) > 2) || (Math.abs(i1-i0) > 2)) ) {
			return <LineTo from={"square_"+x[0]} to={"square_"+x[1]} borderWidth={1} key={"line_"+x[0]+"_"+x[1]}/>
		}
		else {
			return
		}
	}

	createLattice() {
		let table = []

		for (let i = 0; i < this.props.latticeSize; i++) {
			let children = []
			for (let j = 0; j < this.props.latticeSize; j++) {
				children.push(this.renderSquare(i * this.props.latticeSize + j))
			}
			table.push(<div className="board-row"
				style={{'display':'grid',
				'gridTemplateColumns':'repeat('+this.props.latticeSize+','+(100/this.props.latticeSize)+'%)'}}
				key={"row_"+i} class={"row"}>{children}</div>)
		}

		if (this.props.activePointIndex !== -1) {
			const pairs = this.props.ph1[this.props.activePointIndex].pairs;
			table = table.concat(pairs.map(this.nonWrappingLine.bind(this)))
		}

		return table
	}

	render() {    
		return (this.createLattice());
	}
}

const currentStateRef = React.createRef()

function scrollToBottom() {
	currentStateRef.current.scrollIntoView({ behavior: 'smooth' });
}

class App extends React.Component {
	constructor(props) {
		super(props);

		const squares = Array.from({length: props.latticeSize * props.latticeSize}, () => Math.random() * 2 * Math.PI)
		this.state = {
			history: [{
				squares: squares,
				H: calculateH(squares, props.latticeSize),
				T: 0.5,
				PH0: [],
				PH1: [],
				PH2: [],
				PHType: "",
				Xi: 0.5,
				N: 2,
			}],
			stepNumber: 0,
			latticeSize: props.latticeSize,
			activePointIndex: -1,
			vertices: [],
			vertexColours: [],
		};
	}

	componentDidUpdate(prevProps, prevState) {
		scrollToBottom();
	}

	takeSnapshot() {
		//do a deep clone of the current state and put it on the end of the history
		const current = this.state.history[this.state.history.length - 1];
		this.setState({
			history: this.state.history.concat([{
				squares: current.squares.slice(),
				H: current.H,
				T: current.T,
				PH0: current.PH0.slice(),
				PH1: current.PH1.slice(),
				PH2: current.PH2.slice(),
				PHType: current.PHType,
				Xi: current.Xi,
				N: current.N,
			}]),
			stepNumber: this.state.history.length,
			activePointIndex: this.state.activePointIndex,
			vertices: this.state.vertices,
			vertexColours: this.state.vertexColours,
		});
	}

	onPHComputed(ph0, ph1, ph2) {
		const history = this.state.history.slice()
		history[this.state.stepNumber].PH0 = ph0;
		history[this.state.stepNumber].PH1 = ph1;
		history[this.state.stepNumber].PH2 = ph2;
		this.setState({
			history: history,
			activePointIndex: -1,
			vertices: [],
			vertexColours: [],
		});
	}

	computeLocalFiltration() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const squares = current.squares;
		const latLen = this.state.latticeSize;

		const inf = 4;

		// compute the filtration as a distance matrix
		var distMat = ""

		//sparse matrix -- 1 entry per line of form 'i j d(i,j)'
		/*
		for (let i = 0; i < latLen; i++) {
			for (let j = 0; j < latLen; j++) {
				for (let di = 0; di <= 1; di++) {
					for (let dj = 0; dj <= 1; dj++) {
						distMat += ((i * latLen + j).toString() + " " + (mod(i+di, latLen) * latLen + mod(j+dj, latLen)).toString() + " "
							+ angDiff(squares[i * latLen + j], squares[mod(i+di, latLen) * latLen + mod(j+dj, latLen)]).toString() + "\n")
					}
				}
				//the other diagonal
				var di = 1; var dj = -1;
				distMat += ((i * latLen + j).toString() + " " + (mod(i+di, latLen) * latLen + mod(j+dj, latLen)).toString() + " "
							+ angDiff(squares[i * latLen + j], squares[mod(i+di, latLen) * latLen + mod(j+dj, latLen)]).toString() + "\n")
			}
		}
		*/
		//lower triangular
		for (let i = 0; i < latLen; i++) {
			for (let j = 0; j < latLen; j++) {
				if (i !== 0 || j !== 0) {
					var row = new Array(i * latLen + j).fill(inf);
					var dj = 0;
					for (let di = -1; di <= 1; di++) {
						const pos = mod(i+di, latLen) * latLen + mod(j+dj, latLen);
						if (pos < i * latLen + j) {
							row[pos] = angDiff(squares[i * latLen + j], squares[pos])
						}
					}
					var di = 0;
					for (let dj = -1; dj <= 1; dj++) {
						const pos = mod(i+di, latLen) * latLen + mod(j+dj, latLen);
						if (pos < i * latLen + j) {
							row[pos] = angDiff(squares[i * latLen + j], squares[pos])
						}
					}
					di = -1; dj = -1;
					var pos = mod(i+di, latLen) * latLen + mod(j+dj, latLen);
					if (pos < i * latLen + j) {
						row[pos] = angDiff(squares[i * latLen + j], squares[pos])
					}

					di = 1; dj = 1;
					pos = mod(i+di, latLen) * latLen + mod(j+dj, latLen);
					if (pos < i * latLen + j) {
						row[pos] = angDiff(squares[i * latLen + j], squares[pos])
					}

					var rowString = row.map(x => x.toString()).join();
					distMat += rowString + "\n"
				}
			}
		}

		//console.log(distMat)

		return distMat;
	}

	// when adding filtrations, note that ripser does NOT like it if you put in the same edge twice and will crash

	computeBroadFiltration() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const squares = current.squares;
		const latLen = this.state.latticeSize;

		//compute the filtration as a distance matrix
		var distMat = "";

		//weighting between distance and angular difference
		const eps = current.Xi;

		//size of the considered patch
		const maxD = current.N;

		//sparse matrix -- 1 entry per line of form 'i j d(i,j)'
		for (let i = 0; i < latLen; i++) {
			for (let j = 0; j < latLen; j++) {
				for (let di = 0; di <= maxD; di++) {
					for (let dj = 0; dj <= maxD; dj++) {
						distMat += ((i * latLen + j).toString() + " " + (mod(i+di, latLen) * latLen + mod(j+dj, latLen)).toString() + " "
							+ (eps*Math.sqrt(di*di + dj*dj) + (1-eps)*angDiff(squares[i * latLen + j], squares[mod(i+di, latLen) * latLen + mod(j+dj, latLen)])).toString() + "\n")
					}
				}
				//other diagonals
				for (let di = 1; di <= maxD; di++) {
					for (let dj = -maxD; dj <= -1; dj++) {
						distMat += ((i * latLen + j).toString() + " " + (mod(i+di, latLen) * latLen + mod(j+dj, latLen)).toString() + " "
							+ (eps*Math.sqrt(di*di + dj*dj) + (1-eps)*angDiff(squares[i * latLen + j], squares[mod(i+di, latLen) * latLen + mod(j+dj, latLen)])).toString() + "\n")
					}
				}
			}
		}

		return distMat;
	}

	recomputePH(filtration, phType) {
		const b = new Uint8Array(str2ab(filtration()));
		var dim = "1";
		if (usePH2) {
			dim = "2";
		}
		const Module = {
			stdin: stdin(b),
			//arguments: ["--dim", dim, "--format", "sparse"],
			arguments: ["--dim", dim, "--format", "lower-distance", "--threshold", "3.5"],
			print: parseRipser(this.onPHComputed.bind(this)),
			printErr: parseErr,
		};

		const history = this.state.history.slice()
		history[this.state.stepNumber].PHType = phType;
		this.setState({
			history: history,
		})

		ripser(Module);
	}


	handleSquareClick(i) {
		//only called when on current state
		const history = this.state.history.slice();

		const squares = history[history.length - 1].squares.slice();
		squares[i] = mod(squares[i] + Math.PI/4, Math.PI * 2);

		history[history.length - 1].squares = squares;
		history[history.length - 1].H = calculateH(squares, this.state.latticeSize);
		history[history.length - 1].PH0 = [];
		history[history.length - 1].PH1 = [];
		history[history.length - 1].PH2 = [];
		history[history.length - 1].PHType = "";

		
		this.setState({
			history: history,
			activePointIndex: -1,
			vertices: [],
			vertexColours: [],
		});
	}

	handleTChange(event) {
		//only called when on current state
		const history = this.state.history.slice();
		history[this.state.stepNumber].PH0 = [];
		history[this.state.stepNumber].PH1 = [];
		history[this.state.stepNumber].PH2 = [];
		history[this.state.stepNumber].PHType = "";

		history[history.length - 1].T = Number.parseFloat(event.target.value)

		this.setState({
			history: history,
			activePointIndex: -1,
			vertices: [],
			vertexColours: [],
		});
	}

	handleXiChange(event) {
		const history = this.state.history.slice()
		if (history[this.state.stepNumber].PHType === "B") {
			history[this.state.stepNumber].PH0 = [];
			history[this.state.stepNumber].PH1 = [];
			history[this.state.stepNumber].PH2 = [];
			history[this.state.stepNumber].PHType = "";
		}	
		history[this.state.stepNumber].Xi = Number.parseFloat(event.target.value)

		this.setState({
			history: history,
			activePointIndex: -1,
			vertices: [],
			vertexColours: [],
		});
	}

	handleNChange(event) {
		const history = this.state.history.slice()
		if (history[this.state.stepNumber].PHType === "B") {
			history[this.state.stepNumber].PH0 = [];
			history[this.state.stepNumber].PH1 = [];
			history[this.state.stepNumber].PH2 = [];
			history[this.state.stepNumber].PHType = "";
		}	
		history[this.state.stepNumber].N = Number.parseInt(event.target.value)

		this.setState({
			history: history,
			activePointIndex: -1,
			vertices: [],
			vertexColours: [],
		});
	}

	stepSimulation(steps) {
		//only called when on current state
		const history = this.state.history.slice();

		const squares = history[history.length - 1].squares.slice();
		const T = history[history.length - 1].T;
		var H = history[history.length - 1].H;

		for (let i = 0; i < steps; i++) {
			const change_pos = randInt(0, this.state.latticeSize * this.state.latticeSize);
			const new_val = Math.random() * Math.PI * 2;
			const delta_H = calculateDeltaH(squares, change_pos, new_val, this.state.latticeSize);
			if (((delta_H > 0) && (Math.random() < Math.exp(-(1 / T) * delta_H))) || (delta_H <= 0)) {
				H += delta_H;
				squares[change_pos] = new_val;
			}
		}

		history[history.length - 1].squares = squares;
		history[history.length - 1].H = H;
		history[history.length - 1].PH0 = [];
		history[history.length - 1].PH1 = [];
		history[history.length - 1].PH2 = [];
		history[history.length - 1].PHType = "";

		this.setState({
			history: history,
			activePointIndex: -1,
		});
	}

	jumpTo(step) {
		this.setState({
			stepNumber: step,
			activePointIndex: -1,
			vertices: [],
			vertexColours: [],
		});
	}

	deleteSnapshot(step) {
		var history = this.state.history.slice()
		history.splice(step, 1);
		var activePointIndex = this.state.activePointIndex;
		var vertices = this.state.vertices;
		var vertexColours = this.state.vertexColours;
		var stepNumber = this.state.stepNumber;
		if (stepNumber > step) {
			stepNumber -= 1;
			vertices = [];
			vertexColours = [];
		}
		else if (stepNumber === step) {
			activePointIndex = -1;
		}

		this.setState({
			history: history,
			stepNumber: stepNumber,
			activePointIndex: activePointIndex,
			vertices: vertices,
			vertexColours: vertexColours,
		})
	}

	handlePointClick(data, index) {
		//set highlighted point on persistence diagram and compute cirle coordinates
		// from the representative Z2 cocycle

		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const squares = current.squares;
		const latLen = this.state.latticeSize;

		//compute filtration to use
		const filtVal = (data.b + data.d) / 2;
		//const filtVal = data.d;

		var vertices = [];
		var edges = [];
		for (let i = 0; i < latLen; i++) {
			for (let j = 0; j < latLen; j++) {
				const posA = i * latLen + j;
				for (let di = 0; di <= 1; di++) {
					for (let dj = 0; dj <= 1; dj++) {
						if (di > 0 || dj > 0) {
							const posB = mod(i+di, latLen) * latLen + mod(j+dj, latLen);
							if (angDiff(squares[posA], squares[posB]) <= filtVal) {
								edges.push([Math.min(posA, posB), Math.max(posA, posB)])
								vertices.push(posA)
								vertices.push(posB)
							}
						}
					}
				}
				//the other diagonal
				var di = 1; var dj = -1;
				const posB = mod(i+di, latLen) * latLen + mod(j+dj, latLen);
				if (angDiff(squares[posA], squares[posB]) <= filtVal) {
					edges.push([Math.min(posA, posB), Math.max(posA, posB)])
					vertices.push(posA)
					vertices.push(posB)
				}
			}
		}
		vertices = [...new Set(vertices)].sort((a, b) => a - b);

		var m = edges.length;
		var n = vertices.length;

		//form the integer cocycle vector
		var b = new Array(m).fill(0);
		for (let i in data.pairs) {
			const idx = findIntArray(data.pairs[i], edges);
			if (idx !== -1) {
				b[idx] = -1;
			}
		}	

		//form the coboundary matrix
		var A = []
		for (let i in edges) {
			const idx0 = vertices.findIndex(v => v === edges[i][0])
			const idx1 = vertices.findIndex(v => v === edges[i][1])
			A.push([parseInt(i), idx0, -1])
			A.push([parseInt(i), idx1, 1])
		}
		A = A.sort(([a, b, f], [c, d, g]) => a - c || b - d);

		//console.log(vertices)
		//console.log(edges)
		//console.log(b)
		//console.log(A)

		//compute harmonic representative
		var solve = qrSolve.prepare(A, m, n) // first decompose. 
		var solution = new Float64Array(n) // in here we put the solution
		solve(b, solution)
		solution = solution.map(x => 360 * mod(x, 1));
		
		console.log(solution)

		this.setState({
			activePointIndex: index,
			vertices: vertices,
			vertexColours: solution,
		});
	}

	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const isCurrentState = (this.state.stepNumber === (history.length - 1));
		const T = current.T;
		const ph0 = current.PH0;
		const ph1 = current.PH1;
		const ph2 = current.PH2;


		// marker, name, T, H, PH, delete
		const tableWidth = 300;
		const infoTableColRatios = [1, 2, 1, 1.5, 3, 1]
		const sum = infoTableColRatios.reduce((a,b) => a + b, 0)
		const infoTableHeaderWidths = infoTableColRatios.map(x => ((x * tableWidth / sum).toString() + "px"))
		const infoTableBodyWidths = infoTableColRatios.map(x => ((x * tableWidth / sum).toString() + "px"))

		const moves = history.map((step, move) => {
			var desc = '#' + move;
			var deleteButton = <><button onClick={() => this.deleteSnapshot(move)}><i className='fa fa-trash'></i></button></>
			if (move === (history.length - 1)) {
				desc = 'Current';
				deleteButton = "";
			}
			var here = "";
			if (move === this.state.stepNumber) {
				here = "→";
			}
			var phDesc = step.PHType;
			if (phDesc === "B") {
				phDesc += " ξ=" + step.Xi.toString() + " n=" + step.N.toString();
			}
			return (
				<tr key={move}>
					<td style={{'width': infoTableBodyWidths[0], 'minWidth': infoTableBodyWidths[0], 'textAlign': 'center'}}>{here}</td>
					<td style={{'width': infoTableBodyWidths[1], 'minWidth': infoTableBodyWidths[1]}}><button style={{'width': '100%'}} onClick={() => this.jumpTo(move)}>{desc}</button></td>
					<td style={{'width': infoTableBodyWidths[2], 'minWidth': infoTableBodyWidths[2], 'textAlign': 'center'}}>{step.T}</td>
					<td style={{'width': infoTableBodyWidths[3], 'minWidth': infoTableBodyWidths[3], 'textAlign': 'center'}}>{step.H.toFixed(1)}</td>
					<td style={{'width': infoTableBodyWidths[4], 'minWidth': infoTableBodyWidths[4], 'textAlign': 'center'}}>{phDesc}</td>
					<td style={{'width': infoTableBodyWidths[5], 'minWidth': infoTableBodyWidths[5]}}>{deleteButton}</td>
					</tr>
					);
		});

		return (
			<div className="game">
				<div className="boardAndInfo">
					<div className="game-board" style={{'gridTemplateRows':'repeat('+this.props.latticeSize+','+(100/this.props.latticeSize)+'%)'}}>
					<Lattice
						latticeSize = {this.state.latticeSize}
						squares={current.squares}
						onClick={(i) => {if (isCurrentState) {this.handleSquareClick(i)}}}
						ph1={ph1}
						activePointIndex={this.state.activePointIndex}
						vertices={this.state.vertices}
						vertexColours={this.state.vertexColours}
					/>
				</div>
				<div className="game-info">
					<table style={{'width': '100%', 'minWidth':'100%'}}><tbody><tr>
						<td style={{'width': '20%', 'minWidth':'20%', 'textAlign': 'left'}}>T = {T.toFixed(2)}</td>
						<td style={{'width': '80%', 'minWidth':'80%'}}><RangeInput id="T_slider" min={0} max={5} value={T} step={0.01} disabled={!isCurrentState} onChange={(e) => this.handleTChange(e)}/></td>
					</tr></tbody></table>
					<table style={{'width': '100%', 'minWidth':'100%'}}><tbody>
						<tr><td style={{'width': '50%', 'minWidth':'50%'}}>
							<button style={{'width': '100%', 'minWidth':'100%'}} onClick={() => this.stepSimulation(5000)} disabled={!isCurrentState}>Thermalise</button>
						</td><td style={{'width': '50%', 'minWidth':'50%'}}>
						<button style={{'width': '100%', 'minWidth':'100%'}} onClick={() => this.takeSnapshot()} disabled={!isCurrentState}>Take Snapshot</button>
					</td></tr>
					<tr><td>
						<button style={{'width': '100%', 'minWidth':'100%'}} onClick={() => this.recomputePH(this.computeLocalFiltration.bind(this), "L")}>Compute Persistence</button>
					</td><td>

				</td></tr>
				
				{/*<tr><td>
					<button style={{'width': '100%', 'minWidth':'100%'}} onClick={() => this.recomputePH(this.computeBroadFiltration.bind(this), "B")}>Compute Broad PH</button>
				</td><td>
				<table><tbody><tr>
					<td style={{"width":"20%", 'textAlign': 'center'}}>ξ</td><td style={{"width":"30%"}}><input onChange={(e) => this.handleXiChange(e)} max={1} step={0.05} min={0} type="number" defaultValue={0.5} style={{"width":"100%"}}/></td>
					<td style={{"width":"20%", 'textAlign': 'center'}}>n</td><td style={{"width":"30%"}}><input onChange={(e) => this.handleNChange(e)} max={5} step={1} min={1} type="number" defaultValue={2} style={{"width":"100%"}}/></td>
				</tr></tbody></table>
				</td>
				</tr>*/}

	</tbody></table>
	<table style={{'width': '100%', 'minWidth':'100%', 'marginTop': '10px', 'layout': 'fixed'}}><thead style={{'display': 'block'}}>
		<tr>
			<th style={{'width': infoTableHeaderWidths[0], 'minWidth': infoTableHeaderWidths[0]}}></th>
			<th style={{'width': infoTableHeaderWidths[1], 'minWidth': infoTableHeaderWidths[1], 'textAlign' : 'centre'}}>Snapshot</th>
			<th style={{'width': infoTableHeaderWidths[2], 'minWidth': infoTableHeaderWidths[2], 'textAlign' : 'centre'}}>T</th>
			<th style={{'width': infoTableHeaderWidths[3], 'minWidth': infoTableHeaderWidths[3], 'textAlign' : 'centre'}}>H</th>
			<th style={{'width': infoTableHeaderWidths[4], 'minWidth': infoTableHeaderWidths[4], 'textAlign' : 'centre'}}>PH</th>
			<th style={{'width': infoTableHeaderWidths[5], 'minWidth': infoTableHeaderWidths[5]}}></th>
		</tr>
	</thead><tbody style={{'height': '220px', 'overflowY': 'scroll', 'display': 'block'}}>
	{moves}
	<tr ref={currentStateRef}/>
</tbody>		
</table>
</div>
</div>
<div className="diagram">
	<PersistenceDiagram	ph0={ph0} ph1={ph1} ph2={ph2} activeIndex={this.state.activePointIndex} handlePointClick={this.handlePointClick.bind(this)}/>
</div>
</div>
);
	}
}


function calculateH(config, latLen) {
	var h = 0.0;
	for (let i = 0; i < latLen; i++) {
		for (let j = 0; j < latLen; j++) {
			h -= Math.cos(config[i * latLen + j] - config[mod(i+1, latLen) * latLen + j])
			h -= Math.cos(config[i * latLen + j] - config[mod(i-1, latLen) * latLen + j])
			h -= Math.cos(config[i * latLen + j] - config[i * latLen + mod(j+1, latLen)])
			h -= Math.cos(config[i * latLen + j] - config[i * latLen + mod(j-1, latLen)])
		}   
	}
	return h;
}

function calculateDeltaH(config, change_pos, new_val, latLen) {
	var dh = 0;
	var i = Math.trunc(change_pos/latLen);
	var j = change_pos % latLen;
	dh += Math.cos(config[change_pos] - config[mod(i+1, latLen) * latLen + j])
	dh += Math.cos(config[change_pos] - config[mod(i-1, latLen) * latLen + j])
	dh += Math.cos(config[change_pos] - config[i * latLen + mod(j+1, latLen)])
	dh += Math.cos(config[change_pos] - config[i * latLen + mod(j-1, latLen)])
	dh -= Math.cos(new_val - config[mod(i+1, latLen) * latLen + j])
	dh -= Math.cos(new_val - config[mod(i-1, latLen) * latLen + j])
	dh -= Math.cos(new_val - config[i * latLen + mod(j+1, latLen)])
	dh -= Math.cos(new_val - config[i * latLen + mod(j-1, latLen)])
	return dh
}

function mod(n, m) {
	return ((n % m) + m) % m;
}

function randInt(l, u) {
	return Math.floor(Math.random() * (u - l)) + l; 
}

function findIntArray(toFind, inArray) {
	const toFindStr = toFind.join(",");
	for(var i in inArray) {
		var sar = inArray[i].join(",");
		if (sar === toFindStr) {
			return i;
		}
	}
	return -1;
}

// ========================================


export default App;
