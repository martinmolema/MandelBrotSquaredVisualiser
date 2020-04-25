export class Palette {
    constructor(maxIterations) {
        this.colors = [];
        this.offset = 0;
        this.maxIterations = maxIterations;
    }

    /**
     * Sets the new offset and recalculates the palette
     * @param {int} offset a percentage from 0-100 indicating how much of the total colorrange the palette should be offset
     */
    setOffset(offset) {
        this.offset = offset;
        this.calculate();
    }

    /**
     * Sort of an abstract class function
     */
    calculate() {
        // do nothing at top level.
    }

    restoreFromHistoryObject(historyObject) {
        this.colors = [...historyObject.colors];
        this.offset = historyObject.offset;
        this.maxIterations = historyObject.maxIterations;
    }


    createHistoryObject() {
        return {
            colors: [...this.colors],
            offset: this.offset,
            maxIterations: this.maxIterations,
        };
    }
} //class Palette


export class PaletteRGB extends Palette {
    constructor(maxIterations) {
        super(maxIterations);
        this.RGB_FILTER_R = (255 << 16);
        this.RGB_FILTER_G = (255 << 8);
        this.RGB_FILTER_B = (255);
        this.maxRange = 16581375; // 255 * 255 * 255, 3 bytes colorcode */

        this.calculate();
    }

    createHistoryObject() {
        return super.createHistoryObject();
    }

    /**
     * Recalculates the palette using the RGB method.
     */
    calculate() {
        super.calculate();
        for (let j = 0; j <= this.maxIterations; j++) {
            const ratio = j / this.maxIterations;
            let ratedRatio = Math.ceil(ratio * this.maxRange); // integer needed!
            ratedRatio += (this.offset / 100) * this.maxRange;
            ratedRatio = ratedRatio % this.maxRange;

            let RGB_R = (ratedRatio & this.RGB_FILTER_R) >> 16;
            let RGB_G = (ratedRatio & this.RGB_FILTER_G) >> 8;
            let RGB_B = (ratedRatio & this.RGB_FILTER_B);
            this.colors[j] = {
                r: RGB_R,
                g: RGB_G,
                b: RGB_B
            };
        }

    }

}

/**
 * A class to generate a palette using the HSL system
 */
export class PaletteHSL extends Palette {
    constructor(maxIterations) {
        super(maxIterations);
        this._lightness = 0.5;
        this._saturation = 1;

        this.calculate();
    }

    createHistoryObject() {
        const base = super.createHistoryObject();
        base.lightness = this._lightness * 100;
        base.saturation = this._saturation * 100;

        return base;
    }

    restoreFromHistoryObject(historyObject){
        super.restoreFromHistoryObject(historyObject);
        this.setSaturation(historyObject.saturation);
        this.setLightness(historyObject.lightness);
    }

    /**
     * Sets the _saturation as a percentage from 0-100%
     * @param {int} sat
     */
    setSaturation(sat) {
        this._saturation = sat / 100;
        this.calculate();
    }

    /**
     * Sets the _lightness as a percentage from 0-100%
     * @param {int} li
     */
    setLightness(li) {
        this._lightness = li / 100;
        this.calculate();
    }

    /**
     * Returns the saturation in the range from 0-100.
     * @returns {int}
     */
    saturation() {
        return (this._saturation * 100);
    }

    /**
     * Returns the lightness in the range from 0-100
     * @returns {number}
     */
    lightness() {
        return (this._lightness * 100);
    }

    /**
     * Recalculates the palette using the HSL/HSV system
     */
    calculate() {
        super.calculate();
        for (let j = 0; j <= this.maxIterations; j++) {
            let hue = (((this.offset / 100) + (j / this.maxIterations)) * 360) % 360;
            let saturation = this._saturation;
            let lightness = this._lightness;

            this.colors[j] = this.hslToRgb(hue, saturation, lightness);
        }

        return this;
    }// calculate()

    /**
     * calculate the RGB value from a given HSL value
     * @param hue
     * @param sat
     * @param light
     * @returns {{r: number, b: number, g: number}}
     */
    hslToRgb(hue, sat, light) {
        let t1, t2, r, g, b;
        hue = hue / 60;
        if (light <= 0.5) {
            t2 = light * (sat + 1);
        } else {
            t2 = light + sat - (light * sat);
        }
        t1 = light * 2 - t2;
        r = Math.round(this.hueToRgb(t1, t2, hue + 2) * 255);
        g = Math.round(this.hueToRgb(t1, t2, hue) * 255);
        b = Math.round(this.hueToRgb(t1, t2, hue - 2) * 255);
        return {r: r, g: g, b: b};
    }

    /*
    Convert a HSL-Hue to RGB value
     */
    hueToRgb(t1, t2, hue) {
        if (hue < 0) hue += 6;
        if (hue >= 6) hue -= 6;
        if (hue < 1) return (t2 - t1) * hue + t1;
        else if (hue < 3) return t2;
        else if (hue < 4) return (t2 - t1) * (4 - hue) + t1;
        else return t1;
    }
}

/**
 * A collection of instantiated palettes. serves as a container that can be saved to a history list.
 */
export class PaletteCollection {
    constructor() {
        this.palettes = {};
        this.current = {};
        this.currentName = "";
        this.names = [];
    }

    /**
     * This operates as a kind of Factory Pattern: based on the requested type a new object is created based on the proper class
     * @param {string} typename
     * @param {int} maxIterations
     * @returns {PaletteRGB|PaletteHSL} returns the added palette
     */
    addPalette(typename, maxIterations) {
        let palette;
        switch (typename) {
            case "RGB":
                palette = new PaletteRGB(maxIterations);
                break;
            case "HSL":
                palette = new PaletteHSL(maxIterations);
                break;
        }

        this.palettes[typename] = palette;
        this.names.push(typename);

        return palette;
    }//addPalette

    /**
     * sets the active palette.
     * @param {string} name
     * @returns {Palette|PaletteHSL|PaletteRGB} returns the palette that is now active
     */
    setActive(name) {
        this.currentName = name;
        this.current = this.palettes[name];
        return this.current;
    }

    getActive() {
        return this.current;
    }

    get(name) {
        return this.palettes[name];
    }

    /**
     * Creates a compound object that can be stored in history for safe restoring using the restoreFromHistoryObject
     * function. This is done by asking all the individual palettes in the list for a history object and adding in
     * the crucial properties of the object itself.
     * @returns {{currentName: string, items: []}}
     */
    createHistoryObject() {
        const hist = {
            items: [],
            currentName: this.currentName,
        };
        for (let i = 0; i < this.names.length; i++) {
            let name = this.names[i];
            let localPalet = this.get(name);
            let histObjPalet = localPalet.createHistoryObject();
            let palet = {
                name: name,
                palette: histObjPalet,
            };

            hist.items.push(palet);
        }

        return hist;
    }// createHistoryObject

    restoreFromHistoryObject(historyObject) {

        for (let i = 0; i < historyObject.items.length; i++) {
            let item = historyObject.items[i];
            let palet = this.palettes[item.name];
            palet.restoreFromHistoryObject(item.palette);
        }
        this.setActive(historyObject.currentName);
    }
}// PaletteCollection
