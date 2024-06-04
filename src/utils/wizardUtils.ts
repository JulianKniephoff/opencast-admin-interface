import { StepIconProps } from "@mui/material";
import  makeStyles  from "@mui/styles/makeStyles";

// Base style for Stepper component
export const useStepperStyle = makeStyles({
	root: {
		background: "#eeeff0",
		height: "100px",
		padding: "24px",
	},
});

// Properly align multi-line wizard step labels
export const useStepLabelStyles = makeStyles({
	root: {
		alignSelf: "flex-start",
	},
});

// Style of icons used in Stepper
export const useStepIconStyles = makeStyles({
	root: {
		height: 22,
		alignItems: "center",
	},
	circle: {
		color: "#92a0ab",
		width: "20px",
		height: "20px",
		transform: (props: StepIconProps) => props.active ? "scale(1.3)" : "scale(1.0)",
	},
});

export type StepProps = {
	name: string,
	translation: string,
	hidden?: boolean,
};

/* This method checks if the summary page is reachable.
 * If the clicked page is some other page than summary then no check is needed.
 * If the clicked page is summary then it only should be clickable/reachable if all other
 * visible pages of the wizard are valid.
 */
export const isSummaryReachable = (key: number, steps: StepProps[], completed: Record<number, boolean>) => {
	if (steps[key].name === "summary") {
		const relevantSteps = steps.filter(step => !step.hidden && step.name !== "summary");

		return Object.keys(completed).length >= relevantSteps.length;
	}

	return true;
};
