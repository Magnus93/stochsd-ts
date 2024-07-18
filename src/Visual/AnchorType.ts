/* replaces anchorTypeEnum
export const anchorTypeEnum = <const>{
	invalid: 1,
	start: 2,
	end: 3,
	bezier1: 4,
	bezier2: 5,
	orthoMiddle: 6
}; */

export type AnchorType = 
	| "invalid"
	| "start"
	| "end"
	| "bezier1"
	| "bezier2"
	| "orthoMiddle"

