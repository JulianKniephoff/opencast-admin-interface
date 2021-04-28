import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import cn from "classnames";

const childRef = React.createRef();

/**
 * This component renders an editable field for multiple values depending on the type of the corresponding metadata
 */
const RenderMultiField = ({ fieldInfo, onlyCollectionValues=false, field, form, showCheck=false }) => {
    // Indicator if currently edit mode is activated
    const [editMode, setEditMode] = useState(false);
    // Temporary storage for value user currently types in
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        // Handle click outside the field and leave edit mode
        const handleClickOutside = e => {
            if(childRef.current && !childRef.current.contains(e.target)) {
                setEditMode(false);
            }
        }

        // Focus current field
        if (childRef && childRef.current && editMode === true) {
            childRef.current.focus();
        }

        // Adding event listener for detecting click outside
        window.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('mousedown', handleClickOutside);
        }
    }, []);

    // Handle change of value user currently types in
    const handleChange = e => {
        const itemValue = e.target.value;
        setInputValue(itemValue);
    };

    const handleKeyDown = (event) => {
        // Check if pressed key is Enter
        if (event.keyCode === 13 && inputValue !== "") {
            event.preventDefault();

            // Flag if only values of collection are allowed or any value
            if (onlyCollectionValues) {
                // add input to formik field value if not already added and input in collection of possible values
                if (!field.value.find(e => e === inputValue)
                    && fieldInfo.collection.find(e=> e.value === inputValue)) {
                    field.value[field.value.length] = inputValue;
                    form.setFieldValue(field.name, field.value);
                }
            } else {
                // add input to formik field value if not already added
                if (!field.value.find(e => e === inputValue)) {
                    field.value[field.value.length] = inputValue;
                    form.setFieldValue(field.name, field.value);
                }
            }

            // reset inputValue
            setInputValue("");
        }
    };

    // Remove item/value from inserted field values
    const removeItem = key => {
        field.value.splice(key, 1);
        form.setFieldValue(field.name, field.value);
    };

    return (
        // Render editable field for multiple values depending on type of metadata field
        // (types: see metadata.json retrieved from backend)
        editMode ? (
            <>
                {fieldInfo.type === "mixed_text" && !!fieldInfo.collection ? (
                    <EditMultiSelect collection={fieldInfo.collection}
                                     field={field}
                                     setEditMode={setEditMode}
                                     inputValue={inputValue}
                                     removeItem={removeItem}
                                     handleChange={handleChange}
                                     handleKeyDown={handleKeyDown}/>
                ) : (fieldInfo.type === "mixed_text" && (
                    <EditMultiValue setEditMode={setEditMode}
                                    field={field}
                                    inputValue={inputValue}
                                    removeItem={removeItem}
                                    handleChange={handleChange}
                                    handleKeyDown={handleKeyDown}/>
                ))}
            </>
        ) : (
            <ShowValue setEditMode={setEditMode}
                       field={field}
                       form={form}
                       showCheck={showCheck}/>
        )
    );
};

// Renders multi select
const EditMultiSelect = ({ collection, setEditMode, handleKeyDown, handleChange, inputValue, removeItem, field }) => {
    const { t } = useTranslation();

    return (
        <>
            <div ref={childRef}>
                <div onBlur={() => setEditMode(false)}>
                    <input type="text"
                           name={field.name}
                           value={inputValue}
                           onKeyDown={e => handleKeyDown(e)}
                           onChange={e => handleChange(e)}
                           placeholder={t('EDITABLE.MULTI.PLACEHOLDER')}
                           list="data-list"/>
                    {/* Display possible options for values as some kind of dropdown */}
                    <datalist id="data-list">
                        {collection.map((item, key) => (
                            <option key={key}>{item.value}</option>
                        ))}
                    </datalist>
                </div>
                {/* Render blue label for all values already in field array */}
                {(field.value instanceof Array && field.value.length !== 0) && (field.value.map((item, key) => (
                    <span className="ng-multi-value"
                          key={key}>
                        {item}
                        <a onClick={() => removeItem(key)}>
                            <i className="fa fa-times"/>
                        </a>
                    </span>
                )))}
            </div>
        </>
    );
};

// Renders editable field input for multiple values
const EditMultiValue = ({ setEditMode, inputValue, removeItem, handleChange, handleKeyDown, field }) => {
    const { t } = useTranslation();

    return (
        <>
            <div onBlur={() => setEditMode(false)}
                 ref={childRef}>
                <input type="text"
                       name={field.name}
                       onKeyDown={e => handleKeyDown(e)}
                       onChange={e => handleChange(e)}
                       value={inputValue}
                       placeholder={t('EDITABLE.MULTI.PLACEHOLDER')}/>
            </div>
            {(field.value instanceof Array && field.value.length !== 0) && (field.value.map((item, key) => (
                <span className="ng-multi-value"
                      key={key}>
                    {item}
                    <a onClick={() => removeItem(key)}>
                        <i className="fa fa-times" />
                    </a>
                </span>
            )))}
        </>
    );
};

// Shows the values of the array in non-edit mode
const ShowValue = ({ setEditMode, form: { initialValues }, field, showCheck }) => {
    return (
        <div onClick={() => setEditMode(true)}>
            {(field.value instanceof Array && field.value.length !== 0) ? (
                <ul>
                    {field.value.map((item, key) => (
                        <li key={key}>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <span className="editable preserve-newlines">
                    {""}
                </span>
            )}
            <i className="edit fa fa-pencil-square" />
            {showCheck && (
                <i className={cn("saved fa fa-check", { active: (initialValues[field.name] !== field.value)})}/>
            )}
        </div>
    )
}

export default RenderMultiField;
