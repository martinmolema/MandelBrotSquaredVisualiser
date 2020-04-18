export class Dimensions {
    constructor(w,h) {
        this.update(w,h);
    }
    update(w,h){
        this.w = w;
        this.h = h;
    }
}

export class Rectangle {
    constructor(x1, y1, x2, y2) {
        this.dimensions = new Dimensions(0,0);
        this.update(x1, y1, x2, y2);
    }

    update(x1, y1, x2, y2){
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;

        this.dimensions.w = Math.abs(x2 - x1);
        this.dimensions.h = Math.abs(y2 - y1);
    }
    clone(){
        return new Rectangle(this.x1, this.y1, this.x2, this.y2);
    }

}// Rectangle

