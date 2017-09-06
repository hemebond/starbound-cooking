var inventory = new Array();
var items_ingredients = new Array();
var items_recipes = new Array();

var effectNames = {
	'health': 'Bonus Health',
	'energy': 'Bonus Energy',
	'burning': 'Burning',
	'jump': 'Jump Boost',
	'nova': 'Nova',
	'thorns': 'Thorns',
	'rage': 'Rage',
	'run': 'Run Boost',
	'poisoned': 'Poisoned',
	'light': 'Light'
}






// Go through all the data and create lists for future use
for (var item in gameItems) {
	if ("ingredients" in gameItems[item]) {
		// create a list of items that are ingredients for other items
		for (ingredient in gameItems[item]['ingredients']) {
			if (items_ingredients.indexOf(ingredient) < 0) {
				items_ingredients.push(ingredient);
			}
		}

		// create a list of recipes (not pure ingredients)
		items_recipes.push(item);

		// add the raw ingredients to the item data
		if (gameItems[item]['rawIngredients'] === undefined) {
			gameItems[item]['rawIngredients'] = getRawIngredients(item);
		}
	}
}
var ingredientList = items_ingredients.sort();
var allRecipes = items_recipes.sort();



function findRecipes(inventoryItems) {
	var completeMatches = [];
	var partialMatches = [];

	for (var recipeId of items_recipes) {
		var recipe = gameItems[recipeId];

		var matchTally = 0;
		var rawMatchTally = 0;

		for (var inventoryItemId of inventoryItems) {
			if (inventoryItemId in recipe.ingredients) {
				matchTally++;
			}
			if (inventoryItemId in (recipe.rawIngredients || [])) {
				rawMatchTally++;
			}
		}

		if (matchTally == Object.keys(recipe.ingredients).length || rawMatchTally == Object.keys(recipe.rawIngredients).length) {
			completeMatches.push(recipeId);
		}
		else if (matchTally > 0 || rawMatchTally > 0) {
			partialMatches.push(recipeId);
		}
	}

	return {
		'complete': completeMatches,
		'partial': partialMatches
	}
}


function getRawIngredients(itemId) {
	var ingredients = gameItems[itemId]['ingredients'];
	if (ingredients == undefined) {
		// the item has no ingredients
		return null;
	}

	// store all the raw ingredients here
	var rawIngredients = {};

	for (var ingredient in ingredients) {
		raw = getRawIngredients(ingredient);

		if (raw == null) {
			// the item has no ingredients so just return it as-is
			rawIngredients[ingredient] = (rawIngredients[ingredient] || 0) + ingredients[ingredient];
		}
		else {
			//  go through the raw ingredients of the item and add them to the pile
			for (var rawItem in raw) {
				rawIngredients[rawItem] = (rawIngredients[rawItem] || 0) + raw[rawItem];
			}
		}
	}

	return rawIngredients
}


function updateIngredientItemList(items) {
	var ingredientButtons = '';

	for (var itemId of items.sort()) {
		ingredientButtons += '<a class="list-group-item" data-ingredient="'+ itemId +'">\
		                          <img src="images/ingredients/'+ itemId +'.png">\
		                          <span>'+ gameItems[itemId].name +'</span>\
		                          <i class="glyphicon glyphicon-chevron-right pull-right"></i>\
		                      </a>';
	}
	$('#ingredientItems').html(ingredientButtons);
}
updateIngredientItemList(ingredientList);



function updateInventoryList(items=[]) {
	var buttons = '';
	for (var i=0; i < inventory.length; i++) {
		var itemId = inventory[i];
		var item = gameItems[itemId];
		var itemName = item.name ? item.name : itemId;

		buttons += '<a class="list-group-item" data-ingredient="'+ itemId +'"><img src="images/ingredients/'+ itemId +'.png">'+ itemName +'</a>';
	}

	$('#inventory').html(buttons);
	updateRecipeLists();
}

function updateRecipeLists() {
	//
	// Update the page to show list of recipes
	//
	var recipes = findRecipes(inventory);
	updateMatchList(recipes.complete);
	updatePartialMatchList(recipes.partial);
}



