
/**
 * Input Handlers
 * 
 * Allow for the creation of input elements without the need for boilerplate code and management. 
 * 
 * createInput for making inputs elements,
 * createInputGroup for multiple elements (especially vecs like colors and locations).
 */

//-- Take inspiration from the textbook too
//-- Not complete yet, presets for quick creation. As usual, all unsupported presets ignored.
export type InputPreset = 'pi' | 'degrees';

// Common attributes and configuration options for inputs
export interface InputOptions {

    // Given this is expanded to other attributes of inputs, just like HTML, any unqualified attributes will be ignored.
    // this is regarding using any attribute for type that doesnt use it.

    /**
     * Preset values for min, max and step.
     */
    preset?: InputPreset;
    // You can still override presets

    /**
     * Sets the min of the range input.
     * 
     * Defaults to 0 by HTML convention.
     */
    min?: number;

    /**
     * Sets the max of the range input.
     * 
     * Defaults to 100 by HTML convention.
     */
    max?: number;

    /**
     * Sets the input element step value.
     * 
     * Defaults to 1 by HTML convention.
     */
    step?: number;

    /**
     * The placeholder value.
     * 
     * Defaults to halfway point between min and max
     */
    value?: number;

    /**
     * Text for the label. 
     * 
     * Specifying labeltext enables {@linkcode label}.
     */
    labelText?: string;

    /**
     * Creates a label element for the input. 
     * 
     * If {@linkcode labelText} is not provided, defaults to name.
     */
    label?: boolean;

    /**
     * Allows quick addition to classlist of the input value.
     */
    inputClass?: string;

    /**
     * Provide enclosing div or not.
     */
    container?: boolean;

    /**
     * Allows quick addition to classlist of the {@linkcode container}.
     * 
     * Specifying container class enables {@linkcode container}.
     */
    containerClass?: string;

    /**
     * Element which the result will be appended to.
     */
    parent?: HTMLElement;
}


/**
 * Creates an input element of type range.
 * 
 * @param name The name of the input element and possibly the label if {@linkcode labelText} is not specified.
 * @-param container The HTMLElement holding the slider. - not yet
 * @param options Configurations and attributes for the element.
 * 
 * @returns HTMLInputElement.
 * 
 * @note This function only name functions only return the element, for more features like labelling and containers, resort to {@linkcode createInput}
 */
export function createSlider(name: string, options?: InputOptions) : HTMLInputElement {

    //-- type might not be included as that might be its own wrapper function.
    //-- handle presets
    //-- Might not add text type here cause it bloats the options and I really dont even see the need for it in this context
    const element = document.createElement('input');
    
    // element.id = name;
    element.name = name;
    element.type = 'range';

    //-- Add checks later, max>min, step reasonable, value reasonable (max-min/2)
    // min, max, step, value
    let min = options?.min ?? 0;
    let max = options?.max ?? 100;
    let step = options?.step ?? 1;
    let value = options?.value ?? 1;

    //! no known reason for max to be less than min
    //-- Maybe throw error
    if (max < min) {
        min = 0; max = 100;
    }
    if (value < min || value > max || (value % step) !== 0) { // check for ... or val not multiple of step 
        value = (max - min) / 2;
    }

    element.min = String(min);
    element.max = String(max);
    element.step = String(step);
    element.value = String(value);

    // Adding all classes to input
    if (options?.inputClass) {
        element.classList.add(...options.inputClass.split(' '));
    }

    return element;
}

/**
 * Returns an input element of type color.
 * 
 * @param name The name of the input element and possibly the label if {@linkcode labelText} is not specified.
 * @param options Configurations and attributes for the element.
 * 
 * @returns HTMLInputElement 
 * 
 * @note This function only name functions only return the element, for more features like labelling and containers, resort to {@linkcode createInput}.
 */
function createColorPicker(name: string, options?: InputOptions) : HTMLInputElement {
    
    const element = document.createElement('input');
    
    // element.id = name;
    element.name = name;
    element.type = 'color';

    // Adding all classes to input
    if (options?.inputClass) {
        element.classList.add(...options.inputClass.split(' '));
    }

    return element;
}

// Type for the createInput and createInputGroup functions
type InputResult = {
    input: HTMLElement;
    label?: HTMLElement;
    container?: HTMLElement;
    getValue: () => string | number;
    setValue: (val: string | number) => void;
}

/**
 * Returns an input element of given type. 
 * 
 * @param name The name of the input element and possibly the label if {@linkcode labelText} is not specified.
 * @param type The type of HTMLInputELement
 * @param options Configurations and attributes for the element.
 * @returns obj?
 */
export function createInput(name: string, type: string, options?: InputOptions) : InputResult {

    let element : HTMLInputElement;
    switch (type) {
        case 'range': element = createSlider(name, options); break;
        case 'color': element = createColorPicker(name, options); break;
        default: throw new Error(`Unsupported input type: ${type}`);
    }

    // result template
    const result: InputResult = {
        input: element,
        getValue: () => parseFloat(element.value),
        setValue: (val: string | number) => { element.value = String(val) },
    };

    // Adding label
    if (options?.labelText) options.label = true;
    if (options?.label) {
        const labelElem = document.createElement('label');
        labelElem.htmlFor = name;
        labelElem.innerHTML = options?.labelText ?? name;
        result.label = labelElem;
    }

    // Adding container
    if (options?.containerClass) options.container = true;
    if (options?.container || options?.containerClass){
        const containerElem = document.createElement('div');
        containerElem.append(element);
        if (result.label) containerElem.append(result.label);
        if (options.containerClass) {
            containerElem.classList.add(...options.containerClass.split(' '));
        } 
        result.container = containerElem;
    }

    return result;
}

// ! not done
/**
 * @param container The name of the input elements in the group - delineated by the axes.
 * 
 * @param axes The names of the individual elements in the group - determines the number of elements, arrangements and so on.
 * maybe add pre and post for better naming control or conventions
 * 
 * @param container The HTMLElement holding the slider div
 */
export function createInputGroup(name: string, type: string, axes : string[] = ['X', 'Y', 'Z'], options: InputOptions = {}) {
    
    const container = document.createElement('div');
    const sliders : { [key: string]: any } = {};
    console.log(type)
    
    //-- accomodate other types
    for (const axis of axes) {
        const axisName = `${name}-${axis}`;
        const slider = createSlider(axisName, {
            ...options,
            labelText: `${name} ${axis}`
        });

        sliders[axis.toLowerCase()] = slider;
        container.appendChild(slider);
        //-- need to accomodate more containers
    }

    //-- need to review type safety
    return {
        container,
        sliders,
        getValues: () => {
            const values : { [key: string]: any } = {};
            axes.forEach(axis => {
                values[axis.toLowerCase()] = sliders[axis.toLowerCase()].getValue();
            });
            return values;
        },
        setValues: (newValues : { [key: string]: any }  ) => {
            axes.forEach(axis => {
                if (newValues[axis.toLowerCase()] !== undefined) {
                    sliders[axis.toLowerCase()].setValue(newValues[axis.toLowerCase()]);
                }
            });
        }
    };
}
