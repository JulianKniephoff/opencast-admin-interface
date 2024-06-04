import React from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { Step, StepButton, StepLabel, Stepper } from "@mui/material";
import {
	StepProps,
	isSummaryReachable,
	useStepLabelStyles,
	useStepperStyle,
} from "../../../utils/wizardUtils";
import CustomStepIcon from "./CustomStepIcon";
import { FormikProps } from "formik";

const WizardStepperEvent = ({
	steps,
	page,
	setPage,
	formik,
	completed,
} : {
	steps: StepProps[],
	page: number,
	setPage: (num: number) => void,
	formik: FormikProps<any>,
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

	const disabled = !(formik.dirty && formik.isValid);

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
						<StepButton onClick={() => handleOnClick(key)} disabled={disabled}>
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