function updateMatchList(recipes) {
	var numOfRecipes = recipes.length;
	var panels = '';

	for (var i=0; i < numOfRecipes; i++) {
		var recipeId = recipes[i];
		panels += makeRecipeCard(recipeId, 'recipesFull')
	}

	$('#recipesFull').html(panels);
}
function updatePartialMatchList(recipes) {
	var numOfRecipes = recipes.length;
	var panels = "";

	for (var i=0; i < numOfRecipes; i++) {
		var recipeId = recipes[i];
		panels += makeRecipeCard(recipeId, 'recipesPartial');
	}

	$('#recipesPartial').html(panels);
}


function makeRecipeCard(recipeId, parentElementId) {
	var recipe = gameItems[recipeId];
	var recipeName = recipe.name ? recipe.name : recipeId;
	var ingredients = Object.keys(recipe.ingredients);
	var rawIngredients = Object.keys(recipe.rawIngredients);
	var panel = '';

	panel += '<div class="panel panel-default">\
	              <div class="panel-heading"\
	                   id="recipe-panel-head-' + recipeId +'"\
	                   role="tab">\
	                  <h4 class="panel-title">\
	                      <a role="button"\
	                         data-toggle="collapse"\
	                         data-parent="#'+ parentElementId +'"\
	                         href="#recipe-panel-body-'+ recipeId +'"\
	                         aria-controls="recipe-panel-body-'+ recipeId +'">\
	                          <img src="images/ingredients/'+ recipeId +'.png">'+ recipeName +'</a>\
	                  </h4>\
	              </div>';

	panel += '<div id="recipe-panel-body-' + recipeId + '"\
	               class="panel-collapse collapse"\
	               role="tabpanel"\
	               aria-labelledby="recipe-panel-head-' + recipeId + '">\
	                   <div class="panel-body">';

	if ('effects' in recipe) {
		panel += '<div class="panel panel-default">\
		              <div class="panel-heading">\
		                  Status Effects\
		              </div>\
		              <ul class="list-group">';
		for (var effectId in recipe.effects) {
			var effect = recipe.effects[effectId];

			panel += '<li class="list-group-item"><img src="images/effects/'+ effectId +'.png">'+ effectNames[effectId] +' '+ (effect.bonus || '') +' ('+ effect.time +'s)</li>';
		}
		panel += '</ul></div>';
	}

	panel += '             <div class="panel panel-default">\
	                           <div class="panel-heading">\
	                               Ingredients\
	                           </div>\
	                           <ul class="list-group">';
	for (var j=0; j < ingredients.length; j++) {
		var ingredientId = ingredients[j];
		var ingredientName = gameItems[ingredientId].name;
		panel += '<li class="list-group-item"><img src="images/ingredients/' + ingredientId + '.png">' + ingredientName + '</li>';
	}
	panel += '</ul></div>';

	if ('rawIngredients' in recipe) {
		panel += '<div class="panel panel-default">\
		              <div class="panel-heading">\
		                  Raw Ingredients\
		              </div>\
		              <div class="panel-body">\
		                  <p>';
		for (var k=0; k < rawIngredients.length; k++) {
			var rawIngredientId = rawIngredients[k];
			var rawIngredientName = gameItems[rawIngredientId].name;
			panel += '<img alt="'+ rawIngredientName +'" src="images/ingredients/'+ rawIngredients[k] +'.png" title="'+ rawIngredientName +'">';
		}
		panel += '</p></div></div>';
	}
	panel += '</div></div></div>';

	panel.replace(/ +/g, ' ');

	return panel;
}


function moveItemToInventory(itemId) {
	// remove item from ingredient list
	ingredientList.splice(ingredientList.indexOf(itemId), 1);
	// add item to inventory list
	inventory.push(itemId);
}

function moveItemFromInventory(itemId) {
	// remove item from inventory list
	inventory.splice(inventory.indexOf(itemId), 1);
	// add item to ingredient list
	ingredientList.push(itemId);
}


/*
 * Attach the event listeners
 */
$('#ingredientItems').on('click', 'a', function() {
	//
	// Add the item to the inventory list and update the page
	//
	var element = $(this);
	var itemId = element.data('ingredient');
	moveItemToInventory(itemId);
	updateInventoryList();
	element.remove();
});
$('#inventory').on('click', 'a', function() {
	//
	//  Remove the item from the inventory and update the page
	//
	var element = $(this);
	var itemId = element.data('ingredient');
	moveItemFromInventory(itemId);
	updateIngredientItemList(ingredientList);
	updateRecipeLists();
	element.remove();
});
