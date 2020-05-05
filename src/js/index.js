import Search from "./models/Search";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";
import { renderLoader, clearLoader } from './views/base';
import Recipe from "./models/Recipe";

/* Global State of the App
- search object
- current recipe object
- shopping list object
- liked recipes
*/

// Search Controller

const state = {};

const controlSearch = async () => {
    // 1. Get query from view
    const query = searchView.getInput();
    // console.log(query); 

    if(query) {
        // 2. New search object and to addd to state
        state.search = new Search(query);
        // 3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(document.querySelector(".results"));
        
        try {
        // 4. search for results
        await state.search.getResults();
        // 5. Render results on UI
        clearLoader();
        searchView.renderResults(state.search.result);
        }
        catch(err) {
            alert("Something wrong with the search...");
            clearLoader();``
        }
       

    }
}

document.querySelector(".search").addEventListener("submit", e => {
   e.preventDefault();// To prevent the current action of reloading of page when we press Search button
   controlSearch();
});

document.querySelector(".results__pages").addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline"); // btn-inline parent element hai iss button ka
  if(btn) 
  {
      const goToPage = parseInt(btn.dataset.goto, 10);
      searchView.clearResults();
      searchView.renderResults(state.search.result, goToPage);
  }
});

// Recipe Controller

const controlRecipe = async () => {
//  Get id from url
const id = window.location.hash.replace("#", "");  // Here we point to the page url to change some of its content
    
    if(id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(document.querySelector(".recipe"));
        // Highlight selected search item
        if(state.search)
        searchView.highlightSelected(id);
        // Create new recipe object
        state.recipe = new Recipe(id);

        try {
        // Get recipe data and parse Ingredients
        await state.recipe.getRecipe();
        state.recipe.parseIngredients();
        // Calculate servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();
        // Render recipe
        clearLoader();
        recipeView.renderRecipe(
            state.recipe,
            state.likes.isLiked(id)
            );

    }
        catch(err)
        {
            console.log(err);
            alert("Error processing recipe!"); 
        }
        
    }
};

["hashchange", "load"].forEach(event => window.addEventListener(event, controlRecipe));

// List Controller

const controlList = () => {
//   creating new list if none is present
if(!state.list)
state.list = new List();

// Add each ingredient to list and UI
state.recipe.ingredients.forEach(el => {
 const item = state.list.addItem(el.count, el.unit, el.ingredient);
 listView.renderItem(item);
});
};

// Handle delete and update list item events
document.querySelector(".shopping__list").addEventListener("click", e => {
const id = e.target.closest(".shopping__item").dataset.itemid;
// handle delete button
if(e.target.matches(".shopping__delete, .shopping__delete *")) {
    state.list.deleteItem(id);
    listView.deleteItem(id);    
}
// handle count update
else if(e.target.matches(".shopping__count-value")) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
}

});

// Likes Controller

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to UI list
        likesView.renderLike(newLike);

    // User HAS liked current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    
    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


// Handling recipe button clicks
document.querySelector(".recipe").addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});