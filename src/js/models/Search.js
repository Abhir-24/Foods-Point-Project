import axios from "axios";

export default class Search {
    constructor(query){
        this.query = query;
    }

    async getResults(query){
    try{
    const res = await axios(`https://forkify-api.herokuapp.com/api/search?&q=${this.query}`);
    //This is an AJAX call here which will return a promise in res.
    this.result = res.data.recipes;
    // console.log(this.result);
    }
    catch(error)
    {
        alert(error);
        
    }
}
}
