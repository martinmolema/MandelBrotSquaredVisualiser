/**
 * A history list, so objects can be stored as a stack (last in first out). The history is persisted in the local storage
 * of the browser.
 */
export class HistoryList {
    /**
     * Creates the empty history for zoom objects
     * @param {string} storagekey a key to store and retrieve the items
     * @constructor
     */
    constructor(storagekey) {

        this.key = storagekey;
        var items = localStorage.getItem(this.key);

        if (items === null) {
            this.historyitems = [];
        }
        else{
            this.historyitems = JSON.parse(items);
        }
    }// constructor


    /**
     * Converts the parameter 'constants' to its basic components so it can be added to history
     * @param {Object} historyObject
     * @returns {number} the number of items in the list after addition
     */
    push(historyObject){
        this.historyitems.push(historyObject);

        this.save();

        return this.length();
    }//push

    /**
     * Removes one item from the history and returns this item
     * @returns {|NULL}
     */
    pop(){
        if (this.historyitems.length == 0) return null;
        const result = this.historyitems.pop();

        this.save();

        return result;
    }

    /**
     * Gets the last item from the history without removing it from the list
     * @returns {null | Object}
     */
    peek() {
        if (this.historyitems.length == 0) return null;

        return this.historyitems[this.historyitems.length - 1];
    }// peek ()
    /**
     * Saves the array to the local storage of the browser
     */
    save(){
        localStorage.setItem(this.key, JSON.stringify(this.historyitems));
    }

    /**
     * Clears the list
     */
    Clear(){
        this.historyitems.length = 0;
        localStorage.setItem(this.key,JSON.stringify(this.historyitems));
    }

    /**
     * returns the number of items in the list
     * @returns {number}
     */
    length(){
        return this.historyitems.length;
    }
}
