/**
 * Support for calculating with complex numbers
 * Author: Martin Molema
 * Date: 8 april 2020
 * Version: 1
 *
 */

export class ComplexNumber {
    /**
     * Constructor
     * @param real
     * @param imaginary
     */
    constructor(real, imaginary) {
        this.set(real, imaginary)
    }// constructor

    /**
     * Sets the values
     * @param real
     * @param imaginary
     */
    set(real, imaginary){
        this.real = real;
        this.imaginary = imaginary;

    }// set()

    /**
     * Converts to a human readable string
     * @returns {string}
     */
    toString() {
        var result = "";
        if (this.real !== 0) {
            result += this.real.toString();
        }
        if (this.imaginary == 0) {
            // do nothing
        } else if (this.imaginary < 0) {
            result += " - " + (-1 * this.imaginary).toString() + "i";
        } else {
            result += " + " + this.imaginary.toString() + "i";
        }

        return result;
    }// toString()

    /**
     * Squares the complexnumber; the object is immediately changed in place
     */
    sqr() {
        // multiply by itself by passing a clone of itself
        this.multiply(this.clone());
        return this;
    }

    /**
     * Multiplies the object with a given other complex number
     * @param other
     * @returns {ComplexNumber}
     */
    multiply(other) {
        /**
         * (a + bi) (c + di) = (ac−bd) + (ad+bc)i
         */

        const newReal = (this.real * other.real - this.imaginary * other.imaginary);
        const newImaginary = (this.real * other.imaginary + this.imaginary * other.real);

        this.real = newReal;
        this.imaginary = newImaginary;

        return this;
    }// multiply

    /**
     * Adds an other complex number to this object
     * @param other
     */
    add(other) {
        this.real      += other.real;
        this.imaginary += other.imaginary;
    }// add

    /**
     * Subtracts an other complex number from this one
     * @param other
     */
    subtract(other) {
        this.real      -= other.real;
        this.imaginary -= other.imaginary;
    }// subtract

    /**
     *  Calculates the distance between this complex number and another given complex number
     *  Uses Pythagoras
     * @param other
     */
    distance(other){
        /**
         *  P = (a + bi), this object
         *  Q = (c + di), another given complex number
         * Distance (P,Q) = SQRT ( (a - b)^2 + (b - d)^2 )
         */
        const p1 = this.real - other.real;
        const p2 = this.imaginary - other.imaginary;

        const distance = Math.sqrt(p1 * p1   + p2 * p2 );

        return distance;
    }// dinstance

    /**
     * Return true if this complex number has a distance to another complex number that is smaller than Epsilon
     * @param other
     * @param epsilon
     * @returns {boolean}
     */
    isDistanceSmallerThan(other, epsilon) {
        return (this.distance(other) < epsilon);
    }// isDistanceSmallerThan

    /**
     * Create a clone of itself
     * @returns {ComplexNumber}
     */
    clone(){
        var newCN = new ComplexNumber(this.real, this.imaginary);
        return newCN;
    }// clone

    /**
     * Copies the values of another complex number to this object
     * @param other
     */
    copy (other) {
        this.real = other.real;
        this.imaginary = other.imaginary;
    }// copy
}


