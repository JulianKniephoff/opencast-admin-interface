import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import NewThemePage from "../ModalTabsAndPages/NewThemePage";
import NewSeriesSummary from "./NewSeriesSummary";
import {
	getSeriesTobiraPage,
	getSeriesTobiraPageStatus,
	getSeriesExtendedMetadata,
	getSeriesMetadata,
} from "../../../../selectors/seriesSeletctor";
import NewMetadataPage from "../ModalTabsAndPages/NewMetadataPage";
import NewMetadataExtendedPage from "../ModalTabsAndPages/NewMetadataExtendedPage";
import NewAccessPage from "../ModalTabsAndPages/NewAccessPage";
import WizardStepper from "../../../shared/wizard/WizardStepper";
import { initialFormValuesNewSeries } from "../../../../configs/modalConfig";
import { NewSeriesSchema } from "../../../../utils/validate";
import { getInitialMetadataFieldValues } from "../../../../utils/resourceUtils";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { TobiraPage, postNewSeries } from "../../../../slices/seriesSlice";
import { MetadataCatalog } from "../../../../slices/eventSlice";
import NewTobiraPage from "../ModalTabsAndPages/NewTobiraPage";

/**
 * This component manages the pages of the new series wizard and the submission of values
 */
const NewSeriesWizard: React.FC<{
	close: () => void
}> = ({
	close,
}) => {
	const dispatch = useAppDispatch();

	const metadataFields = useAppSelector(state => getSeriesMetadata(state));
	const extendedMetadata = useAppSelector(state => getSeriesExtendedMetadata(state));
	const tobiraPage = useAppSelector(state => getSeriesTobiraPage(state));
	const statusTobiraPage = useAppSelector(state => getSeriesTobiraPageStatus(state));

	const initialValues = getInitialValues(metadataFields, extendedMetadata, tobiraPage);

	const [page, setPage] = useState(0);
	const [snapshot, setSnapshot] = useState(initialValues);
	const [pageCompleted, setPageCompleted] = useState({});

	// Caption of steps used by Stepper
	const steps = [
		{
			translation: "EVENTS.SERIES.NEW.METADATA.CAPTION",
			name: "metadata",
			hidden: false,
		},
		{
			translation: "EVENTS.EVENTS.DETAILS.TABS.EXTENDED-METADATA",
			name: "metadata-extended",
			hidden: !(!!extendedMetadata && extendedMetadata.length > 0),
		},
		{
			translation: "EVENTS.SERIES.NEW.ACCESS.CAPTION",
			name: "access",
			hidden: false,
		},
		{
			translation: "EVENTS.SERIES.NEW.THEME.CAPTION",
			name: "theme",
			hidden: false,
		},
		{
			translation: "EVENTS.SERIES.NEW.TOBIRA.CAPTION",
			name: "tobira",
			hidden: statusTobiraPage !== "succeeded",	// TODO: Figure out condition for this to be true
		},
		{
			translation: "EVENTS.SERIES.NEW.SUMMARY.CAPTION",
			name: "summary",
			hidden: false,
		},
	];

	// Validation schema of current page
	const currentValidationSchema = NewSeriesSchema[page];

// @ts-expect-error TS(7006): Parameter 'values' implicitly has an 'any' type.
	const nextPage = (values) => {
		setSnapshot(values);

		// set page as completely filled out
		let updatedPageCompleted = pageCompleted;
// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
		updatedPageCompleted[page] = true;
		setPageCompleted(updatedPageCompleted);

		if (steps[page + 1].hidden) {
			setPage(page + 2);
		} else {
			setPage(page + 1);
		}
	};

// @ts-expect-error TS(7006): Parameter 'values' implicitly has an 'any' type.
	const previousPage = (values, twoPagesBack) => {
		setSnapshot(values);
		// if previous page is hidden or not always shown, then go back two pages
		if (steps[page - 1].hidden || twoPagesBack) {
			setPage(page - 2);
		} else {
			setPage(page - 1);
		}
	};

// @ts-expect-error TS(7006): Parameter 'values' implicitly has an 'any' type.
	const handleSubmit = (values) => {

		// // TObira
		// var existingPages: any[] = [];
		// var newPages: any[] = [];
		// if (values.selectedPage) {
		// 	values.breadcrumbs.concat(values.selectedPage).forEach( function (page: TobiraPage) {
		// 		if (page.new) {
		// 			newPages.push({
		// 				name: page.title,
		// 				pathSegment: page.segment,
		// 			});
		// 		} else {
		// 			existingPages.push(page);
		// 		}
		// 	});

		// 	values.setFieldValue("tobira.parentPagePath", existingPages.pop().path);
		// 	values.setFieldValue("tobira.newPages", newPages);
		// }

		const response = dispatch(postNewSeries({values, metadataInfo: metadataFields, extendedMetadata}));
		console.info(response);
		close();
	};

	return (
		<>
			{/* Initialize overall form */}
			<Formik
				initialValues={snapshot}
				validationSchema={currentValidationSchema}
				onSubmit={(values) => handleSubmit(values)}
			>
				{/* Render wizard pages depending on current value of page variable */}
				{(formik) => {
					// eslint-disable-next-line react-hooks/rules-of-hooks
					useEffect(() => {
						formik.validateForm().then();
						// eslint-disable-next-line react-hooks/exhaustive-deps
					}, [page]);

					return (
						<>
							{/* Stepper that shows each step of wizard as header */}
							<WizardStepper
								steps={steps}
								page={page}
								setPage={setPage}
								completed={pageCompleted}
								setCompleted={setPageCompleted}
								formik={formik}
								hasAccessPage
							/>
							<div>
								{page === 0 && (
									<NewMetadataPage
										nextPage={nextPage}
										formik={formik}
										metadataFields={metadataFields}
										header={steps[page].translation}
									/>
								)}
								{page === 1 && (
									<NewMetadataExtendedPage
										nextPage={nextPage}
										previousPage={previousPage}
										formik={formik}
										extendedMetadataFields={extendedMetadata}
									/>
								)}
								{page === 2 && (
									<NewAccessPage
										nextPage={nextPage}
										previousPage={previousPage}
										formik={formik}
										editAccessRole="ROLE_UI_SERIES_DETAILS_ACL_EDIT"
									/>
								)}
								{page === 3 && (
									<NewThemePage
										nextPage={nextPage}
										previousPage={previousPage}
										formik={formik}
									/>
								)}
								{page === 4 && (
									<NewTobiraPage
										formik={formik}
										nextPage={nextPage}
										previousPage={previousPage}
									/>
								)}
								{page === 5 && (
									<NewSeriesSummary
										previousPage={previousPage}
										formik={formik}
										metaDataExtendedHidden={steps[1].hidden}
									/>
								)}
							</div>
						</>
					);
				}}
			</Formik>
		</>
	);
};

const getInitialValues = (
	metadataFields: MetadataCatalog,
	extendedMetadata: MetadataCatalog[],
	tobiraPage?: TobiraPage
) => {
	let initialValues = initialFormValuesNewSeries;

	// Transform metadata fields provided by backend (saved in redux)
	let metadataInitialValues = getInitialMetadataFieldValues(
		metadataFields,
		extendedMetadata
	);

	initialValues = { ...initialValues, ...metadataInitialValues }

	// // Add all initial form values known upfront listed in newSeriesConfig
	// for (const [key, value] of Object.entries(initialFormValuesNewSeries)) {
	// 	initialValues[key] = value;
	// }

	// Add tobira data if available
	// initialValues["breadcrumbs"] = [];

	// if (tobiraPage) {
	// 	initialValues["breadcrumbs"] = [tobiraPage];
	// }

	return initialValues;
};

export default NewSeriesWizard;
