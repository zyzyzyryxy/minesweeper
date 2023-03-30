import { useReducer } from "react";

import { BoardStateReducer, BoardStateInitializer, renderBoard } from "../reducers/BoardState";

import Tile from "./Tile";
import boomSvg from "../assets/boom.svg";
import flagSvg from "../assets/flag.svg";
import hiddenSvg from "../assets/hidden.svg";
import mineSvg from "../assets/mine.svg";
import "./Board.css";

export default function Board({ width, height }) {
	const [state, dispatch] = useReducer(BoardStateReducer, { width, height }, BoardStateInitializer);

	return (
		<div
			className="board"
			style={{
				display: "grid",
				gridTemplateColumns: `[leftBorder] 1fr [col] repeat(${width}, 5vmin [col]) 1fr [rightBorder]`,
				gridTemplateRows: `[topBorder] 1fr [row] repeat(${height}, 5vmin [row]) 1fr [bottomBorder]`
			}}
		>
			{renderBoard(state, {
				renderHidden: (x, y, idx) => (
					<Tile x={x} y={y} key={idx} dispatch={dispatch}>
						<img className="content" src={hiddenSvg} alt="hidden" />
					</Tile>
				),
				renderBoom: (x, y, idx) => (
					<Tile x={x} y={y} key={idx} dispatch={dispatch}>
						<img className="content" src={boomSvg} alt="boom" />
					</Tile>
				),
				renderFlag: (x, y, idx) => (
					<Tile x={x} y={y} key={idx} dispatch={dispatch}>
						<img className="content" src={flagSvg} alt="flag" />
					</Tile>
				),
				renderMine: (x, y, idx) => (
					<Tile x={x} y={y} key={idx} dispatch={dispatch}>
						<img className="content" src={mineSvg} alt="bomb" />
					</Tile>
				),
				renderRevealed: (x, y, idx, v) => (
					<Tile x={x} y={y} key={idx} dispatch={dispatch}>
						<div className='content'>
							<span className={`number number${v}`}>{v}</span>
						</div>
					</Tile>
				)
			})}
		</div>
	);
}
