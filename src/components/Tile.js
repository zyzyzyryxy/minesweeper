import { useCallback } from "react";
import { FLAG_ACTION, REVEAL_ACTION } from "../reducers/BoardState";

export default function Tile({x, y, dispatch, children}) {
	const onClick = useCallback(() => {
		dispatch({type: REVEAL_ACTION, coordinates: {x, y}});
	}, [dispatch, x, y]);

	const onRClick = useCallback((e) => {
		e.preventDefault();
		dispatch({type: FLAG_ACTION, coordinates: {x, y}});
	}, [dispatch, x, y]);

	return (
		<div
			className={"tile"}
			style={{gridColumn: `col ${x+1}`, gridRow: `row ${y+1}`}}
			onClick={onClick}
			onContextMenu={onRClick}
		>
			{children}
		</div>
	);
}