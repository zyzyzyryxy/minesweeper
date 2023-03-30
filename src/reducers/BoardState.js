/*
 * Tile: {
		mine: true/false // if the tile contains a mine
		value: -1 if tile is not yet explored, positive if it is explored. For explored tiles, value is the number of mines on neighboring tiles.
 }
 */

import { assert } from "../tools/validation";

// Actions
export const REVEAL_ACTION = 'enter';
export const FLAG_ACTION = 'flag';
export const RESET_ACTION = 'reset';

// Gameplay phases
export const INITIAL_PHASE = 'paused';
export const LIVE_PHASE = 'live';
export const DEAD_PHASE = 'dead';

// Tile special values
const TILE_HIDDEN = -1;
const TILE_BOOM = 512;
const TILE_FLAG = 255;

const getTileIdx = (x, y, width) => x + y * width;

function getTile(state, action) {
	assert(`Action ${action.type} should have coordinates`, () => !!action.coordinates);
	assert(`Action ${action.type} coordinates should be within board limits`, () => action.coordinates.x < state.width && action.coordinates.y <= state.height && action.coordinates.x >= 0 && action.coordinates.y >= 0);
	const tileIdx = getTileIdx(action.coordinates.x,  action.coordinates.y, state.width);
	return [tileIdx, state.tiles[tileIdx]];
}

function updateSingleTile(tiles, tileIdx, newValue) {
	return tiles.map((t, idx) => tileIdx === idx ? newValue : t);
}

const neighborOffsets = [
	{dx: -1, dy: -1}, {dx: -1, dy: 0}, {dx: -1, dy: 1},
	{dx: 0, dy: -1}, {dx: 0, dy: 1},
	{dx: 1, dy: -1}, {dx: 1, dy: 0}, {dx: 1, dy: 1}
];

function* neighborIndices({x, y}, {width, height}) {
	for (const offset of neighborOffsets) {
		const ox = x + offset.dx;
		const oy = y + offset.dy;
		console.log('checking', ox, oy, width, height);
		if (ox >= 0 && oy >= 0 && ox < width && oy < height) {
			console.log();
			yield getTileIdx(ox, oy, width);
		}
	}
};

function sumNeighboringTiles(state, position, evaluate) {
	console.log('sumNeighboringTiles', position);
	let sum = 0;
	for (const idx of neighborIndices(position, state)) {
		console.log(idx, '->', evaluate(state.tiles[idx]));
		sum += evaluate(state.tiles[idx]);
	};
	return sum;
}

export function BoardStateInitializer({width, height}) {
	return {
		width,
		height,
		tiles: (new Array(width * height)).fill().map(() => ({mine: Math.random() >= 0.7, value: -1})),
		phase: INITIAL_PHASE
	}
}

export function BoardStateReducer(state, action) {
	switch (action.type) {
		case RESET_ACTION: {
			assert('Reset action should have dimensitons specified', () => !!action.dimensions && action.dimensions.width > 0 && action.dimensions.height > 0);
			return BoardStateInitializer(action.dimensions);
		}
		case FLAG_ACTION: {
			if (state.phase === DEAD_PHASE) return state;
			const [tileIdx, {mine, value}] = getTile(state, action);
			if ([TILE_HIDDEN, TILE_FLAG].includes(value)) {
				return {
					...state,
					tiles: updateSingleTile(state.tiles, tileIdx, {mine, value: TILE_FLAG + TILE_HIDDEN - value })
				}
			}
			return state;
		}
		case REVEAL_ACTION: {
			if (state.phase === DEAD_PHASE) return state;
			const [tileIdx, {mine, value}] = getTile(state, action);
			if (value === TILE_HIDDEN) {
				return {
					...state,
					phase: mine ? DEAD_PHASE : LIVE_PHASE,
					tiles: updateSingleTile(state.tiles, tileIdx, {mine, value: mine ? TILE_BOOM : sumNeighboringTiles(state, action.coordinates, t => t.mine ? 1 : 0)})
					// TODO: flood fill if zeros
				}
			}
			if (value !== TILE_FLAG && value > 0 && value === sumNeighboringTiles(state, action.coordinates, t => t.value === TILE_FLAG ? 1 : 0)) {
				// TODO: reveal neighbors, flood fill if zeros
			}
			return state;
		}
		default:
			return state;
	}
}

export function renderBoard(state, {renderHidden, renderRevealed, renderFlag, renderBoom, renderMine}) {
	const tiles = [];
	for (let x = 0; x < state.width; ++x) {
		for (let y = 0; y < state.height; ++y) {
			const idx = getTileIdx(x, y, state.width);
			const {value, mine} = state.tiles[idx];
			switch (value) {
				case TILE_HIDDEN:
					tiles.push(state.phase === DEAD_PHASE && mine ? renderMine(x, y, idx) : renderHidden(x, y, idx));
					break;
				case TILE_FLAG:
					tiles.push(renderFlag(x, y, idx));
					break;
				case TILE_BOOM:
					tiles.push(renderBoom(x, y, idx));
					break;
				default:
					tiles.push(renderRevealed(x, y, idx, value));
					break;
			}
		}
	}
	return tiles;
}
