import React from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { Step, StepButton, StepLabel, Stepper } from "@mui/material";
import {
	isSummaryReachable,
	useStepLabelStyles,
	useStepperStyle,
} from "../../../utils/wizardUtils";
import CustomStepIcon from "./CustomStepIcon";

const WizardStepperEvent = ({
	steps,
	page,
	setPage,
	completed,
} : {
	steps: {
		name: string,
		translation: string,
		hidden?: boolean,
	}[],
	page: number,
	setPage: (num: number) => void,
	completed: Record<number, boolean>,
}) => {
	const { t } = useTranslation();

	const stepperClasses = useStepperStyle();
	const labelClasses = useStepLabelStyles();

	const handleOnClick = (key: number) => {
		if (isSummaryReachable(key, steps, completed)) {

			if (completed[key]) {
				setPage(key);
			}

			let previousPageIndex = key - 1 > 0 ? key - 1 : 0;
			while (previousPageIndex >= 0) {
				if (steps[previousPageIndex].hidden) {
					previousPageIndex = previousPageIndex - 1;
				} else {
					break;
				}
			}
			if (completed[previousPageIndex]) {
				setPage(key);
			}
		}
	};

	return (
		<Stepper
			activeStep={page}
			nonLinear
			alternativeLabel
			connector={null}
			className={cn("step-by-step", stepperClasses.root)}
		>
			{steps.map((label, key) =>
				label.hidden || (
					<Step key={label.translation} completed={completed[key]}>
						<StepButton onClick={() => handleOnClick(key)}>
							<StepLabel className={labelClasses.root} StepIconComponent={CustomStepIcon}>
								{t(label.translation)}
							</StepLabel>
						</StepButton>
					</Step>
				)
			)}
		</Stepper>
	);
};



export default WizardStepperEvent;
