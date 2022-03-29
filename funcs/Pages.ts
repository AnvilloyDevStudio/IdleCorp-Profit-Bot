class Pages<T> {
    pages: T[][];
    limit: number;
    constructor(elements: T[]=[], limit=10) {
        this.pages = [];
        this.limit = limit;
        for (let a = 0; a<elements.length; a++) {
            if ((a)%limit===0) this.pages.push([]);
            this.pages[this.pages.length-1].push(elements[a]);
        }
        if (!this.pages.length) this.pages = [[]];
    }
    page(page: number) {
        return this.pages[page-1];
    }
    addpage(elements: T[]) {
        for (let a = 0; a<elements.length; a++) {
            if (this.pages[this.pages.length-1].length%this.limit===0) this.pages.push([]);
            this.pages[this.pages.length-1].push(elements[a]);
        }
        return this;
    }
    length = () => this.pages.length;
}
export {Pages};